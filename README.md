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
  - **Typography**: selectable typeface (persisted)
- **Copy verse** — click any verse reference to copy text + reference
- **Horizontal swipe** (touch) and **shift+scroll** (desktop) for chapter navigation
- **Deep linking** — URL hash for every verse (`#Genesis_1_1`)
- **Keyboard shortcuts**: `/` to focus search, `Esc` for random verse

### Details

| | |
|---|---|
| Typefaces | Rosarivo, Baskervville, EB Garamond, Libre Caslon Text, PT Serif, Lora, Literata, Charis SIL, Alegreya |

### Use it

```bash
npm install
npm run dev
```

Or visit [4fo.github.io/logos](https://4fo.github.io/logos)

## Branches

| Branch | Purpose | Deploys To |
|---|---|---|
| `main` | Live production (GitHub Pages) | [4fo.github.io/logos](https://4fo.github.io/logos) |
| `V2` | Active development — all web changes happen here | — |
| `android` | Capacitor Android wrapper for Play Store | Google Play |
| `v1` | V1.0 snapshot (pre-settings, pre-infinite scroll) | — |

### Workflow

```
V2 ──merge──→ main    # feature ready → GitHub Pages live
V2 ──merge──→ android # sync web changes → Play Store build
```

- **Web deployment:** `git checkout main && git merge V2 -m "deploy: <summary>" && git push`
- **Android release:** `git checkout android && git merge V2 && npm run build && npx cap sync` → open Android Studio, build signed AAB

All three active branches (`V2`, `main`, `android`) share the same web source files — no divergence. The `android` branch only adds `android/` (native project) and `capacitor.config.ts`.

### Capacitor

The Android app is a WebView wrapper — all visuals, interactions, animations, fonts, glass effects, and search are identical to the web version. The 4.6MB Bible data file is bundled inside the APK, so no network is required and first load is faster than the web version.

---

*In the beginning was the Word.*
