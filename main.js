import Fuse from 'fuse.js';

let bible = { books: [] };
let bookLookup = {};
let fuse;

function parseRef(ref) {
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return null;
  return { book: match[1], chapter: parseInt(match[2]), verse: parseInt(match[3]) };
}

async function loadBible() {
  const res = await fetch('/data/verses-1769.json');
  const data = await res.json();

  const verseList = [];
  const bookMap = new Map();

  for (const [ref, text] of Object.entries(data)) {
    const parsed = parseRef(ref);
    if (!parsed) continue;
    verseList.push({ ref, text });

    if (!bookMap.has(parsed.book)) bookMap.set(parsed.book, new Map());
    const chMap = bookMap.get(parsed.book);
    if (!chMap.has(parsed.chapter)) chMap.set(parsed.chapter, []);
    chMap.get(parsed.chapter).push({ verse: parsed.verse, ref, text });
  }

  const seen = new Set();
  for (const [ref] of Object.entries(data)) {
    const parsed = parseRef(ref);
    if (!parsed || seen.has(parsed.book)) continue;
    seen.add(parsed.book);

    const chMap = bookMap.get(parsed.book);
    const chapters = [];
    for (const [num, verses] of chMap) chapters.push({ num, verses });
    chapters.sort((a, b) => a.num - b.num);

    bible.books.push({ name: parsed.book, chapters });
    bookLookup[parsed.book] = bible.books[bible.books.length - 1];
  }

  fuse = new Fuse(verseList, {
    keys: ['text', 'ref'],
    threshold: 0.3,
    includeMatches: true
  });

  renderSidebar();
  handleHash();
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = '<div class="sidebar-header"><h3>BOOKS</h3></div>';

  for (const book of bible.books) {
    const bookEl = document.createElement('div');
    bookEl.className = 'book-item';

    const nameEl = document.createElement('span');
    nameEl.className = 'book-name';
    nameEl.textContent = book.name;

    const chList = document.createElement('div');
    chList.className = 'chapter-list';

    for (const ch of book.chapters) {
      const chEl = document.createElement('span');
      chEl.className = 'chapter-link';
      chEl.textContent = ch.num;
      chEl.dataset.book = book.name;
      chEl.dataset.chapter = ch.num;
      chEl.addEventListener('click', e => {
        e.stopPropagation();
        loadChapter(book.name, ch.num);
      });
      chList.appendChild(chEl);
    }

    nameEl.addEventListener('click', e => {
      e.stopPropagation();
      const expanded = bookEl.classList.toggle('expanded');
    });

    bookEl.appendChild(nameEl);
    bookEl.appendChild(chList);
    sidebar.appendChild(bookEl);
  }
}

function loadChapter(bookName, chapterNum) {
  const book = bookLookup[bookName];
  if (!book) return;
  const ch = book.chapters.find(c => c.num === chapterNum);
  if (!ch) return;

  const content = document.getElementById('content');
  content.innerHTML = `<h2 class="chapter-heading">${bookName} ${chapterNum}</h2>`;

  for (const v of ch.verses) {
    content.appendChild(createVerseEl(v.ref, v.text));
  }

  document.getElementById('page').scrollTop = 0;

  const hash = `#${bookName.replace(/\s+/g, '_')}-${chapterNum}-${ch.verses[0].verse}`;
  history.pushState(null, '', hash);

  document.querySelectorAll('.book-item').forEach(b => b.classList.remove('active'));
  const sidebarLinks = document.querySelectorAll('.chapter-link');
  sidebarLinks.forEach(l => {
    if (l.dataset.book === bookName && parseInt(l.dataset.chapter) === chapterNum) {
      l.closest('.book-item').classList.add('active');
    }
  });
}

function createVerseEl(ref, text, highlight = '') {
  const div = document.createElement('div');
  div.className = 'verse';
  div.id = ref.replace(/[\s:]/g, '-');

  let displayText = text;
  if (highlight) {
    const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    displayText = text.replace(regex, '<mark class="highlight">$1</mark>');
  }

  div.innerHTML = `<sup class="verse-num">${ref.split(':')[1]}</sup> ${displayText}`;

  div.addEventListener('dblclick', () => showLoupe(ref, text));

  return div;
}

function showLoupe(ref, text) {
  const existing = document.querySelector('.loupe-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'loupe-overlay';
  overlay.innerHTML = `
    <div class="loupe-content">
      <div class="loupe-close">&times;</div>
      <div class="loupe-ref">${ref}</div>
      <div class="loupe-text">${text}</div>
    </div>
  `;
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.closest('.loupe-close')) overlay.remove();
  });
  document.body.appendChild(overlay);
}

function handleSearch() {
  const query = document.getElementById('search-input').value.trim();
  if (!query || !fuse) return;

  const results = fuse.search(query);
  const content = document.getElementById('content');
  content.innerHTML = `<h2 class="search-heading">Search: &ldquo;${query}&rdquo; (${results.length})</h2>`;

  for (const r of results) {
    content.appendChild(createVerseEl(r.item.ref, r.item.text, query));
  }
}

document.getElementById('search-btn').addEventListener('click', handleSearch);
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSearch();
});

function handleHash() {
  const hash = location.hash.slice(1);
  if (!hash) {
    loadChapter('Genesis', 1);
    return;
  }

  const match = hash.match(/^(.+?)-(\d+)-(\d+)$/);
  if (!match) return;

  const bookName = match[1].replace(/_/g, ' ');
  const chapterNum = parseInt(match[2]);
  const verseNum = parseInt(match[3]);

  loadChapter(bookName, chapterNum);

  setTimeout(() => {
    const id = `${bookName.replace(/\s+/g, '-')}-${chapterNum}-${verseNum}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

window.addEventListener('hashchange', handleHash);

let isDragging = false;
let startX, startY, scrollLeft, scrollTop;
const page = document.getElementById('page');

page.addEventListener('mousedown', e => {
  if (e.target.closest('input, button, .chapter-link, .book-name, .loupe-overlay')) return;
  isDragging = true;
  startX = e.pageX - page.offsetLeft;
  startY = e.pageY - page.offsetTop;
  scrollLeft = page.scrollLeft;
  scrollTop = page.scrollTop;
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - page.offsetLeft;
  const y = e.pageY - page.offsetTop;
  page.scrollLeft = scrollLeft - (x - startX);
  page.scrollTop = scrollTop - (y - startY);
});

window.addEventListener('mouseup', () => isDragging = false);

document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.getElementById('theme-toggle').textContent =
    document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

document.addEventListener('keydown', e => {
  if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    document.getElementById('search-input').focus();
  }
  if (e.key === 'Escape') {
    document.querySelector('.loupe-overlay')?.remove();
  }
});

loadBible();
