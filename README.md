# LOGOS

**A quiet space for the King James Bible.**

---

A single-page web experience for reading and searching the 1769 King James Version of the Bible. No menus, no chrome, no advertisements — just scripture on a dark page.

### Features

- **Instant search** as you type across all 31,102 verses (Flexsearch)
- **Fuzzy prefix matching** with reference-relevance sorting
- **Full chapter view** — click any verse to read its chapter
- **Bidirectional infinite scroll** — scroll up/down within a chapter to load previous/next chapters seamlessly
- **Chapter dividers** — subtle visual breaks between auto-loaded chapters
- **Random verse** on load and on `Esc`
- **Glass sticky header** with real-time `backdrop-filter` blur of scrolling content
- **Settings panel** — gear button opens an in-place transform of the header into controls:
  - **Theme**: System / Light / Dark (manual override, persisted)
  - **Layout**: Verse per line / Continuous paragraph
  - **Text size**: `−` / `+` controls (0.7x–1.5x, persisted)
  - **Typography**: Rosarivo / Baskervville / EB Garamond / Libre Caslon Text (persisted)
- **Horizontal swipe** (touch) and **shift+scroll** (desktop) for chapter navigation
- **Deep linking** — URL hash for every verse (`#Genesis_1_1`)
- **Clear button** in search bar, keyboard shortcut `/` to focus

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
| Search | Flexsearch, prefix tokenizer, 99ms debounce |
| Theme | Manual System/Light/Dark toggle with localStorage persistence |
| Typeface | Rosarivo, Baskervville, EB Garamond, Libre Caslon Text (selectable) |
| Data | ~4.6MB flat JSON, fetched at runtime |
| Build | Vite, vanilla JS module |
| Bundle | ~28 KB JS (10.5 KB gzip), ~10.5 KB CSS (2.4 KB gzip) |
| Deploy | GitHub Pages |

---

*In the beginning was the Word.*
