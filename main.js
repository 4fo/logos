import FlexSearch from 'flexsearch';

let verseList = [];
let bookIndex = {};
let searchIndex = null;
let debounceTimer;
let ready = false;

function parseRef(ref) {
  const m = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  return m ? { book: m[1], chapter: parseInt(m[2]), verse: parseInt(m[3]) } : null;
}

function refScore(ref, query) {
  const q = query.toLowerCase().trim();
  const r = ref.toLowerCase();
  if (r === q) return 5;
  if (r.startsWith(q)) return 4;
  const words = q.split(/\s+/);
  let last = -1;
  for (const w of words) {
    const i = r.indexOf(w, last + 1);
    if (i === -1) return 1;
    last = i;
  }
  return 3;
}

function showError(msg) {
  const container = document.getElementById('results');
  container.innerHTML = `<div class="error-msg">${msg}</div>`;
}

async function loadBible() {
  try {
    const base = import.meta.env.BASE_URL;
    const res = await fetch(`${base}data/verses-1769.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

    const idx = new FlexSearch.Index({ tokenize: 'forward' });
    verseList.forEach((v, i) => idx.add(i, `${v.ref} ${v.text}`));
    searchIndex = idx;

    ready = true;
    input.focus();

    const hash = location.hash.slice(1);
    if (hash) {
      const m = hash.match(/^(.+?)-(\d+)-(\d+)$/);
      if (m) {
        loadChapter(`${m[1].replace(/_/g, ' ')} ${m[2]}:${m[3]}`);
        return;
      }
    }
    showRandomVerse();
  } catch (err) {
    showError(`Error loading data: ${err.message}`);
    console.error(err);
  }
}

function showRandomVerse() {
  if (!verseList.length) { showError('No verses loaded.'); return; }
  const entry = verseList[Math.floor(Math.random() * verseList.length)];
  renderEntries([entry], 'home');
}

function doSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!ready) return;
    const q = document.getElementById('search-input').value.trim();
    if (!q) { showRandomVerse(); return; }
    const ids = searchIndex.search(q);
    ids.sort((a, b) => refScore(verseList[b].ref, q) - refScore(verseList[a].ref, q) || a - b);
    renderEntries(ids.map(id => ({
      ref: verseList[id].ref, text: verseList[id].text, highlight: q
    })), 'search');
  },   99);
}

function loadChapter(ref) {
  if (!ready) return;
  const p = parseRef(ref);
  if (!p) return;
  const book = bookIndex[p.book];
  if (!book) return;
  const ch = book.chapters[p.chapter];
  if (!ch) return;

  renderEntries(ch, 'chapter');

  const hash = `#${p.book.replace(/\s/g, '_')}-${p.chapter}-${ch[0].verse}`;
  history.pushState(null, '', hash);
  input.value = '';
  clearBtn.classList.remove('visible');
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

  requestAnimationFrame(() => {
    const items = container.querySelectorAll('.result-item');
    const viewH = window.innerHeight;
    let visible = 0;
    items.forEach(el => {
      if (el.getBoundingClientRect().top < viewH) {
        el.style.animationDelay = `${visible++ * 33}ms`;
      }
    });
  });
}

function applyTheme(light) {
  document.body.classList.toggle('light', light);
  document.getElementById('theme-toggle').textContent = light ? '\u{1F31B}' : '\u{1F319}';
}

const saved = localStorage.getItem('logos-theme');
if (saved === 'light') applyTheme(true);

document.getElementById('theme-toggle').addEventListener('click', () => {
  const light = document.body.classList.toggle('light');
  localStorage.setItem('logos-theme', light ? 'light' : 'dark');
  document.getElementById('theme-toggle').textContent = light ? '\u{1F31B}' : '\u{1F319}';
});

document.querySelector('.title').addEventListener('click', () => {
  if (!ready) return;
  document.getElementById('search-input').value = '';
  clearBtn.classList.remove('visible');
  history.pushState(null, '', window.location.pathname);
  showRandomVerse();
});

const input = document.getElementById('search-input');
input.addEventListener('input', doSearch);

const clearBtn = document.getElementById('search-clear');

input.addEventListener('input', () => {
  clearBtn.classList.toggle('visible', input.value.length > 0);
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  clearBtn.classList.remove('visible');
  if (ready) showRandomVerse();
  input.focus();
});

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== input) {
    e.preventDefault();
    input.focus();
  }
  if (e.key === 'Escape') {
    input.value = '';
    clearBtn.classList.remove('visible');
    if (ready) showRandomVerse();
    input.blur();
  }
});

window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  if (!hash) { if (ready) showRandomVerse(); return; }
  const m = hash.match(/^(.+?)-(\d+)-(\d+)$/);
  if (m) loadChapter(`${m[1].replace(/_/g, ' ')} ${m[2]}:${m[3]}`);
});

function onScroll() {
  const r = Math.min(window.scrollY / 80, 1);
  const h = document.getElementById('header');
  const t = document.querySelector('.title');
  const pb = 24 - r * 12;
  h.style.paddingTop = (48 - r * 40) + 'px';
  h.style.paddingBottom = pb + 'px';
  const headerTop = h.getBoundingClientRect().top;
  const searchBottom = document.getElementById('search-container').getBoundingClientRect().bottom;
  h.style.setProperty('--ft', (searchBottom - headerTop) + 'px');
  h.style.setProperty('--fo', r);
  t.style.fontSize = (2 - r * 1.2) + 'rem';
  t.style.marginBottom = (32 - r * 24) + 'px';
  t.style.opacity = 0.5 - r * 0.2;
  t.style.letterSpacing = (6 - r * 3) + 'px';
}
window.addEventListener('scroll', onScroll, { passive: true });

loadBible();
