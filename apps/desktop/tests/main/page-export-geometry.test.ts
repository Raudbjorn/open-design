import { describe, expect, test } from 'vitest';

import { resolvePageLayoutWidth, type PageColumnExtent } from '../../src/main/deck-capture.js';

// A long page with an author-capped centered column (max-width + margin:auto)
// re-lays out at the column width so the page background doesn't export as
// wide flanks. The decision is deliberately conservative.
describe('resolvePageLayoutWidth', () => {
  function column(overrides: Partial<PageColumnExtent>): PageColumnExtent {
    return {
      l: 296,
      r: 1216,
      viewportW: 1512,
      viewportH: 1048,
      scrollH: 7410,
      bodyPadX: 0,
      ...overrides,
    };
  }

  test('a centered 920px column on a long page narrows to the column width', () => {
    expect(resolvePageLayoutWidth(column({}), 1512)).toBe(920);
  });

  test('body horizontal padding survives as page-level gutters', () => {
    // body { padding: 40px 24px } around a fixed-width card: without the
    // gutters the card would overflow the narrowed viewport.
    expect(resolvePageLayoutWidth(column({ bodyPadX: 48 }), 1512)).toBe(968);
  });

  test('a single-viewport page is left to the content-box crop', () => {
    expect(resolvePageLayoutWidth(column({ scrollH: 1048 }), 1512)).toBeNull();
  });

  test('near-full-width content keeps the requested width', () => {
    expect(resolvePageLayoutWidth(column({ l: 10, r: 1500 }), 1512)).toBeNull();
  });

  test('implausibly narrow columns keep the requested width', () => {
    expect(resolvePageLayoutWidth(column({ l: 600, r: 800 }), 1512)).toBeNull();
  });

  test('no measurable column keeps the requested width', () => {
    expect(resolvePageLayoutWidth(null, 1512)).toBeNull();
  });

  test('asymmetric layouts and invalid geometry keep the requested width', () => {
    expect(resolvePageLayoutWidth(column({ l: 0, r: 920 }), 1512)).toBeNull();
    expect(resolvePageLayoutWidth(column({ bodyPadX: Infinity }), 1512)).toBeNull();
    expect(resolvePageLayoutWidth(column({ scrollH: NaN }), 1512)).toBeNull();
  });
});
