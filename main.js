import Fuse from 'fuse.js';

let verseList = [];
let bookIndex = {};
let fuse;
let debounceTimer;

function parseRef(ref) {
  const m = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  return m ? { book: m[1], chapter: parseInt(m[2]), verse: parseInt(m[3]) } : null;
}

async function loadBible() {
  const res = await fetch('/data/verses-1769.json');
  const data = await res.json();

  verseList = [];
  const raw = new Map();

  for (const [ref, text] of Object.entries(data)) {
    const p = parseRef(ref);
    if (!p) continue;
    verseList.push({ ref, text });
    if (!raw.has(p.book)) raw.set(p.book, new Map());
    const chMap = raw.get(p.book);
    if (!chMap.has(p.chapter)) chMap.set(p.chapter, []);
    chMap.get(p.chapter).push({ ref, text, verse: p.verse });
  }

  for (const [ref] of Object.entries(data)) {
    const p = parseRef(ref);
    if (!p || bookIndex[p.book]) continue;
    const chMap = raw.get(p.book);
    const chapters = {};
    for (const [num, verses] of chMap) {
      chapters[num] = verses.sort((a, b) => a.verse - b.verse);
    }
    bookIndex[p.book] = { name: p.book, chapters };
  }

  fuse = new Fuse(verseList, {
    keys: ['text', 'ref'],
    threshold: 0.3,
    includeMatches: true
  });

  const hash = location.hash.slice(1);
  if (hash) {
    const m = hash.match(/^(.+?)-(\d+)-(\d+)$/);
    if (m) {
      loadChapter(`${m[1].replace(/_/g, ' ')} ${m[2]}:${m[3]}`);
      return;
    }
  }
  showRandomVerse();
}

function showRandomVerse() {
  const entry = verseList[Math.floor(Math.random() * verseList.length)];
  renderEntries([entry], 'home');
}

function doSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const q = document.getElementById('search-input').value.trim();
    if (!q) { showRandomVerse(); return; }
    const results = fuse.search(q);
    renderEntries(results.map(r => ({
      ref: r.item.ref, text: r.item.text, highlight: q
    })), 'search');
  }, 120);
}

function loadChapter(ref) {
  const p = parseRef(ref);
  if (!p) return;
  const book = bookIndex[p.book];
  if (!book) return;
  const ch = book.chapters[p.chapter];
  if (!ch) return;

  renderEntries(ch, 'chapter');

  const hash = `#${p.book.replace(/\s/g, '_')}-${p.chapter}-${ch[0].verse}`;
  history.pushState(null, '', hash);
  document.getElementById('search-input').value = '';
}

function renderEntries(entries, mode) {
  const container = document.getElementById('results');
  container.innerHTML = '';

  if (mode === 'chapter') {
    const p = parseRef(entries[0].ref);
    const h = document.createElement('div');
    h.className = 'chapter-heading';
    h.textContent = `${p.book} ${p.chapter}`;
    container.appendChild(h);
  }

  entries.forEach((entry, i) => {
    const el = document.createElement('div');
    el.className = 'result-item';
    el.style.animationDelay = `${i * 24}ms`;

    const text = document.createElement('div');
    text.className = 'result-text';
    if (entry.highlight) {
      const esc = entry.highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text.innerHTML = entry.text.replace(
        new RegExp(`(${esc})`, 'gi'),
        '<span class="result-highlight">$1</span>'
      );
    } else {
      text.textContent = entry.text;
    }

    const ref = document.createElement('div');
    ref.className = 'result-ref';
    ref.textContent = `\u2014 ${entry.ref}`;

    el.appendChild(text);
    el.appendChild(ref);

    if (mode !== 'chapter') {
      el.addEventListener('click', () => loadChapter(entry.ref));
    }

    container.appendChild(el);
  });
}

const input = document.getElementById('search-input');
input.addEventListener('input', doSearch);

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== input) {
    e.preventDefault();
    input.focus();
  }
  if (e.key === 'Escape') {
    input.value = '';
    showRandomVerse();
    input.blur();
  }
});

window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  if (!hash) { showRandomVerse(); return; }
  const m = hash.match(/^(.+?)-(\d+)-(\d+)$/);
  if (m) loadChapter(`${m[1].replace(/_/g, ' ')} ${m[2]}:${m[3]}`);
});

loadBible();
