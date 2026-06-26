**LOGOS Project Execution Guide** — Complete, self-contained instructions for building the fastest, most immersive classical newspaper-style KJV Bible search experience on GitHub Pages.

Copy the entire content below into a new file called **`BUILD.md`** in the root of your repo (`https://github.com/4fo/logos.git`), then follow it exactly.

---

# LOGOS — Classical Letterpress KJV Bible

**Vision**: A single, resizable "newspaper fold" page with authentic 18th–19th century letterpress aesthetics. Lightning-fast full-text search, buttery-smooth panning/zooming (loupe-like inspection), deep linking, and responsive perfection. Hosted on GitHub Pages. Zero lag.

## Project Priorities (Decision Criteria)
1. **Performance** — Load < 2s, search < 50ms, 60fps panning/zoom.
2. **Aesthetic Fidelity** — Aged paper, deep ink, classic serifs, newspaper columns, tactile feel.
3. **UX** — One single "physical page" container. Scrolling = panning the page. Search centers + highlights verse with context.
4. **Maintainability** — Vanilla-first, minimal deps, easy to extend.
5. **Data** — Flat JSON for instant access.

**Chosen Data**: `verses-1769.json` from farskipper/kjv (flat ` "Genesis 1:1": "text" ` structure — fastest possible).

## Step 1: Initialize the Project (5 minutes)

```bash
cd logos
npm create vite@latest . -- --template vanilla
npm install
npm install fuse.js
npm install -D gh-pages
```

Update `package.json` scripts:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "gh-pages -d dist"
}
```

Commit and push:
```bash
git add .
git commit -m "Initial Vite setup"
git push
```

## Step 2: Add Bible Data

Create folder: `public/data/`

Download the flat JSON (best source):
- Go to: https://raw.githubusercontent.com/farskipper/kjv/master/json/verses-1769.json
- Save as `public/data/verses-1769.json`

(Alternative: Use aruljohn if you prefer per-book structure later.)

## Step 3: Core Files (Create These)

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LOGOS | King James Version</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="vintage-frame">
    <div class="newspaper-page" id="page">
      <header class="header">
        <h1>LOGOS</h1>
        <div class="subtitle">King James Version • 1769</div>
      </header>
      
      <div class="toolbar">
        <input type="text" id="search-input" placeholder="Search words or phrases...">
        <button id="search-btn">Search</button>
      </div>

      <div class="content" id="content"></div>
    </div>
  </div>

  <div class="sidebar" id="sidebar">
    <!-- Book navigator populated by JS -->
  </div>

  <script type="module" src="main.js"></script>
</body>
</html>
```

### style.css (The Magic — Vintage Newspaper)
```css
:root {
  --paper: #f8f1e3;
  --ink: #1c1c1c;
  --accent: #4a2c0b;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: #2c1f14;
  font-family: 'EB Garamond', serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  color: var(--ink);
}

.vintage-frame {
  width: 95vw;
  max-width: 1100px;
  aspect-ratio: 4 / 5; /* Classic broadsheet feel */
  background: #3c2a1f;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 80px rgba(0,0,0,0.8),
              inset 0 0 120px rgba(139, 69, 19, 0.15);
  position: relative;
}

.newspaper-page {
  width: 100%;
  height: 100%;
  background: var(--paper) url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27/%3E%3C/filter%3E%3Crect width=%27100%27 height=%27100%27 filter=%27url(%23n)%27 opacity=%270.08%27/%3E%3C/svg%27') repeat;
  box-shadow: inset 0 0 60px rgba(0,0,0,0.1),
              0 10px 30px rgba(0,0,0,0.6);
  overflow: auto;
  padding: 60px 50px;
  font-size: 1.15rem;
  line-height: 1.75;
  text-align: justify;
  cursor: grab;
  position: relative;
}

.header {
  text-align: center;
  border-bottom: 3px double var(--ink);
  padding-bottom: 20px;
  margin-bottom: 40px;
}

h1 {
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  margin: 0;
  letter-spacing: 4px;
  color: var(--accent);
}

.content p {
  margin: 1.2em 0;
  text-indent: 1.5em;
}

.verse {
  scroll-margin-top: 100px;
}

.highlight {
  background: #fff9c4;
  padding: 2px 4px;
  border-radius: 2px;
  box-shadow: 0 0 0 2px #ffd700;
  transition: all 0.3s ease;
}

/* Panning smoothness */
.newspaper-page:active { cursor: grabbing; }
```

### main.js (Core Logic)
```javascript
import Fuse from 'fuse.js';

let bibleData = {};
let fuse;

async function loadBible() {
  const res = await fetch('/data/verses-1769.json');
  bibleData = await res.json();
  
  const verses = Object.entries(bibleData).map(([ref, text]) => ({ ref, text }));
  fuse = new Fuse(verses, {
    keys: ['text', 'ref'],
    threshold: 0.3,
    includeMatches: true
  });
  
  renderAllBooks();
}

function renderVerse(ref, text, highlight = '') {
  // Implement highlighting logic here
  const div = document.createElement('div');
  div.className = 'verse';
  div.id = ref.replace(/[\s:]/g, '-');
  div.innerHTML = `<strong>${ref}</strong> ${text}`;
  return div;
}

// Search
document.getElementById('search-btn').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.trim();
  if (!query || !fuse) return;
  
  const results = fuse.search(query);
  const content = document.getElementById('content');
  content.innerHTML = '';
  
  results.forEach(result => {
    content.appendChild(renderVerse(result.item.ref, result.item.text, query));
  });
  
  // Center first result
  if (results[0]) {
    document.getElementById(results[0].item.ref.replace(/[\s:]/g, '-')).scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// Panning (drag to move page)
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

const page = document.getElementById('page');
page.addEventListener('mousedown', e => {
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

// Keyboard zoom / navigation
document.addEventListener('keydown', e => {
  if (e.key === '/' ) document.getElementById('search-input').focus();
});

// Init
loadBible();
```

## Step 4: GitHub Pages Deployment

```bash
npm run build
npm run deploy
```

Add to `vite.config.js` if needed for base path.

## Next Enhancements (After Core Works)
1. Book/chapter sidebar navigator (parse keys or add metadata JSON).
2. Virtual rendering for very long chapters.
3. URL hash deep linking (`#John-3-16`).
4. Sepia/Dark toggle.
5. Persistent loupe zoom on double-click.
6. Print-friendly CSS.

---

**Run these steps in order. After Step 3, run `npm run dev` and test search + panning.**

Reply with “Core complete” or any specific error/blocker, and I’ll give the next detailed module (navigator, advanced highlighting, etc.).

This blueprint delivers exactly what you described: lightning fast, buttery smooth, classical newspaper immersion. Let's ship LOGOS.