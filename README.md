# LOGOS

**A quiet space for the King James Bible.**

---

A single-page web experience for reading and searching the 1769 King James Version of the Bible. No menus, no chrome, no advertisements — just scripture on a dark page.

### Features

- **Instant search** as you type across all 31,102 verses (Flexsearch)
- **Fuzzy prefix matching** with reference-relevance and text-content scoring
- **Full chapter view** — click any verse to read its chapter
- **Bidirectional infinite scroll** — scroll up/down within a chapter to load adjacent chapters seamlessly
- **Chapter dividers** — subtle visual breaks between auto-loaded chapters
- **Real-time chapter badge** — bookmark-style badge updates as you scroll
- **Random verse** on load and on `Esc`
- **Glass sticky header** with real-time `backdrop-filter` blur of scrolling content
- **Settings panel** — gear button opens an in-place slide-out:
  - **Theme**: System / Light / Dark (manual override, persisted)
  - **Layout**: Verse per line / Continuous paragraph (persisted)
  - **Text size**: `−` / `+` controls, 0.7x–1.5x (persisted)
  - **Typography**: Rosarivo / Baskervville / EB Garamond / Libre Caslon Text (persisted)
- **Copy verse** — click any verse reference to copy text + reference
- **Horizontal swipe** (touch) and **shift+scroll** (desktop) for chapter navigation
- **Deep linking** — URL hash for every verse (`#Genesis_1_1`)
- **Keyboard shortcuts**: `/` to focus search, `Esc` for random verse

### Use it

```bash
npm install
npm run dev
```

Or visit [4fo.github.io/logos](https://4fo.github.io/logos)

### Details

| | |
|---|---|
| Translation | King James Version, 1769 edition |
| Verses | 31,102 |
| Search | Flexsearch 0.7, forward prefix tokenizer, 99ms debounce |
| Theme | 3-level cascade (`:root` → `@media` → class), persisted |
| Typefaces | Rosarivo, Baskervville, EB Garamond, Libre Caslon Text (selectable) |
| Data | ~4.6MB flat JSON, fetched at runtime |
| Build | Vite 8, vanilla JS (ES module) |
| Bundle | JS ~28 KB (10.5 KB gzip), CSS ~11 KB (2.5 KB gzip) |
| Deploy | GitHub Pages, manual via `main` branch |

---

*In the beginning was the Word.*
