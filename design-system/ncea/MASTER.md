# NCEA community surfaces design system

This file is the project-scoped source of truth for Auth, Forum, Marketplace, and account UI.
It intentionally overrides the generic dark forum recommendation generated during discovery.

## Direction

- Preserve the existing NCEA light visual system and navigation chrome.
- Treat community pages as editorial workspaces, not a generic admin dashboard.
- Use one signature device: a restrained red-to-orange activity rail that connects category,
  topic, listing, and account cards without adding ornamental Minecraft UI.
- Keep motion subtle and functional. Respect `prefers-reduced-motion` everywhere.

## Tokens

| Role           | Value                             |
| -------------- | --------------------------------- |
| Background     | `#ffffff`                         |
| Foreground     | `#18181b`                         |
| Muted surface  | `#f5f5f4`                         |
| Muted text     | `#71717a`                         |
| Border         | `#e7e7e9`                         |
| Primary        | `#ff5a17`                         |
| Accent         | `#ff8a22`                         |
| Brand gradient | `#ff1738` → `#ff4d1f` → `#ff8a22` |
| Destructive    | `#ff3b3b`                         |

- Typography: existing Manrope display/body stack.
- Radius: existing `--radius` scale; primary cards use `1.5rem` to `2rem`.
- Shadows: quiet neutral shadows; brand-colored shadows only on primary calls to action.
- Layout: mobile-first, maximum content width aligned with the current site header/footer.

## Interaction rules

- Native buttons and links; no clickable `div` elements.
- Minimum interactive target size: 44×44px.
- Visible labels and inline field errors connected with `aria-describedby`.
- Password managers and paste remain enabled.
- Loading, empty, error, locked, draft, and archived states are always explicit.
- Plain forum/listing text is rendered as text with preserved line breaks; never inject HTML.
- Images reserve their aspect ratio to avoid layout shift.
- Desktop navigation may contain the complete route set; mobile uses a compact menu rather
  than exceeding five persistent bottom-navigation items.

## Responsive checkpoints

- 375px: single-column forms and cards; actions stack without horizontal scrolling.
- 768px: category and listing grids become two columns where useful.
- 1024px: detail pages use main-content/sidebar composition.
- 1440px: line length remains bounded; density does not expand indefinitely.

## Pre-delivery checks

- Contrast at least 4.5:1 for body text.
- Keyboard access and visible focus for every action.
- Icon-only controls have accessible names; decorative icons use `aria-hidden`.
- No hover-only actions.
- Reduced motion produces a complete, visible final state.
- Browser back/deep links work for category, topic, listing, edit, and account routes.
