# HAF WERKS — Master Plan (Frontend Only)

**Framework is Next.js. Not Vite. Not Astro. Not plain HTML. Not Pages Router.**
The product is a **Next.js App Router** app in `web/`, deployed to Vercel.

This file is the source of truth for vibe-coding the HAF WERKS site.

**Who writes this plan:** Cursor Grok (strategy, structure, performance, SEO).
**Who executes:** Gemini (Antigravity). Gemini implements. Gemini does not invent a new design system.

If this file and a prototype disagree on pixels, **the prototype wins**.
If this file and a prototype disagree on architecture, **this file wins**.

---

## 0. Mission

Build a **frontend-only** website for **HAF WERKS**, an explorative architecture, objects, and spatial design practice (Cirendeu, Tangerang Selatan, est. 2020).

The site must:

1. Match the design in `static-site-design/` exactly (layout, type, spacing, hover, 10px frame, noise texture).
2. Be **fast** on Vercel (no lag, no jank, no hydration storms).
3. Be **SEO-ready**.
4. Stay **clean and small**. No CMS. No backend. No Sanity.
5. Stay **stable**. No bugs on the shipped pages.

Content lives in JSON. Pages are static. Interactivity is tiny client islands only.

---

## 1. Human + AI workflow

```
Night (Designer)
  → drops / updates HTML+CSS+JSON in static-site-design/
  → reviews visual fidelity in browser

Grok (this role, Cursor)
  → owns PLAN.md
  → decides stack, folder map, performance rules, SEO, page strategy
  → updates this plan when a new page type appears

Gemini (Antigravity)
  → reads THIS FILE first, then the matching prototype
  → executes one phase / one page at a time
  → copies CSS class names and tokens 1:1
  → does not restyle, does not add CMS
  → motion stack is locked: Lenis + Motion only (see §5.8)
```

### Gemini operating contract

Before writing code, Gemini must:

1. Read this `PLAN.md`.
2. Open the prototype HTML + CSS for the page being built.
3. Open the JSON the page consumes.
4. Name the **client islands** (if any) in one line.
5. Implement. Stop when the page matches the prototype and the checklist below.

Gemini must **not**:

- Convert the design to Tailwind / shadcn / MUI.
- Rewrite class names.
- Add GSAP, ScrollTrigger, Three.js, Locomotive Scroll, AOS, or a second smooth-scroll library. **Lenis + Motion are allowed.** See §5.8.
- Add Sanity, Strapi, Firebase, or any API.
- Mark whole pages `'use client'`.
- Import `projects.json` or `editorial-rows.json` into a Client Component as-is (they are ~465KB and contain data-URI images).
- Invent missing case-study pages. Projects without a case-study JSON entry still link, but render a designed empty/placeholder state or the cover-only layout — do not fake WHF101 content on other slugs.

---

## 2. Design source of truth

Everything visual already exists here:

```
static-site-design/
  AI_DEVELOPER_PROMPT.md     # design spec (tokens, routes, behaviors)
  prototypes/*.html          # runnable pixel reference
  styles/*.css               # copy these files, do not rewrite
  data/*.json                # content
  assets/fonts/              # Helvetica Neue Medium + Bold (woff2)
  assets/images/             # texture.png + local case-study images
  react-templates/*.tsx      # STRUCTURAL HINTS ONLY — not production code
```

`react-templates/` are drafts. They are **unsafe to copy**:

- every file is `'use client'`
- they use raw `<img>`
- they import JSON on the client
- they do not use `next/font` or `next/image`
- they ignore RSC

Use them to see JSX shape. Rebuild them as Server Components + small client islands.

### Current pages in the prototype pack

| Route | Prototype | CSS | Data |
|---|---|---|---|
| `/` | `prototypes/index.html` | `home.css` + `globals.css` + `navigation.css` | mostly hardcoded / `information.json` |
| `/werks` | `prototypes/werks.html` | `werks.css` | `editorial-rows.json` |
| `/werks/list` | `prototypes/werks-list.html` | `werks.css` | `framer-list.json` |
| `/werks/[slug]` | `prototypes/case-study.html` | `case-study.css` | `case-studies.json` |
| `/information` | `prototypes/information.html` | `information.css` | `information.json` |
| `/archive` | `prototypes/archive.html` | `archive.css` | `archive.json` |
| `/explore` | `prototypes/explore.html` | `explore.css` | `explore-layout.json` + `projects.json` |

Breakpoint used everywhere: **`max-width: 809.98px`**. Keep it. Do not change to 768 or 810.

---

## 3. Stack (locked)

| Decision | Choice | Why |
|---|---|---|
| Framework | **Next.js App Router** (latest stable, React 19) | Vercel-native, static HTML, Metadata API, `next/image`, `next/font` |
| Language | TypeScript (strict) | fewer bugs |
| Styling | **The existing CSS files**, imported globally | pixel match; no design rewrite |
| Deploy | Vercel | CDN static pages + image optimizer |
| Rendering | Static. `generateStaticParams` for slugs. No runtime data fetch. | zero serverless cost on page views, instant TTFB |
| CMS | **None** | explicit product decision |
| Smooth scroll | **Lenis** on `window` (not a transformed wrapper) | matches Framer published sites |
| Motion | **`motion`** (`motion/react`) | Framer appear / spring reference |
| Hover / menu | Keep existing CSS | already matches Framer overlay / ease |
| Other animation libs | **Forbidden** | GSAP / Locomotive / AOS will lag and fight Lenis |
| Package extras | Only `lenis` and `motion` unless PLAN.md is updated | no bloat |

Do **not** use `output: 'export'`. Stay on standard Next.js static generation so Vercel Image Optimization works.

Do **not** add Tailwind. The design is already specified in CSS.

App lives in repo root as `web/` so the design pack stays untouched:

```
WHF101-2026-V2/
  PLAN.md                      ← this file
  static-site-design/          ← prototypes (never deploy this)
  web/                         ← Next.js app (the product)
    package.json
    next.config.ts
    src/app/
    src/components/
    src/lib/
    src/styles/                ← copies of static-site-design/styles
    public/
      fonts/
      images/
      texture.png
```

Night keeps adding prototypes under `static-site-design/prototypes/`. Gemini ports them into `web/`.

---

## 4. Target folder map

```
web/
  src/
    app/
      layout.tsx                 # html/body, fonts, shell, texture, metadata
      page.tsx                   # Home — Server Component
      robots.ts
      sitemap.ts
      not-found.tsx
      werks/
        page.tsx                 # Grid — Server Component
        list/page.tsx            # List — Server + tiny sort island
        [slug]/page.tsx          # Case study — Server Component
      information/page.tsx       # Server Component
      archive/page.tsx           # Server + tiny filter island
    components/
      shell/
        WebsiteShell.tsx         # .website-shell + .texture-wrapper
        HeaderNav.tsx            # Server wrapper
        MenuToggle.tsx           # CLIENT — open/close only
        Logo.tsx
        ViewSwitcher.tsx         # Grid | List links (server)
      werks/
        WerksGrid.tsx            # Server
        WorkCard.tsx             # Server
        WerksList.tsx            # Server table markup
        WerksListClient.tsx      # CLIENT — sort state only
      motion/
        SmoothScroll.tsx         # CLIENT — Lenis on window, renders {children}
        Reveal.tsx               # CLIENT — whileInView appear, receives server children
        HoverLift.tsx            # CLIENT — whileHover spring; CSS hover stays in CSS
        DragImage.tsx            # CLIENT — dragConstraints + momentum on one image
        DragStrip.tsx            # CLIENT — horizontal drag gallery (case study)
      archive/
        ArchiveGrid.tsx          # Server
        ArchiveFilters.tsx       # CLIENT — tag filter only
      case-study/
        SpecList.tsx             # Server
        GalleryRow.tsx           # Server
      information/
        InformationPage.tsx      # Server
    lib/
      data.ts                    # typed JSON loaders (server-only)
      types.ts
      metadata.ts                # shared SEO helpers
      images.ts                  # URL sanitizer (reject data: URIs)
    styles/
      globals.css
      navigation.css
      home.css
      werks.css
      case-study.css
      information.css
      archive.css
    content/                     # slim JSON copies (sanitized)
      editorial-rows.json
      framer-list.json
      case-studies.json
      archive.json
      information.json
      projects.json              # slim catalog only
  public/
    fonts/HelveticaNeue-Medium.woff2
    fonts/HelveticaNeue-Bold.woff2
    images/texture.png
    images/projects/haf-bench/...
```

Rules:

- No `components/index.ts` barrel files (`bundle-barrel-imports`).
- Import from the exact file path.
- No `hooks/` folder until a second component needs the same hook.
- No `context/` for the menu. Local state in `MenuToggle` is enough.
- No `utils.ts` dumping ground.

---

## 5. Architecture that keeps the site fast

### 5.1 Default to Server Components

Almost every page is static HTML. Complex hover and drag live in small client islands, not in page files.

**Allowed Client Components:**

| Island | Why client | What it must NOT do |
|---|---|---|
| `SmoothScroll` | Lenis on `window` | must not wrap chrome in a CSS `transform`; must render `{children}` so pages stay Server Components |
| `Reveal` | Framer-style appear on enter | wrap from a Server parent; do not import page JSON; animate only `opacity` and `transform` |
| `HoverLift` | spring hover that CSS cannot do | animate transform/opacity only; do not duplicate CSS caption hover |
| `DragImage` | Framer-style grab / drag photo | drag one image (or a strip) only; `data-lenis-prevent` while dragging |
| `MenuToggle` | open / close menu | must not import page data, images, or CSS-in-JS |
| `WerksListClient` | column sort | receive the already-slim list as props; do not import JSON itself |
| `ArchiveFilters` | tag filter | receive items as props; filter in memory (tiny list) |

Do not mark a page file `'use client'` to “make animation work.” New interaction = new island in this table, same rules.

### 5.2 Split chrome so the menu does not hydrate the page

```tsx
// HeaderNav.tsx — Server Component
export function HeaderNav({ showLogo }: { showLogo: boolean }) {
  return (
    <>
      {showLogo ? <Logo /> : null}
      <MenuToggle />
    </>
  )
}
```

Logo visibility (from design spec):

- **Show** on Home, Werks Grid, Werks List, Archive
- **Hide** on Information and Case Study

Prefer a prop from the page/layout over `body:has([data-page])` if the selector fights Next.js body. Keep the CSS rule as a fallback; also set `data-page` on `<main>` exactly as prototypes do.

### 5.3 Data loading (server only)

```ts
// src/lib/data.ts
import 'server-only'
import editorial from '@/content/editorial-rows.json'
import list from '@/content/framer-list.json'
import archive from '@/content/archive.json'
import information from '@/content/information.json'
import caseStudies from '@/content/case-studies.json'

export function getEditorialRows() { return editorial }
export function getWerksList() { return list }
export function getArchive() { return archive }
export function getInformation() { return information }
export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug) ?? null
}
export function getCaseStudySlugs() {
  return caseStudies.map((c) => c.slug)
}
```

Pages call these functions. Client islands receive **already-picked fields** as props (`server-serialization`, `server-dedup-props`).

### 5.4 Images — the #1 lag risk

Facts in the current JSON:

- Most covers are `https://framerusercontent.com/images/...`
- `seek-office` and `masshiro` store **data-URI images** (~290KB and ~161KB). If those strings reach the client bundle or HTML, the site will hitch.
- `projects.json` and `editorial-rows.json` are each ~465KB because of those data URIs.
- Local high-res assets exist only for the flagship bench under `assets/images/projects/haf-bench/`.

**Hard rules:**

1. Before copying JSON into `web/src/content/`, **strip every `data:` image**. Replace with `null` and render `.placeholderBox` (already in `werks.css`) until a real file exists.
2. Use `next/image` for all real photos.
3. Allow Framer host in `next.config.ts`:

```ts
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'framerusercontent.com',
      pathname: '/images/**',
    },
  ],
}
```

4. First two visible Werks grid images: `priority`.
5. Everything else: default lazy.
6. Always pass `sizes` matching the card width (`40vw`, `50vw`, `100vw` on mobile).
7. Always set `alt` to the project title.
8. Do **not** use `background-attachment: fixed` anywhere once Lenis is on. It fights smooth scroll and janks on phones. Put the 43px noise on a `position: fixed; inset: 10px; pointer-events: none; z-index: 0` overlay (or `background-attachment: scroll`). Chrome stays `z-index: 100`.

### 5.5 Fonts

Use `next/font/local` with the two woff2 files. Do **not** load Helvetica from a CDN.

```ts
const helvetica = localFont({
  src: [
    { path: '../../public/fonts/HelveticaNeue-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/HelveticaNeue-Bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-primary',
  adjustFontFallback: 'Arial',
})
```

Keep the CSS `@font-face` **or** `next/font`, not both. Prefer `next/font` and point `--font-primary` at the Next variable. Keep fallback `'Helvetica Neue', 'Helvetica', Arial, sans-serif`.

Desktop type: `19.2px`, `letter-spacing: 0.03em`, `line-height: 100%`, color `#121212`.

### 5.6 CSS performance (from project skills)

Apply while copying CSS, do not restyle:

- Hover captions already use `transform` — keep them. Never animate `left`/`width`.
- Werks list rows and archive cards: add `content-visibility: auto` with a sensible `contain-intrinsic-size` (`rendering-content-visibility`).
- Lenis owns scrolling. Do not add extra `scroll` listeners. If any remain, they must be `{ passive: true }`.
- Do not animate SVG nodes; wrap them (`rendering-animate-svg-wrapper`).
- No inline component definitions (`rerender-no-inline-components`).
- Conditional UI uses ternary, not `&&` of possibly-`0` values (`rendering-conditional-render`).

### 5.7 Bundle rules (from `.agent/skills/react-best-practices`)

Priority order the skills already encode:

1. No waterfalls — there is no fetching, so do not add it.
2. Tiny JS — allowed client islands + `lenis` + `motion` only.
3. Direct imports, no barrels. Import `motion/react` and `lenis`, never a kitchen-sink animation kit.
4. No analytics until asked; if added later, load after hydration (`bundle-defer-third-party`).
5. Prefetch Werks/Archive/Information on menu hover via Next `<Link>` (default).
6. Dynamic-import Lenis only if it blocks LCP. Default: mount `SmoothScroll` in the root layout as a client wrapper around `{children}`.

`vercel-optimize` is for **after** production traffic exists. Do not run it during build. Use it later when the project is linked on Vercel.

### 5.8 Framer motion reference (allowed)

The live Framer site is the **feel** reference. The HTML prototypes are the **layout** reference. Do not rebuild the site inside Framer.

**Allowed packages (only these two):**

- `lenis` — smooth scroll
- `motion` — appear, hover springs, drag (the `motion/react` package, formerly Framer Motion)

Do **not** add `react-draggable`, `@dnd-kit`, `gsap`, or `react-spring`. Motion already does hover + drag.

**Framer → Next mapping**

| Framer | Implement with | Notes |
|---|---|---|
| Smooth Scroll | Lenis, `wrapper: window` / document scroll | Do **not** put the page in a `transform` wrapper. That breaks `position: fixed` logo, menu, spec table, Grid/List bar. |
| Appear / whileInView | `<Reveal>` using `motion` `whileInView` | Opacity + `y` only. `once: true`. Stagger delay ~0.05s. |
| Hover (caption slide, row color, 2D CSS) | **Existing CSS** | Keep `translateX(-101%)` caption. Do not rebuild it in Motion. |
| Hover (spring scale, lift, overlay, magnetic) | `<HoverLift>` `whileHover` / `onPointerMove` | Transform and opacity only. Use when the prototype/Framer reference is more than a CSS color change. |
| Drag image / drag gallery | `<DragImage>` / `<DragStrip>` | `drag`, `dragConstraints`, `dragElastic`, `dragMomentum`. See §5.9. |
| Spring / easing | `cubic-bezier(0.16, 1, 0.3, 1)` or spring `{ stiffness: 380, damping: 36 }` | Same curve already in `navigation.css` / `werks.css`. |
| Page transitions | **Not in v1** | Adds route-level client JS. Add later only if Night asks. |

**`SmoothScroll` rules**

```tsx
'use client'
// mounts Lenis on window, requestAnimationFrame loop, destroy on unmount
// render: <>{children}</>
// respect prefers-reduced-motion: do not start Lenis
```

- Logo, menu, spec list, view switcher stay `position: fixed` on the viewport.
- They must be **siblings** of the scrolling content, not inside a transformed Lenis content node.
- Touch devices: keep Lenis but do not fight native momentum; if it feels laggy on iOS, disable Lenis below `809.98px`.

**`Reveal` rules**

A Server page does this (legal in Next.js — server children passed into a client wrapper):

```tsx
<Reveal>
  <WorkCard ... />
</Reveal>
```

- Animate `opacity` and `transform` only. Never `top`, `height`, `padding`, `filter: blur` on large images.
- Do not wrap the whole page in one `Reveal`.
- On `prefers-reduced-motion: reduce`, render children with no animation.
- Do not use `layout` animations on the Werks grid. Editorial widths come from JSON; layout animation will hitch.

**If it lags, cut in this order:** disable Reveal on list/archive → disable magnetic hover → disable Lenis on mobile → keep CSS hover and simple drag. Never delete the 10px frame to “fix performance.”

### 5.9 Complex hover + drag (wanted)

The site is allowed to feel like a Framer project: hover that springs, images you can grab. Complexity is OK. Hydrating a whole route is not.

**How to choose hover**

1. Color, underline, caption slide, opacity → **CSS** (already in the prototypes).
2. Spring scale, lift, directional overlay, cursor-follow inside a card → **`HoverLift`** (Motion).
3. Never run CSS `transition` and Motion `whileHover` on the **same** property.

Server page pattern:

```tsx
<HoverLift>
  <WorkCard ... />
</HoverLift>
```

`WorkCard` stays a Server Component passed as `children`.

**Drag images**

Use Motion, not a DnD library.

```tsx
'use client'
// DragImage
<motion.div
  drag
  dragConstraints={parentRef}  // or { top, left, right, bottom }
  dragElastic={0.12}
  dragMomentum
  whileDrag={{ cursor: 'grabbing' }}
  style={{ cursor: 'grab', touchAction: 'none' }}
/>
```

Rules:

- Drag **one surface** (one photo, or one horizontal strip). Do not make the whole page draggable.
- Put `data-lenis-prevent` on the drag surface so grabbing a photo does not smooth-scroll the page.
- Animate `x` / `y` transforms only. Do not change `left`/`top`/`width` during drag.
- Case-study gallery: default is scroll (Framer `fit-width` rows). Add `DragImage` / `DragStrip` only on frames the prototype or Night marks as draggable.
- Werks grid cards: hover is default; drag only if the reference does it. Do not make every grid card draggable.
- On `prefers-reduced-motion: reduce`: disable drag momentum and magnetic hover; static image remains.
- Touch: `touch-action: none` on the handle. Do not `preventDefault` on `touchstart` of `document`.
- Keyboard: drag is pointer-only; the image is still in the document for screen readers (`alt` stays on the img).

**Where this is expected**

| Surface | Hover | Drag |
|---|---|---|
| Werks grid card | CSS caption + optional `HoverLift` | no, unless Night marks it |
| Werks list row | CSS color | no |
| Case study photo | optional lift | **yes** when the frame is a grab/pan image |
| Archive card | CSS opacity | no |
| Menu | CSS | no |

When Night adds a prototype with drag, Gemini ports the **layout** from HTML/CSS and wires `DragImage` / `DragStrip` instead of inventing a new library.

---

## 6. SEO (static, no CMS)

Implement in `layout.tsx` + per-page `metadata` + `sitemap.ts` + `robots.ts`.

**Site defaults**

- Title template: `%s — HAF WERKS`
- Default title: `HAF WERKS — Explorative Architecture, Objects and Spatial Design Practice`
- Description: from `information.json` about text (trim to ~155 chars).
- `metadataBase`: production domain (placeholder `https://hafwerks.com` until Night confirms).
- `openGraph.type`: `website`
- Locale: `en_ID` / `id_ID` optional later; start `en`.
- Icons: simple SVG or PNG later; not blocking.

**Per route**

| Route | Title | Index |
|---|---|---|
| `/` | default title | yes |
| `/werks` | `Werks` | yes |
| `/werks/list` | `Werks — List` | yes, canonical can stay `/werks/list` |
| `/werks/[slug]` | project title | yes if case study exists |
| `/information` | `Information` | yes |
| `/archive` | `Archive` | yes |

Also:

- Semantic landmarks: one `h1` per page (can be visually hidden on Home if the logo is the brand; still put an `h1` in DOM).
- JSON-LD `Architect` / `ProfessionalService` on Home + Information.
- `sitemap.ts` emits all static routes + case-study slugs.
- `robots.ts` allows `/`, sitemap url set.
- Images have width/height (via `next/image`) so CLS stays 0.
- Menu buttons: `aria-expanded`, `aria-label` (already in prototype).
- Contrast is already `#121212` on white. Keep it.

Do not add a blog, CMS metadata fields, or `generateMetadata` that awaits a network.

---

## 7. Visual fidelity rules (non-negotiable)

Copy from `static-site-design/styles/` into `web/src/styles/` and import them in `layout.tsx`.

Must remain exact:

- 10px white frame (`.website-shell` padding)
- 43px repeating noise (`texture.png`)
- White block badges, no shadows, no gradients, no extra borders
- Logo text: `H A F WERKS` + `·`
- Menu: `◀ Menu` / `▶ Close` then Werks, Archive, Information
- Werks hover: caption overlay `translateX(-101%)` → `0`
- Bottom Grid/List pill
- Information 3-column grid: `138px 108px 1fr` with `120px` gaps
- Case study spec table: fixed `top: 10px; left: 10px; width: min(409.6px, calc(100vw - 20px))`
- Gallery sections: `calc(100vh - 20px)` with `fit-width` / `cover` / `contain`

Gemini may add CSS only for:

- `content-visibility`
- noise overlay (`position: fixed`) instead of `background-attachment: fixed`
- `next/image` fill wrappers (`position: relative` already exists on `.imageContainer`)
- `prefers-reduced-motion` overrides

Gemini may not “improve” spacing, type scale, or color.

`next/image` with `fill` + `object-fit: cover` must sit inside the existing `.imageContainer` that already has `aspect-ratio` from JSON.

---

## 8. Page-by-page build spec

### Phase A — Bootstrap (`web/`)

Create Next.js app with App Router, TypeScript, ESLint, no Tailwind, no `src` debate: **use `src/`**. Install only `lenis` and `motion`.

`next.config.ts`:

- `reactStrictMode: true`
- `images.remotePatterns` as above
- `poweredByHeader: false`
- optional: `experimental.optimizePackageImports` only if a package is added later
- `compiler.removeConsole` in production: `['log', 'debug']`

Copy fonts, texture, local images, CSS, sanitized JSON.

Root layout renders:

```html
<body>
  <SmoothScroll>
    <div class="website-shell">
      <HeaderNav />
      <div class="texture-wrapper">{children}</div>
    </div>
  </SmoothScroll>
</body>
```

`SmoothScroll` must not apply CSS `transform` to `.website-shell`. Fixed chrome must keep viewport positioning.

Verify `pnpm dev` / `npm run dev` shows a white 10px frame and texture before any page content.

### Phase B — Home `/`

Port `prototypes/index.html` + `home.css`.

Server Component. Shared menu + root Lenis only. Optional `Reveal` on the bottom info block.

Bottom-anchored intro + studio. Contact mailto / tel as in prototype.

LCP on Home is text, not an image. Good. Keep it that way.

### Phase C — Information `/information`

Port `information.html`. Hide logo. Server Component.

Do not hardcode copy. Read `information.json`.

### Phase D — Werks Grid `/werks`

Port `werks.html`. Server Component grid.

- Data: sanitized `editorial-rows.json`
- Card width + aspect-ratio from JSON (inline style is OK; the prototype does this)
- Optional `<Reveal>` per row or per card (appear). Caption slide stays CSS. Extra spring hover uses `<HoverLift>`, not a second caption animation.
- ViewSwitcher links to `/werks` (active) and `/werks/list`
- Images: `next/image` fill, first two `priority`

Do not make the grid a client component.

### Phase E — Werks List `/werks/list`

Port `werks-list.html`.

Server renders the table. Client island only for sort.

Sort behavior from the template:

- click header → sort that column
- click again → toggle asc/desc
- year default first-click is `desc`
- others default `asc`
- hover row → text goes full `#121212`
- row click → `/werks/[slug]`

Add `content-visibility: auto` on `.listRow`.

### Phase F — Case study `/werks/[slug]`

Port `case-study.html`.

- `generateStaticParams` from `case-studies.json`
- `dynamicParams = false` **or** a dedicated not-found/placeholder for catalog slugs that have no case study yet. Prefer a minimal placeholder that still uses case-study chrome (hidden logo, spec list with title/type/location/status from `projects.json` if available, one cover image). Do not 404 a published Werks card.
- Gallery sizing modes from JSON (`fit-width`, `cover`, `contain`)
- First gallery image `priority`
- Draggable photos use `<DragImage>` / `<DragStrip>` (PLAN.md §5.9), not a page-level `'use client'`
- `data-lenis-prevent` on drag surfaces so Lenis does not steal the pointer

Only one full case study exists today: `circular-modular-bench` (WHF101-2026). All other slugs wait for Night to add JSON + prototype sections.

### Phase G — Archive `/archive`

Port `archive.html`.

Server renders title + grid. Client island filters tags.

Counter `archive (N)` uses the filtered length.

Square 1:1 images. `next/image` fill + `object-fit: cover`.

### Phase H — SEO + 404 + sitemap

Then stop. Do not add blog, contact form backend, or CMS.

---

## 9. Protocol: Night adds another page

When Night drops a new prototype:

1. Put HTML in `static-site-design/prototypes/<name>.html`
2. Put CSS in `static-site-design/styles/<name>.css` (or extend an existing file)
3. Put JSON in `static-site-design/data/` if needed
4. Tell Gemini: **“Port prototype `<name>` using PLAN.md section 9.”**

Gemini then:

1. Diff the new HTML against existing components. Reuse HeaderNav / shell. Do not duplicate chrome.
2. Copy CSS 1:1 into `web/src/styles/` and import it.
3. Create `web/src/app/<route>/page.tsx` as a Server Component.
4. Extract only the interactive bits into one Client Component.
5. Sanitize images (no `data:` URIs).
6. Add `metadata` + sitemap entry.
7. Visual-check against the prototype at **desktop >810px** and **mobile 390px**.
8. Do not touch unrelated pages.

If the new page needs a new client island, list it in a short note at the bottom of this PLAN.md (Grok should confirm). Until then, Gemini assumes server-first.

---

## 10. Definition of done (every page)

A page is done only if all of these are true:

**Design**

- Side-by-side with the prototype: frame, type, spacing, hover, mobile wrap match.
- No extra shadows, radii, or colors.

**Speed**

- Page JS is only the shared menu chunk + that page’s island (if any).
- Grid/list/archive images are not data URIs.
- No layout shift from images (width/height or `fill` in a sized box).
- `npm run build` succeeds with all routes static.

**Correctness**

- Menu opens/closes, Escape is nice-to-have, click-outside is optional (prototype does not require it — do not add unless asked).
- Links use Next `<Link>`.
- Missing images render `.placeholderBox`, never a broken icon.
- No hydration warnings.

**SEO**

- Unique title + description.
- One `h1`.
- Sitemap includes the route.

---

## 11. Gemini execution order (copy this into Antigravity)

Do these prompts **one at a time**. Do not batch the whole site in one shot.

### Prompt 1 — Bootstrap

> Read `/PLAN.md` and `.agent/skills/react-best-practices/SKILL.md`. Create the Next.js app in `web/` exactly as PLAN.md section 3–4. Copy CSS, fonts, texture, local images. Sanitize JSON into `web/src/content/` (strip `data:` image URLs). Wire root layout + WebsiteShell + HeaderNav/MenuToggle + SmoothScroll (Lenis on window, no transform wrapper). Install only `lenis` and `motion`. Stop when `npm run dev` shows the 10px frame and texture.

### Prompt 2 — Home

> Port `static-site-design/prototypes/index.html` to `web/src/app/page.tsx` using PLAN.md Phase B. Server Component only. Match `home.css`.

### Prompt 3 — Information

> Port `information.html` using Phase C. Hide logo. Read `information.json`.

### Prompt 4 — Werks Grid

> Port `werks.html` using Phase D. Server Component. `next/image`. First two images `priority`. CSS caption hover. Optional HoverLift for spring (PLAN.md §5.9). ViewSwitcher. No drag on grid cards unless the prototype shows it.

### Prompt 5 — Werks List

> Port `werks-list.html` using Phase E. Sort as a client island. Slim props only.

### Prompt 6 — Case study

> Port `case-study.html` using Phase F. `generateStaticParams`. Flagship slug `circular-modular-bench`. Placeholder for other catalog slugs. Use DragImage/DragStrip from PLAN.md §5.9 for grab/pan photos. Do not make the page a Client Component.

### Prompt 7 — Archive

> Port `archive.html` using Phase G. Filter island only.

### Prompt 8 — SEO + QA

> Add metadata, sitemap, robots, JSON-LD, not-found. Run `npm run build`. Confirm every route is static. Fix hydration warnings. Do not add features.

After each prompt, Night (or Grok) checks the page against the prototype before the next prompt.

---

## 12. Known traps (read before coding)

1. **`react-templates/` are not production.** Copying them will make a slow, all-client site.
2. **`projects.json` / `editorial-rows.json` are 465KB** because two covers are data URIs. Sanitize first.
3. **`background-attachment: fixed`** will lag phones. Override on mobile.
4. **`:has()` logo hiding** can be flaky with Next.js body. Also pass `showLogo`.
5. **Do not use CSS Modules** if it means renaming classes. Global CSS with the prototype class names is correct.
6. **Do not wrap images in extra cards** that add padding the prototype does not have.
7. **Framer CDN URLs are allowed** via `remotePatterns`. Prefer them over inlining.
8. **Only one real case study exists.** Do not duplicate bench content onto other slugs.
9. **No Sanity “for later.”** Frontend only. JSON is the CMS.
10. **Ponytail rule:** smallest complete change. No abstraction for one use.
11. **Hover + drag are in scope.** CSS for simple hover, `HoverLift` / `DragImage` for Framer-level motion. Do not add a third animation library to get drag.

---

## 13. Skills Gemini should follow (already in this repo)

Read when relevant. Do not dump all 70 rules into every file.

| Skill | When |
|---|---|
| `.agent/skills/react-best-practices/SKILL.md` | writing any React/Next code |
| `.agent/skills/ponytail/SKILL.md` | keep diffs small; no extra layers |
| `.agent/skills/web-design-guidelines/SKILL.md` | after UI exists, accessibility pass |
| `.agent/skills/ponytail-review/SKILL.md` | after a page lands, review the diff |
| `.agent/skills/vercel-optimize/SKILL.md` | only after Vercel production traffic |
| `.agent/skills/caveman/SKILL.md` | ignore unless Night asks |

Highest-impact rules for this site, in order:

1. `bundle-dynamic-imports` / no extra JS
2. `bundle-barrel-imports`
3. `server-serialization` (slim props to client)
4. `rendering-content-visibility` (list + archive)
5. `client-passive-event-listeners` (if any scroll code appears)
6. `rerender-no-inline-components`
7. `rendering-resource-hints` (preconnect `framerusercontent.com` on Werks/Archive)

---

## 14. Out of scope (do not build)

- Sanity / any CMS
- Auth, forms that post to a server, newsletters
- i18n
- Dark mode
- Cookie banners
- Analytics (until Night asks)
- Blog
- Admin
- GSAP, Locomotive Scroll, AOS, Three.js
- Route-level page transitions (v1)
- Loading skeletons (pages are static and tiny)
- Image download pipeline from Framer (optional later; not v1)

When Night wants CMS again, Grok will add a new plan section. Until then JSON is frozen at build time.

---

## 15. Success criteria for Vercel

After deploy:

- Home TTFB from CDN (static).
- JS on Home ≈ menu island + Lenis + Motion runtime. Nothing else.
- Werks Grid: images via `/_next/image`, not raw 4K files into the browser.
- No function invocations for page views (static).
- Lighthouse (mobile): Performance ≥ 90 as a target, SEO ≥ 90, no CLS from the grid.
- Menu, sort, filter, hover captions work on production, not only localhost.

If something lags, check in this order: data-URI images → too many `'use client'` → Lenis wrapping a transformed node (breaks `position: fixed`) → `background-attachment: fixed` vs Lenis → unoptimized images → Reveal on every list row → a third animation library. Do not rewrite the design.



## 16. NOTES FROM ADMIN! AND MANDATORY!!!
- ALWAYS IMPLEMENT THE SAME LAYOUT APPROACH AS THE PROTOTYPE HTML FILE
