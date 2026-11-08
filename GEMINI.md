# Gemini — start here

You are executing the HAF WERKS frontend in **Next.js App Router**. You are not the architect. Do not scaffold Vite, Astro, CRA, or a static HTML site.

1. Read [`PLAN.md`](./PLAN.md) fully. For any Case Study page (`/werks/[slug]`), strictly follow [`CASE_STUDY_SPEC.md`](./CASE_STUDY_SPEC.md). Every `.editorialRow` is strictly `100vh` across all breakpoints; on mobile, `.heroSection` fits content height (`height: fit-content; min-height: auto`).
2. Read the prototype HTML + CSS for the **one** page in the current prompt.
3. Implement that page only, inside `web/`.
4. Match the prototype pixels. Do not restyle.
5. Server Components by default. Client islands only as listed in PLAN.md §5.1.
6. No CMS, no Tailwind. Animation stack is **Lenis + Motion only** (PLAN.md §5.8–5.9). Hover and image-drag are in scope as client islands. No GSAP, no dnd-kit.
7. Stop at the prompt’s “done” line. Wait for the next prompt.

Design source: `static-site-design/`
Product: `web/`
Skills: `.agent/skills/react-best-practices/SKILL.md` and `.agent/skills/ponytail/SKILL.md`

If PLAN.md and a prototype disagree on layout, follow the prototype.
If they disagree on architecture, follow PLAN.md.
