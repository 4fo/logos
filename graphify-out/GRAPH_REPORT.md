# Graph Report - /Users/jva/Documents/LOGOS  (2026-06-27)

## Corpus Check
- 2 files · ~6,646 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 27 nodes · 44 edges · 5 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]

## God Nodes (most connected - your core abstractions)
1. `loadBible()` - 6 edges
2. `showRandomVerse()` - 6 edges
3. `loadChapter()` - 6 edges
4. `parseRef()` - 4 edges
5. `createChapterBlock()` - 4 edges
6. `initChapterView()` - 4 edges
7. `setChapterBadge()` - 4 edges
8. `cleanupSearchObserver()` - 4 edges
9. `showError()` - 3 edges
10. `setupChObserver()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `loadBible()` --calls--> `showError()`  [EXTRACTED]
  /Users/jva/Documents/LOGOS/main.js → /Users/jva/Documents/LOGOS/main.js  _Bridges community 3 → community 1_
- `loadChapter()` --calls--> `initChapterView()`  [EXTRACTED]
  /Users/jva/Documents/LOGOS/main.js → /Users/jva/Documents/LOGOS/main.js  _Bridges community 2 → community 1_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (0): 

### Community 1 - "Community 1"
Cohesion: 0.6
Nodes (5): loadBible(), loadChapter(), parseRef(), setChapterBadge(), setupChObserver()

### Community 2 - "Community 2"
Cohesion: 0.4
Nodes (5): appendChapter(), applyLayout(), createChapterBlock(), createDivider(), initChapterView()

### Community 3 - "Community 3"
Cohesion: 0.4
Nodes (5): appendSearchBatch(), cleanupSearchObserver(), renderEntries(), showError(), showRandomVerse()

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 4`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showRandomVerse()` connect `Community 3` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `loadBible()` connect `Community 1` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `loadChapter()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._