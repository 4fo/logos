# Graph Report - /Users/jva/Documents/LOGOS  (2026-06-27)

## Corpus Check
- 2 files · ~4,132 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 12 nodes · 21 edges · 4 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]

## God Nodes (most connected - your core abstractions)
1. `loadBible()` - 5 edges
2. `showRandomVerse()` - 5 edges
3. `loadChapter()` - 5 edges
4. `parseRef()` - 4 edges
5. `setChapterBadge()` - 4 edges
6. `showError()` - 3 edges
7. `renderEntries()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `loadBible()` --calls--> `parseRef()`  [EXTRACTED]
  /Users/jva/Documents/LOGOS/main.js → /Users/jva/Documents/LOGOS/main.js  _Bridges community 1 → community 2_
- `showRandomVerse()` --calls--> `renderEntries()`  [EXTRACTED]
  /Users/jva/Documents/LOGOS/main.js → /Users/jva/Documents/LOGOS/main.js  _Bridges community 2 → community 0_
- `loadChapter()` --calls--> `renderEntries()`  [EXTRACTED]
  /Users/jva/Documents/LOGOS/main.js → /Users/jva/Documents/LOGOS/main.js  _Bridges community 1 → community 0_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.4
Nodes (1): renderEntries()

### Community 1 - "Community 1"
Cohesion: 1.0
Nodes (3): loadChapter(), parseRef(), setChapterBadge()

### Community 2 - "Community 2"
Cohesion: 1.0
Nodes (3): loadBible(), showError(), showRandomVerse()

### Community 3 - "Community 3"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 3`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showRandomVerse()` connect `Community 2` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `loadBible()` connect `Community 2` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `loadChapter()` connect `Community 1` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._