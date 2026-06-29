# LOGOS — Agent guidelines

## Repo layout

- **Single-page web app** (Vite + vanilla JS). No framework. No router. No SSR.
- **Android wrapper** via Capacitor — `android/` dir lives only on the `android` branch.
- **No tests**, no linter, no formatter, no typechecker configured.

## Branch workflow

| Branch | Purpose | CI trigger |
|---|---|---|
| `V2` | Active development, all web changes here | — |
| `main` | Production web (GitHub Pages) | Push → builds `dist/` → deploys to `4fo.github.io/logos` |
| `android` | APK builds | Push or `v*` tag → builds signed APK → GitHub Release |

Merge flow: `V2 → main` and `V2 → android`. The three branches share the same web source files.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Preview production `dist/` locally (Vite preview) |
| `npm run deploy` | `gh-pages -d dist` (manual deploy; CI does this automatically) |

## Android build

```bash
npm run build
npx cap copy android
JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home \
  cd android && ./gradlew assembleRelease
```

APK output: `android/app/build/outputs/apk/release/app-release.apk` (renamed to `LOGOS - The Holy Bible.apk` by CI).

## Signing

- `android/keystore.properties` and `android/app/logos-release.keystore` are gitignored — never committed.
- Local builds require these files on disk (see `docs/KEYSTORE.md`).
- CI recreates them from GitHub secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`).
- The signing config in `android/app/build.gradle` is conditional — only activates when `keystore.properties` exists.

## Key facts

- `public/data/verses-1769.json` (~4.5 MB) loaded at runtime by `main.js` via FlexSearch — inside `dist/` after build.
- `base: ''` in `vite.config.js` — no base path prefix. The app works from `./` relative paths.
- OG image (`opengraph.png`) and banner images in repo root are for README/social preview.
- Fonts: 9 typefaces in `public/fonts/`, downloaded by `scripts/download-fonts.mjs`.
- `graphify-out/`, `Secret Value/`, and `LOGOS — Classical Letterpress KJV Bible.md` are AI-generated artifacts, not source code — leave alone.
- `*.command` files are macOS click-to-run shell wrappers, not relevant to development.
