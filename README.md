# LOGOS

**A quiet space for the King James Bible.**

[![GitHub Release](https://img.shields.io/github/v/release/4fo/logos?style=flat&label=latest)](https://github.com/4fo/logos/releases)
[![Download APK](https://img.shields.io/badge/Download-APK-brightgreen?style=flat&logo=android&logoColor=white)](https://github.com/4fo/logos/releases/latest)
[![GitHub Pages](https://img.shields.io/badge/Web-App-8B5CF6?style=flat&logo=github)](https://4fo.github.io/logos)

---

A single-page web experience for reading and searching the 1769 King James Version of the Bible — also available as a **signed Android APK**. No menus, no chrome, no advertisements — just scripture. Supports system/light/dark themes.

### Download

| Platform | Link |
|---|---|
| Android | [Download APK](https://github.com/4fo/logos/releases/latest) (`LOGOS - The Holy Bible.apk`) |
| Web | [4fo.github.io/logos](https://4fo.github.io/logos) |
| Privacy | [Privacy Policy](https://4fo.github.io/logos/privacy-policy.html) |

The APK is a WebView wrapper — all visuals, interactions, animations, fonts, glass effects, and search are identical to the web version. The 4.5 MB Bible data file (`verses-1769.json`) is bundled inside, so no network is required and first load is instant.

### Features

- **Instant search** as you type across all 31,102 verses (FlexSearch)
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
  - **Text size**: `−` / `+` controls, 0.7×–1.5× (persisted)
  - **Typography**: selectable typeface (persisted)
- **Copy verse** — click any verse reference to copy text + reference
- **Horizontal swipe** (touch) and **shift+scroll** (desktop) for chapter navigation
- **Deep linking** — URL hash for every verse (`#Genesis_1_1`)
- **Keyboard shortcuts**: `/` to focus search, `Esc` for random verse

### Details

| | |
|---|---|
| Typefaces | Rosarivo, Baskervville, EB Garamond, Libre Caslon Text, PT Serif, Lora, Literata, Charis SIL, Alegreya |
| Bundle | JS ~31 KB (11 KB gzip), CSS ~13 KB (3 KB gzip) |
| APK | 4.9 MB signed release |
| Min SDK | Android 7.0 (API 24) |

### Use it

```bash
npm install
npm run dev
```

Or visit [4fo.github.io/logos](https://4fo.github.io/logos)

### Branches

| Branch | Purpose | Deploys To |
|---|---|---|
| `main` | Live production (GitHub Pages) | [4fo.github.io/logos](https://4fo.github.io/logos) |
| `V2` | Active development — all web changes happen here | — |
| `android` | Capacitor Android wrapper | [GitHub Releases](https://github.com/4fo/logos/releases) (APK) |
| `v1` | V1.0 snapshot | — |

### Workflow

```
V2 ──merge──→ main      # feature ready → GitHub Pages live
V2 ──merge──→ android   # sync web changes → APK release
```

- **Web deployment:** `git checkout main && git merge V2 -m "deploy: <summary>" && git push`
- **Android release:** `git checkout android && git merge V2 && npm run build && npx cap copy android && ./gradlew assembleRelease` → draft a [new Release](https://github.com/4fo/logos/releases/new) with the APK attached, or push a version tag (`v*`) to trigger the automated build via [release-android.yml](.github/workflows/release-android.yml).

All three active branches (`V2`, `main`, `android`) share the same web source files — no divergence. The `android` branch only adds `android/` (native project) and `capacitor.config.json`.

### Android build

To build the APK locally:

```bash
npm run build
npx cap copy android
cd android && export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home && ./gradlew assembleRelease
```

The signed APK is written to `android/app/build/outputs/apk/release/LOGOS - The Holy Bible.apk`.

---

*In the beginning was the Word.*
