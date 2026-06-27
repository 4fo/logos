# LOGOS — V1 (stable)

**A quiet space for the King James Bible.**

---

A single-page web experience for reading and searching the 1769 King James Version of the Bible. No menus, no chrome, no advertisements — just scripture on a dark page.

### Features (V1)

- **Instant search** as you type across all 31,102 verses (Flexsearch)
- **Fuzzy prefix matching** with reference-relevance sorting
- **Full chapter view** — click any verse to read its chapter
- **Random verse** on load and on `Esc`
- **Glass sticky header** with real-time `backdrop-filter` blur of scrolling content
- **System-default dark/light mode** — respects `prefers-color-scheme`, no manual toggle
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
| Theme | System-default dark/light (`prefers-color-scheme`) |
| Typeface | Rosarivo (serif) for body, system sans-serif for UI |
| Data | ~4.6MB flat JSON, fetched at runtime |
| Build | Vite, vanilla JS module |
| Bundle | ~56 KB JS (19.5 KB gzip), ~4.7 KB CSS (1.5 KB gzip) |
| Deploy | GitHub Pages via GitHub Actions |

### Branch

**`main`** — V1, stable, currently deployed.  
**`V2`** — Phase II development (settings panel, infinite scroll, chapter dividers, paragraph mode, text size controls).

---

*In the beginning was the Word.*
