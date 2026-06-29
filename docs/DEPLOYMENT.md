# Deployment

LOGOS is a static single-page application — no server, no build-time env vars needed. The `dist/` output of `npm run build` can be served from any static host.

## GitHub Pages (current)

The repo deploys automatically to [4fo.github.io/logos](https://4fo.github.io/logos) via the GitHub Pages setting (source: `gh-pages` branch). Push to the `gh-pages` branch or use a GitHub Actions workflow to build and deploy.

## Vercel

1. Connect your repo at [vercel.com](https://vercel.com)
2. Set:
   - **Framework preset:** None (or Vite)
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. No environment variables needed
4. Deploy — Vercel detects the PWA manifest and serves it correctly

## Netlify

1. Connect repo at [netlify.com](https://netlify.com)
2. Set:
   - **Base directory:** (leave blank)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. No environment variables needed
4. Add a `public/_redirects` file for SPA fallback:
   ```
   /*    /index.html    200
   ```
   (Already handled by the `dist` build if using Vite's SPA fallback.)

## Cloudflare Pages

1. Connect repo at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Set:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. No environment variables needed
4. Deploy — works out of the box.

## Android APK (CI only)

Android signing secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) are **GitHub Actions secrets** only — not needed for any web platform. See [docs/KEYSTORE.md](KEYSTORE.md) for details.
