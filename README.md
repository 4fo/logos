# LOGOS

**A quiet space for the King James Bible.**

*A reader, a search, a meditation.*

---

LOGOS is a single-page web experience built for reading and searching the 1769 King James Version of the Bible. There are no menus, no chrome, no advertisements — just scripture, floating on a dark page.

Type to search across all 31,102 verses with fuzzy tolerance. Click any result to read the full chapter. Press `Esc` to return to a random verse. The page remembers your theme preference. Every detail is minimal by design.

---

### Use it

Open it in a browser, then type. That's it.

```bash
open https://4fo.github.io/logos
```

Or run locally:

```bash
npm install
npm run dev
```

---

### Made with

- [Rosarivo](https://fonts.google.com/specimen/Rosarivo) — the body typeface, a 16th-century Spanish book face revived for screen
- [Fuse.js](https://fusejs.io) — fuzzy search over the full text
- [KJV Bible data](https://github.com/farskipper/kjv) — flat JSON of the 1769 edition
- Vanilla JS, Vite, GitHub Pages

---

### Details

| | |
|---|----|
| Translation | King James Version, 1769 edition |
| Verses | 31,102 |
| Search | Fuzzy, full-text, debounced at 333ms |
| Theme | Dark / Light, persisted to localStorage |
| Chapters | Click any verse to read its full chapter |
| Deep linking | URL hash for every verse (`#Genesis_1_1`) |
| Typeface | Rosarivo (serif) for body, system sans-serif for UI |
| Data | ~4.6MB flat JSON, fetched at runtime |
| Build | Vite, vanilla JS module |
| Deploy | GitHub Pages via `gh-pages` |

---

*In the beginning was the Word.*
