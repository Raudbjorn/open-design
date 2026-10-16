# Full-page image export and content cropping

Image export uses the existing project-authorized daemon renderer shared by the desktop UI and `od export`. Ordinary pages still use scroll-segment stitching: each viewport is captured at its actual scroll position, then assembled into one image. This preserves the existing treatment of scroll-driven content and avoids putting a tall document into one GPU capture surface.

When neither width nor height is explicitly supplied, the renderer now removes unnecessary surrounding canvas in two conservative cases:

- A card or poster fits within one viewport: crop to its measured content rectangle while preserving an explicitly constrained body's padding.
- A long page has a centered, narrower content column: lay it out at that width, recheck horizontal overflow, and stitch the full height. If narrowing would overflow, restore the original width.

Explicit dimensions retain their canvas. PDF pagination and deck rendering retain their existing behavior. The original single-image memory guard still rejects oversized exports rather than silently truncating them. The image encoder does not turn an oversized image request into multiple pages.

Full-page image export in the browser now requests a full-document snapshot from the existing iframe bridge. It no longer substitutes a visible viewport screenshot for an ordinary-page image export. Screenshot-to-chat and current-slide capture retain their existing viewport semantics. A failed desktop render with a meaningful error still surfaces that error.

## Conservative exclusions

Automatic cropping is skipped when geometry is missing or invalid, the document is too large to measure safely, a full-page gradient/image supplies the backdrop, or border boxes cannot safely describe visible content. Examples include nonzero CSS outlines, shadows, filters, generated pseudo-element content, visible shadow roots and text directly inside the body. Asymmetric long-page layouts are also left at their original width. Explicit viewport dimensions disable this heuristic.

This is not a general DOM-to-pixel paint-bounds solver. Some designs deliberately use flat surrounding color or whitespace; specify a viewport when that canvas is part of the design. Browser snapshot fidelity remains subject to the existing iframe renderer and cross-origin resource restrictions.

## Verification

The focused geometry tests cover cards, body padding, viewport-filling content, gradients, scrolling/overflow, fractional bounds, invalid numbers and long-column eligibility. The real Electron test renders eleven synthetic documents under Linux/Xvfb, including explicit dimensions and exclusions for shadows, pseudo-elements and body text. Outlined cards and long columns, including outlines on the body, retain all expected outline pixels. Its 18,000-pixel-tall fixture checks the final red pixels, proving that the page tail was retained beyond 16,384 pixels rather than repeated from the blue page start.

```sh
pnpm --filter @open-design/desktop test \
  tests/main/page-capture-crop.test.ts \
  tests/main/page-export-geometry.test.ts \
  tests/main/page-capture-render.test.ts \
  tests/main/scroll-stitch-geometry.test.ts
pnpm --filter @open-design/web exec vitest run \
  tests/components/file-viewer-image-export.test.tsx \
  tests/runtime/exports.test.ts
```

The package test command builds the desktop entrypoints before running Vitest, so a separate desktop build is not required after the standard workspace install. The native fixture uses an isolated Electron profile, software rendering and device scale 1. Existing geometry tests cover fractional scaling mathematically. These checks do not certify the Arc GPU, interactive Wayland rendering, every font/resource combination, all scroll animation libraries or arbitrary generated designs.

## Provenance

Adapted from [mutoe/open-design at `fbbcc3a24073e1f7b26de84aed98f5cf67afc591`](https://github.com/mutoe/open-design/tree/fbbcc3a24073e1f7b26de84aed98f5cf67afc591), M1 plus the required full-export/viewport distinction from M2. The current branch already had bounded tall-page stitching; that implementation is retained. The integration adds content cropping, conservative exclusions, a Linux scrollbar-gutter correction and whole-document browser fallback. It does not adopt the donor's parallel image-export endpoint, native save dialog, forced 2x rendering or authored-export-marker feature.
