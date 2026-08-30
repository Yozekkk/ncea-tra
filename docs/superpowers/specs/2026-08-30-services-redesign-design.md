# NCEA `/services` — Obsidian Service Atlas

## Purpose

Turn the existing catalogue into a premium, grouped service system while preserving the 12 current services, their routes, NCEA navigation, footer, Manrope typography, and orange brand accent.

## Art direction

The page is an editorial Minecraft service atlas: near-black, precise, tall and framed. It borrows the reference's portrait proportions, nested panels, large typography, and physical hover response without copying its purple palette or branding.

### Tokens

- Obsidian: `#090909`
- Carbon: `#101011`
- Raised carbon: `#171719`
- Primary text: `#f7f5f2`
- Secondary text: `#b7b4af`
- NCEA orange: `#ff6a00`
- Warm highlight: `#ff9c4a`
- Hairline: `rgba(255, 255, 255, 0.11)`

Manrope remains the only page font. Display copy uses 800 weight and tight tracking. Utility metadata uses Manrope 700 with uppercase tracking; no additional display or mono font is introduced.

## Composition

```text
┌──────────────────────────── HERO ──────────────────────────────┐
│ 12 DIRECTIONS                         NCEA / SERVICE ATLAS      │
│ SERVICES                                                         │
│ FOR MINECRAFT                                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────── GROUP 01 ────────┐ ┌──────── GROUP 02 ────────┐ ┌──── GROUP 03 ────┐
│ MINECRAFT                 │ │ CONTENT                  │ │ OTHER             │
│ DEVELOPMENT               │ │ & DESIGN                 │ │ SERVICES          │
│                           │ │                          │ │                   │
│ nested service links      │ │ nested service links     │ │ nested links      │
│                           │ │                          │ │                   │
│ nested CTA panel          │ │ nested CTA panel         │ │ nested CTA panel  │
└───────────────────────────┘ └──────────────────────────┘ └───────────────────┘
```

At 1280px and above, all three groups form a 12-column portrait triptych (5/4/3 columns) with intentionally different widths but a shared top and bottom baseline. At 1024px, group 01 spans the full row and groups 02/03 split the second row. Below 768px, cards stack in reading order.

The signature element is a low-opacity orange voxel ribbon made from CSS-only stepped geometry behind the triptych. It supplies Minecraft-specific atmosphere without introducing decorative artwork or another dependency.

## Group hierarchy

Each `ServiceGroupCard` contains:

1. ordered number and English utility label;
2. service count;
3. large Russian display title;
4. concise group description;
5. a nested list of genuine service links;
6. a separate Telegram CTA panel.

Numbering communicates the existing catalogue order rather than a process. Every service remains a semantic TanStack `<Link>` and every CTA remains a real `<a>`.

## Interaction

On fine pointers only, `ServiceGroupCard` writes `--mouse-x`, `--mouse-y`, `--tilt-x`, and `--tilt-y` directly to its DOM node through one `requestAnimationFrame`. React state is never updated during pointer movement.

- maximum tilt: `1.1deg`;
- lift: `-6px`;
- scale: `1.008`;
- border illumination and radial surface light follow the cursor;
- an inner art layer moves at a smaller depth;
- leave returns through `cubic-bezier(.22, 1, .36, 1)`.

Service links brighten, shift their title 4px, expose an orange hairline, and move the arrow 4px. Focus-visible receives a high-contrast orange/white ring independent of the hover effect.

Scroll entrance runs once through `IntersectionObserver`: opacity, 24px rise, and limited 6px blur with 70ms stagger. Reduced motion renders the final state immediately and disables tilt, parallax, blur, and atmospheric movement.

## Responsive and accessibility

- No cursor-follow behavior on coarse pointers or below tablet width.
- Minimum 44px interactive height; nested service rows target 56px or more.
- No horizontal overflow at 360, 390, 430, 768, 1024, 1280, or 1440px.
- Text contrast is at least WCAG AA on composed dark surfaces.
- Decorative geometry and icons are hidden from assistive technology.
- Keyboard order follows the visual order; sticky navbar cannot obscure focused targets.
- Explicit image dimensions are retained wherever raster assets appear.

## Component boundaries

- `src/routes/services.tsx`: route metadata, catalogue configuration, hero, grouping, semantic links.
- `src/components/site/ServiceGroupCard.tsx`: reusable framed group shell and pointer CSS-variable controller.
- `src/styles.css`: a final, isolated `.services-experience` layer; existing homepage and service-detail selectors remain untouched.

No GSAP, Framer Motion, React canary, or new dependency is required. React View Transitions are intentionally omitted because this page has no shared-element continuity and the current TanStack application does not need an experimental runtime change for a static catalogue.

## Verification

Run ESLint, TypeScript `--noEmit`, site verification, and Vite production build. Use browser automation at 1440×1000 and 390×844 for screenshots, console/network/overflow checks, keyboard focus, reduced motion, accessibility audit, and all 12 service routes.
