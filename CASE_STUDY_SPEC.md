# HAF WERKS — Case Study Page Specification

This document defines the permanent layout, sizing, interaction, and architectural rules for all Case Study pages (`/werks/[slug]`) across **Desktop**, **Tablet**, and **Mobile** breakpoints. Always follow these rules on every subsequent case study development.

> [!IMPORTANT]
> **GOLDEN RULE #1: DESKTOP & TABLET SECTIONS ARE STRICTLY 100VH; MOBILE HERO FITS NATURAL CONTENT HEIGHT**
> On Desktop and Tablet, every section (`.heroSection` and `.editorialRow`) on the Case Study page **MUST BE `height: 100vh`**.
> On Mobile (`< 809.98px`), `.editorialRow` sections remain strictly `100vh`, while the `.heroSection` fits natural content height (`height: fit-content !important; min-height: auto !important;`) cleanly framed with 10px padding.

---

## 1. Architecture & Component Hierarchy

- **Page Component (`web/src/app/werks/[slug]/page.tsx`)**:
  - **100% Server Component by default**. Never add `'use client'` to the page route.
  - Pre-renders static parameters via `generateStaticParams()` from `case-studies.json`.
  - Fallback: Published catalog items from `projects.json` render a designed minimal placeholder cover rather than returning 404.
- **Specifications Table (`web/src/components/case-study/SpecList.tsx`)**:
  - **Server Component**. Fixed metadata block.
- **Editorial Rows (`web/src/components/case-study/GalleryRow.tsx`)**:
  - **Server Component**. Renders hero and multi-column editorial sections using `next/image`.
- **Lightbox / Enlarged View (`web/src/components/case-study/CaseStudyLightbox.tsx`)**:
  - **Isolated Client Island (`'use client'`)**. Receives server-rendered children and handles pop-up modal interactions via event delegation on `data-image-index`.

---

## 2. Desktop & Tablet Breakpoints (`>= 810px`)

### Section Height Rule: Strictly `100vh`
- Every section (`.heroSection` and `.editorialRow`) **must be `height: 100vh`**.
- Do not use `calc(100vh - 20px)` or variable pixel heights on sections.

### Thumbnail / Hero Section
- **Section**: `width: 100%; height: 100vh;` (`.heroSection`).
- **Padding / Gap**: `padding: 0px; gap: 0px; margin: 0px;`.
- **Column**: `flex: 1 1 100%; width: 100%; max-width: 100%; height: 100%;`.
- **Image**: **Must fill the entire section**.
  - Image wrapper has `width: 100%; height: 100%;` without aspect-ratio or height constraints.
  - Image component uses Next.js `fill` with `className="coverImg"` (`object-fit: cover; width: 100%; height: 100%;`).
  - Sets `priority={true}` for instant Largest Contentful Paint (LCP).

### Editorial Rows
- **Section**: `display: flex; flex-direction: row; height: 100vh; width: 100%;`.
- **Row Gap**: Typically `30px` or `0px` depending on section composition.
- **Row Justify**: `flex-start`, `flex-end`, or `space-between`.
- **Column Widths**: Proportional percentages matching net layout geometry:
  - Standard widths: `30%`, `35%`, `40%`, `45%`, `50%`, `60%`, `65%`.
- **Image Aspect Ratios**:
  - `2 / 3` for portrait photos.
  - `3 / 2` for landscape photos.
- **Column Vertical Alignment (`verticalAlign`)**:
  - `"flex-start"`: Image card aligns to the top edge of the 100vh section.
  - `"flex-end"`: Image card aligns to the bottom edge of the 100vh section.

---

## 3. Specifications Box (`id="specList"`)

The specs box in the top-left must strictly match these dimensions:

| Element | CSS Properties |
|---|---|
| **`.specList`** | `width: fit-content; height: fit-content; gap: 3px; position: fixed; top: 10px; left: 10px; z-index: 100; background: var(--color-white); max-width: calc(100vw - 20px);` |
| **`.specRow`** | `width: 409.6px; max-width: 100%; display: flex; flex-direction: row; align-items: baseline; gap: 0;` |
| **`.specKey`** | `width: 33%; flex: 0 0 33%; white-space: nowrap;` |
| **`.specValue`** | `width: 67%; flex: 0 0 67%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` |

---

## 4. Cursor & Gallery Hover Rules

- **Cursor**: Use **`cursor: pointer`** (pointing finger) on all clickable gallery images (`.imageClickable`). Never use `cursor: zoom-in`.
- **Hover**: **No hover animation** on gallery images. Do not apply opacity shifts, scale transforms, or brightness transitions on hover.

---

## 5. Lightbox / Enlarged View Functionality

- **Rendering via Portal**:
  - The modal must be rendered directly into `document.body` using React `createPortal` with **`z-index: 99999`**.
- **Page Chrome Visibility**:
  - When the lightbox overlay is active, background fixed chrome must be hidden to prevent button collisions:
    ```css
    body:has(.lightboxOverlay) .menuFixed,
    body:has(.lightboxOverlay) .specList {
      display: none !important;
    }
    ```
  - This ensures the top-right `Close ✕` button is never covered or obstructed by the site `Menu` button.
- **Navigation Controls**:
  - Previous (`◀`) and Next (`▶`) buttons.
  - Keyboard: <kbd>ArrowLeft</kbd> (prev), <kbd>ArrowRight</kbd> (next), <kbd>Escape</kbd> (close).
  - Clicking the displayed image advances to the next photo.
  - Touch swipe left / right support for tablet and mobile.
  - Clicking the background backdrop outside the image closes the lightbox.
- **Scroll Prevention**:
  - Applies `overflow: hidden` on `body` while active.
  - Adds `data-lenis-prevent` to the overlay so smooth-scrolling does not intercept touch or wheel inputs.

---

## 6. Mobile Breakpoint (`< 809.98px`)

### Section Height Rules on Mobile
- `.editorialRow` sections **MUST BE `height: 100vh !important`** on mobile.
- `.heroSection` **fits natural content height (`height: fit-content !important; min-height: auto !important;`)** with 10px padding.

### Header & Navigation
- **Brand Logo (`.logoFixed`)**: Visible at top-left (`display: block !important`). Unlike desktop where specs take the top-left slot, on mobile the logo remains visible in the header.
- **Menu Button (`.menuFixed`)**: Fixed at top-right (`Menu ◀`).

### Gallery Container (`.gallery`)
- **Inter-section Gap**: `gap: 0 !important; width: 100% !important; display: flex !important; flex-direction: column !important;`.

### Hero / Thumbnail Section
- **Section (`.heroSection`)**: `height: fit-content !important; min-height: auto !important; width: 100% !important; padding: 10px 10px 0 10px !important; margin: 0 !important; box-sizing: border-box !important; display: flex !important; flex-direction: column !important; justify-content: center !important; align-items: center !important;`
- **Sizing Mode**: Fit content height (not 100vh / full viewport fill on mobile) with 10px top, left, and right padding, and 0 bottom padding.
- **Image**: Fits content height based on natural aspect ratio (`width: 100% !important; height: auto !important; aspect-ratio: var(--mobile-aspect-ratio, 3 / 2) !important; object-fit: cover;`), cleanly framed by the top/side padding.

### Editorial Rows (`.editorialRow`)
- **Section**: `height: 100vh !important; width: 100% !important; display: flex !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; box-sizing: border-box !important; overflow: hidden !important;`
- **Intra-row Gap**: `gap: 10px !important;` between stacked images within the 100vh section.
- **Columns (`.editorialCol`)**: Distributed according to natural content height (`height: auto !important; max-height: 100% !important; flex: 0 1 auto !important; min-height: 0 !important; width: 100% !important; max-width: 100% !important;`).
- **Image Cards & Wrappers**: Images fit the height content of the image while preserving aspect ratio (`height: auto !important; max-height: 100% !important; width: 100% !important;`).
- **Padding Clearance**: `padding: 10px 10px 100px 10px !important;` to ensure 10px side margins and clear the bottom-fixed specs box.

### Specifications Box (`.specList`)
- **Placement**: Fixed to viewport bottom (`position: fixed; top: auto !important; bottom: 0px !important; left: 0px !important; right: 0px !important; width: 100% !important; max-width: 100% !important; padding: 10px !important; margin: 0 !important; z-index: 100 !important; background-color: var(--color-white) !important;`).
- **Gaps & Sizing**: `gap: 3px !important; height: fit-content !important;`.
- **Rows (`.specRow`)**: Same two-column layout as desktop spanning full container width (`width: 100% !important; max-width: 100% !important; height: auto !important; display: flex !important; flex-direction: row !important; align-items: baseline !important; gap: 0 !important; justify-content: flex-start !important;`).
- **Typography**: `font-size: var(--font-size-mobile) !important;` (16px), `line-height: var(--line-height) !important; letter-spacing: var(--letter-spacing) !important; font-weight: 500 !important;`.
- **Keys & Values**: Same proportional column split as desktop: `.specKey` (`width: 33% !important; flex: 0 0 33% !important; white-space: nowrap !important;`) and `.specValue` (`width: 67% !important; flex: 0 0 67% !important; max-width: 67% !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;`).
- **Lightbox Collision Handling**: Hidden alongside `.logoFixed` and `.menuFixed` when lightbox is active.

