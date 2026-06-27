import FlexSearch from 'flexsearch';

let verseList = [];
let bookIndex = {};
let searchIndex = null;
let debounceTimer;
let ready = false;
let current = null;
let container;
let renderedChapters = [];
let isFetching = false;
let searchResults = [];
let searchCursor = 0;
let searchSentinel = null;
let searchObserver = null;
let searchReady = false;
const BATCH_SIZE = 30;

const chObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const block = entry.target;
      setChapterBadge(`${block.dataset.book} ${block.dataset.chapter}:1`);
    }
  }
}, { rootMargin: '-80px 0px -85% 0px' });

function parseRef(ref) {
  const m = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  return m ? { book: m[1], chapter: parseInt(m[2]), verse: parseInt(m[3]) } : null;
}

function refScore(ref, query) {
  const q = query.toLowerCase().trim().replace(/(\d+)\s+(\d+)/g, '$1:$2');
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
  container.innerHTML = `<div class="error-msg">${msg}</div>`;
}

// ─── Theme ──────────────────────────────────────────────

const themePills = document.querySelectorAll('.pill');

function setTheme(theme) {
  localStorage.setItem('logos-theme', theme);
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme !== 'system') root.classList.add(theme);
  themePills.forEach(p => p.classList.toggle('active', p.dataset.theme === theme));
}

const savedTheme = localStorage.getItem('logos-theme') || 'system';
setTheme(savedTheme);
themePills.forEach(p => p.addEventListener('click', () => setTheme(p.dataset.theme)));

// ─── Settings panel ─────────────────────────────────────

const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsClose = document.getElementById('settings-close');

settingsBtn.addEventListener('click', e => {
  e.stopPropagation();
  settingsPanel.classList.toggle('visible');
});

settingsClose.addEventListener('click', e => {
  e.stopPropagation();
  settingsPanel.classList.remove('visible');
});

document.addEventListener('click', e => {
  if (settingsPanel.classList.contains('visible') && !settingsPanel.contains(e.target) && e.target !== settingsBtn) {
    settingsPanel.classList.remove('visible');
  }
});

// ─── Text size ──────────────────────────────────────────

let textScale = parseFloat(localStorage.getItem('logos-text-scale')) || 1;

function applyScale(s) {
  textScale = Math.max(0.7, Math.min(1.5, s));
  localStorage.setItem('logos-text-scale', textScale);
  document.documentElement.style.setProperty('--text-scale', textScale);
  document.getElementById('size-display').textContent = Math.round(textScale * 100) + '%';
}

document.getElementById('size-down').addEventListener('click', () => applyScale(textScale - 0.1));
document.getElementById('size-up').addEventListener('click', () => applyScale(textScale + 0.1));
applyScale(textScale);

// ─── Layout toggle ──────────────────────────────────────

let layout = localStorage.getItem('logos-layout') || 'verse';
const layoutToggle = document.getElementById('layout-toggle');

function applyLayout(l) {
  layout = l;
  localStorage.setItem('logos-layout', l);
  layoutToggle.textContent = l === 'verse' ? 'Verse per line' : 'Paragraph';
  if (current) initChapterView(current.book, current.chapter);
}

layoutToggle.addEventListener('click', () => {
  applyLayout(layout === 'verse' ? 'paragraph' : 'verse');
});
applyLayout(layout);

// ─── Chapter helpers ────────────────────────────────────

function getNextChapterPos(pos) {
  if (!pos) return null;
  const book = bookIndex[pos.book];
  if (!book) return null;
  const chapters = Object.keys(book.chapters).map(Number).sort((a, b) => a - b);
  const idx = chapters.indexOf(pos.chapter);
  if (idx < chapters.length - 1) return { book: pos.book, chapter: chapters[idx + 1] };
  const books = Object.keys(bookIndex);
  const bi = books.indexOf(pos.book);
  if (bi < books.length - 1) return { book: books[bi + 1], chapter: 1 };
  return null;
}

function getPrevChapterPos(pos) {
  if (!pos) return null;
  const book = bookIndex[pos.book];
  if (!book) return null;
  const chapters = Object.keys(book.chapters).map(Number).sort((a, b) => a - b);
  const idx = chapters.indexOf(pos.chapter);
  if (idx > 0) return { book: pos.book, chapter: chapters[idx - 1] };
  const books = Object.keys(bookIndex);
  const bi = books.indexOf(pos.book);
  if (bi > 0) {
    const lastCh = Math.max(...Object.keys(bookIndex[books[bi - 1]].chapters).map(Number));
    return { book: books[bi - 1], chapter: lastCh };
  }
  return null;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.remove('visible'), 2200);
}

function copyVerse(text, ref) {
  navigator.clipboard.writeText(`${text} \u2014 ${ref}`).then(() => showToast('Verse copied'));
}

function createDivider(book, chapter) {
  const div = document.createElement('div');
  div.className = 'ch-divider';
  div.innerHTML = `
    <span class="ch-divider-line"></span>
    <span class="ch-divider-label">${book} ${chapter}</span>
    <span class="ch-divider-line"></span>
  `;
  return div;
}

function createChapterBlock(book, chapter) {
  const p = bookIndex[book];
  if (!p) return null;
  const ch = p.chapters[chapter];
  if (!ch) return null;

  const block = document.createElement('div');
  block.className = 'chapter-block';
  block.dataset.book = book;
  block.dataset.chapter = chapter;
  block.appendChild(createDivider(book, chapter));

  if (layout === 'paragraph') {
    const item = document.createElement('div');
    item.className = 'result-item paragraph-mode';
    const textDiv = document.createElement('div');
    textDiv.className = 'result-text';
    textDiv.innerHTML = ch.map(e =>
      `<span class="inline-ref" data-text="${e.text.replace(/"/g, '&quot;')}">${e.verse}</span> ${e.text}`
    ).join(' ');
    textDiv.addEventListener('click', e => {
      const span = e.target.closest('.inline-ref');
      if (!span) return;
      e.stopPropagation();
      copyVerse(span.dataset.text, `${book} ${chapter}:${span.textContent}`);
    });
    item.appendChild(textDiv);
    block.appendChild(item);
  } else {
    ch.forEach(e => {
      const item = document.createElement('div');
      item.className = 'result-item';
      const text = document.createElement('div');
      text.className = 'result-text';
      text.textContent = e.text;
      const ref = document.createElement('div');
      ref.className = 'result-ref';
      ref.textContent = `\u2014 ${e.ref}`;
      ref.addEventListener('click', e => {
        e.stopPropagation();
        const t = e.currentTarget.parentElement.querySelector('.result-text').textContent;
        copyVerse(t, e.currentTarget.textContent.replace('\u2014 ', ''));
      });
      item.appendChild(text);
      item.appendChild(ref);
      block.appendChild(item);
    });
  }

  return block;
}

function animateBlockItems(block) {
  const items = block.querySelectorAll('.result-item');
  const viewH = window.innerHeight;
  let visible = 0;
  items.forEach(el => {
    const top = el.getBoundingClientRect().top;
    el.style.animation = 'none';
    el.getBoundingClientRect();
    if (top < viewH && top > 130) {
      el.style.animation = 'fadeUp 0.4s ease forwards';
      el.style.animationDelay = `${visible++ * 33}ms`;
    } else {
      el.style.animation = 'fadeUp 0.4s ease forwards';
      el.style.animationDelay = '0ms';
    }
  });
}

function initChapterView(book, chapter) {
  container.innerHTML = '';
  renderedChapters = [];
  current = { book, chapter };
  const block = createChapterBlock(book, chapter);
  if (!block) return;
  container.appendChild(block);
  renderedChapters.push({ book, chapter });
  chObserver.observe(block);
  requestAnimationFrame(() => animateBlockItems(block));
}

function appendChapter(pos, where) {
  if (!pos) return;
  const block = createChapterBlock(pos.book, pos.chapter);
  if (!block) return;
  if (where === 'prepend') {
    container.insertBefore(block, container.firstChild);
    renderedChapters.unshift(pos);
  } else {
    container.appendChild(block);
    renderedChapters.push(pos);
  }
  chObserver.observe(block);
  requestAnimationFrame(() => animateBlockItems(block));
}

// ─── Bible data loading ─────────────────────────────────

async function loadBible() {
  container = document.getElementById('results');

  let touchStartX = 0, touchStartY = 0;
  container.addEventListener('touchstart', e => {
    if (!current) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  container.addEventListener('touchend', e => {
    if (!current || isFetching) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      isFetching = true;
      const target = dx > 0
        ? getPrevChapterPos(renderedChapters[0])
        : getNextChapterPos(renderedChapters[renderedChapters.length - 1]);
      if (target) initChapterView(target.book, target.chapter);
      isFetching = false;
    }
  }, { passive: true });
  container.addEventListener('wheel', e => {
    if (!current || !e.shiftKey || isFetching) return;
    e.preventDefault();
    isFetching = true;
    const target = e.deltaX > 0
      ? getNextChapterPos(renderedChapters[renderedChapters.length - 1])
      : getPrevChapterPos(renderedChapters[0]);
    if (target) initChapterView(target.book, target.chapter);
    isFetching = false;
  }, { passive: false });

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

    ready = true;
    input.focus();

    const hash = location.hash.slice(1);
    if (hash) {
      const m = hash.match(/^(.+?)-(\d+)-(\d+)$/);
      if (m) loadChapter(`${m[1].replace(/_/g, ' ')} ${m[2]}:${m[3]}`);
    }
    if (!current) showRandomVerse();

    const idx = new FlexSearch.Index({ tokenize: 'forward' });
    verseList.forEach((v, i) => idx.add(i, `${v.ref} ${v.text}`));
    searchIndex = idx;
    searchReady = true;
  } catch (err) {
    showError(`Error loading data: ${err.message}`);
    console.error(err);
  }
}

// ─── Render ─────────────────────────────────────────────

function showRandomVerse() {
  if (!verseList.length) { showError('No verses loaded.'); return; }
  cleanupSearchObserver();
  current = null;
  renderedChapters = [];
  const entry = verseList[Math.floor(Math.random() * verseList.length)];
  container.innerHTML = '';
  renderEntries([entry], 'home');
  setChapterBadge(entry.ref);
}

function setChapterBadge(ref) {
  const p = parseRef(ref);
  document.getElementById('chapter-badge').textContent = p ? `${p.book} ${p.chapter}` : '';
}

function doSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!searchReady) return;
    const q = input.value.trim();
    if (!q) { showRandomVerse(); return; }
    cleanupSearchObserver();
    current = null;
    renderedChapters = [];
    document.getElementById('chapter-badge').textContent = '';
    const ids = searchIndex.search(q);
    ids.sort((a, b) => refScore(verseList[b].ref, q) - refScore(verseList[a].ref, q) || a - b);
    searchResults = ids.map(id => ({
      ref: verseList[id].ref, text: verseList[id].text, highlight: q
    }));
    searchCursor = 0;
    container.innerHTML = '';
    appendSearchBatch();
  }, 99);
}

function loadChapter(ref) {
  if (!ready) return;
  cleanupSearchObserver();
  const p = parseRef(ref);
  if (!p) return;
  const book = bookIndex[p.book];
  if (!book) return;
  const ch = book.chapters[p.chapter];
  if (!ch) return;

  initChapterView(p.book, p.chapter);

  const hash = `#${p.book.replace(/\s/g, '_')}-${p.chapter}-${ch[0].verse}`;
  history.pushState(null, '', hash);
  input.value = '';
  clearBtn.classList.remove('visible');
  setChapterBadge(ref);
}

function renderEntries(entries, mode) {
  container.innerHTML = '';

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
      const top = el.getBoundingClientRect().top;
      if (top < viewH && top > 130) {
        el.style.animationDelay = `${visible++ * 33}ms`;
      }
    });
  });
}

// ─── Search batch rendering ─────────────────────────────

function cleanupSearchObserver() {
  if (searchObserver) { searchObserver.disconnect(); searchObserver = null; }
  if (searchSentinel && searchSentinel.parentNode) searchSentinel.parentNode.removeChild(searchSentinel);
  searchSentinel = null;
  searchResults = [];
  searchCursor = 0;
}

function appendSearchBatch() {
  if (searchCursor >= searchResults.length) { cleanupSearchObserver(); return; }
  const batch = searchResults.slice(searchCursor, searchCursor + BATCH_SIZE);
  searchCursor += BATCH_SIZE;

  const frag = document.createDocumentFragment();
  batch.forEach(entry => {
    const el = document.createElement('div');
    el.className = 'result-item';
    const text = document.createElement('div');
    text.className = 'result-text';
    const esc = entry.highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text.innerHTML = entry.text.replace(new RegExp(`(${esc})`, 'gi'), '<span class="result-highlight">$1</span>');
    const ref = document.createElement('div');
    ref.className = 'result-ref';
    ref.textContent = `\u2014 ${entry.ref}`;
    el.appendChild(text);
    el.appendChild(ref);
    el.addEventListener('click', () => loadChapter(entry.ref));
    frag.appendChild(el);
  });

  if (searchSentinel && searchSentinel.parentNode) searchSentinel.parentNode.removeChild(searchSentinel);
  container.appendChild(frag);

  const newItems = container.querySelectorAll('.result-item');
  const startFrom = newItems.length - batch.length;
  const viewH = window.innerHeight;
  newItems.forEach((el, i) => {
    if (i < startFrom) return;
    const top = el.getBoundingClientRect().top;
    el.style.animation = 'none';
    el.getBoundingClientRect();
    if (top < viewH - 20 && top > 130) {
      el.style.animation = 'fadeUp 0.4s ease forwards';
      el.style.animationDelay = `${(i - startFrom) * 33}ms`;
    } else {
      el.style.animation = 'fadeUp 0.4s ease forwards';
      el.style.animationDelay = '0ms';
    }
  });

  if (searchCursor < searchResults.length) {
    searchSentinel = document.createElement('div');
    searchSentinel.style.height = '1px';
    container.appendChild(searchSentinel);
    if (!searchObserver) {
      searchObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) appendSearchBatch();
      }, { rootMargin: '400px 0px' });
    }
    searchObserver.observe(searchSentinel);
  } else {
    cleanupSearchObserver();
  }
}

// ─── Infinite scroll ────────────────────────────────────

window.addEventListener('scroll', () => {
  if (!current || isFetching) return;
  const { scrollY } = window;
  const scrollH = document.documentElement.scrollHeight;
  const clientH = document.documentElement.clientHeight;

  if (scrollY + clientH >= scrollH - 400) {
    const next = getNextChapterPos(renderedChapters[renderedChapters.length - 1]);
    if (next) {
      isFetching = true;
      appendChapter(next, 'append');
      isFetching = false;
    }
  }

  if (scrollY <= 200 && renderedChapters.length > 0) {
    const prev = getPrevChapterPos(renderedChapters[0]);
    if (prev) {
      isFetching = true;
      const prevScrollH = scrollH;
      appendChapter(prev, 'prepend');
      window.scrollTo(0, document.documentElement.scrollHeight - prevScrollH + scrollY);
      isFetching = false;
    }
  }
}, { passive: true });

// ─── Event bindings ─────────────────────────────────────

const input = document.getElementById('search-input');
const clearBtn = document.getElementById('search-clear');

input.addEventListener('input', doSearch);

input.addEventListener('input', () => {
  clearBtn.classList.toggle('visible', input.value.length > 0);
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  clearBtn.classList.remove('visible');
  if (ready) showRandomVerse();
  input.focus();
});

document.querySelector('.title').addEventListener('click', () => {
  if (!ready) return;
  input.value = '';
  clearBtn.classList.remove('visible');
  history.pushState(null, '', window.location.pathname);
  showRandomVerse();
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

loadBible();
