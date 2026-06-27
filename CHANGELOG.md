# Changelog

All notable changes to LOGOS are documented here.

## [2.0.0] — 2026-06-27

### Added
- Font selector with 4 typefaces: Rosarivo, Baskervville, EB Garamond, Libre Caslon Text (persisted)
- Grouped settings panel (Theme / Display / Typography) with section dividers
- Pulsing title glow — white in dark mode, warm gold in light mode
- Gear icon SVG rotation animation (90° CW on open, counter-rotates on close)
- Search ranking that scores verse text content (not just references)
- Font size controls, paragraph mode, text size controls
- Bidirectional infinite scroll with chapter dividers
- Real-time chapter badge via IntersectionObserver
- Copy verse on reference click with toast notification
- Dynamic batch search rendering (30-item batches)
- Gesture navigation (swipe on touch, shift+scroll on desktop)
- Settings panel as absolute slide-out from header
- Random verse on load and Esc
- Deep linking via URL hash (`#Genesis_1_1`)

### Fixed
- "Revelation 22" search ranking — Flexsearch v0.8 bitset false positives; downgraded to v0.7
- "Jesus wept" ranked last — verse text content now scored in refScore
- Chapter badge observation zone — dynamically measures header height
- Gear wobble — SVG element rotates inside fixed button border
- Mobile tap highlight overlay suppressed
- Theme system restructured: 3-level cascade (`:root` → `@media` → class override)

### Changed
- Flexsearch v0.7.43 (v0.8 bitset index had false-positive prefix matches)
- Bundle: JS ~28 KB (10.5 KB gzip), CSS ~11 KB (2.5 KB gzip)

## [1.0.0] — 2026-06-01

### Added
- Initial release
- Full KJV Bible (31,102 verses) with instant search
- Floating glass pill header with sticky positioning
- Real-time `backdrop-filter` blur of scrolling content
- System-default dark/light mode via `prefers-color-scheme`
- Deep linking via URL hash (`#Genesis_1_1`)
- Vite build with lightningcss
- Deployed to GitHub Pages
