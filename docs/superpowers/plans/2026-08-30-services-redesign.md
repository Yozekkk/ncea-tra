# NCEA `/services` Redesign Implementation Plan

## Task 1: Build the grouped card component

Create `src/components/site/ServiceGroupCard.tsx` with an explicit `variant` union (`primary | creative | compact`) instead of boolean appearance props. Use a single DOM ref and requestAnimationFrame to update CSS variables on fine-pointer hover. Render header, title, description, service link list, decorative voxel layer, and CTA panel as composed children.

Verify with `tsc --noEmit`.

## Task 2: Recompose the route

Replace the linear sections in `src/routes/services.tsx` with a scoped `.services-experience` page, an editorial hero, CSS voxel atmosphere, and a 12-column group grid. Keep `GROUPS`, `SERVICES`, and every existing `service.path`. Add only group presentation metadata and route-safe real links.

Verify that exactly 12 service links render and their paths match the service catalogue.

## Task 3: Implement the visual and motion system

Append a scoped services catalogue layer to `src/styles.css`. Define dark semantic tokens, portrait card proportions, nested frames, border gradients, responsive triptych rules, focus-visible states, pointer-light variables, hover/press transitions, IntersectionObserver reveal states, and reduced-motion overrides. Do not change global homepage component styles.

Verify at 1440, 1280, 1024, 768, 430, 390, and 360px with no horizontal overflow.

## Task 4: Browser QA and polish

Start the Vite development server and run agent-browser verification. Capture 1440×1000 and 390×844 full-page screenshots. Inspect visual mass, baseline alignment, group height, service-row density, CTA alignment, navbar/footer transition, keyboard order, focus visibility, hover response, reduced motion, console errors, failed requests, and axe results. Apply one polishing pass from screenshot evidence.

## Task 5: Complete verification and delivery

Run:

```bash
eslint .
tsc --noEmit
node scripts/verify-site.mjs
vite build
```

Then re-check all 12 service routes and production-like preview. Review changed TSX files against React best practices and fetch/apply the latest Web Interface Guidelines. Commit and push only after all checks pass; deploy through the existing workflow if the project connection is available.
