---
name: framer-motion
description: Use this skill when the user wants to add animations to a React project using Framer Motion. Triggers on: "animate", "animation", "framer motion", "framer", "motion", "transition", "page transition", "scroll animation", "hover animation", "fade in", "slide in", "spring animation", "whileHover", "whileTap", "variants", "AnimatePresence", "useScroll", "useTransform", "layout animation", "drag animation", "gesture". Also use when the user asks to make a React UI "more animated", "more dynamic", "feel alive", or "more interactive".
---

This skill guides the implementation of high-quality animations in React using Framer Motion (v12+, imported as `motion` from the `motion/react` package).

The user may ask to animate a specific component, add page transitions, create scroll-driven effects, or build interactive gestures.

## Setup

```bash
npm install motion
```

Import from `motion/react` (v12+):
```tsx
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react"
```

> Note: For v10/v11, import from `framer-motion`. For v12+, use `motion/react`.

## Core Concepts

### 1. Basic Motion Components
Replace any HTML element with its `motion.*` counterpart:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
/>
```

### 2. Variants — Orchestrate Complex Animations
Use variants to coordinate parent/child animations with `staggerChildren`:
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.li key={i} variants={item}>{i}</motion.li>
  ))}
</motion.ul>
```

### 3. Gestures
```tsx
<motion.button
  whileHover={{ scale: 1.05, backgroundColor: "#f0f0f0" }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
/>
```

### 4. AnimatePresence — Mount/Unmount Animations
Always wrap conditionally rendered elements:
```tsx
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    />
  )}
</AnimatePresence>
```

### 5. Scroll Animations
```tsx
const { scrollYProgress } = useScroll()
const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])
const y = useTransform(scrollYProgress, [0, 0.3], [50, 0])

<motion.section style={{ opacity, y }} />
```

For scroll-triggered entry (viewport):
```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
/>
```

### 6. Layout Animations
Framer Motion auto-animates layout changes — just add `layout`:
```tsx
<motion.div layout className={expanded ? "large" : "small"} />
```

For shared element transitions across components, use `layoutId`:
```tsx
// Component A
<motion.div layoutId="hero-image" />
// Component B (different route/state)
<motion.div layoutId="hero-image" />
```

### 7. Page Transitions (React Router / Next.js)
```tsx
// Wrap page content
<AnimatePresence mode="wait">
  <motion.main
    key={router.pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  />
</AnimatePresence>
```

### 8. Drag
```tsx
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
  dragElastic={0.1}
  whileDrag={{ scale: 1.05, cursor: "grabbing" }}
/>
```

## Transition Recipes

| Effect | Config |
|--------|--------|
| Snappy spring | `{ type: "spring", stiffness: 500, damping: 30 }` |
| Gentle spring | `{ type: "spring", stiffness: 200, damping: 20 }` |
| Smooth ease | `{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }` |
| Bounce | `{ type: "spring", stiffness: 600, damping: 15 }` |
| Slow cinematic | `{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }` |

## Animation Patterns — When to Use What

- **Page load / hero**: `initial` + `animate` with `staggerChildren` on container
- **List items appearing**: variants with `staggerChildren: 0.05–0.1`
- **Modals / drawers / dropdowns**: `AnimatePresence` + scale/opacity/y
- **Hover cards**: `whileHover` with subtle scale (1.02–1.05) + shadow
- **Buttons**: `whileTap={{ scale: 0.95–0.98 }}` always feels good
- **Scroll reveals**: `whileInView` + `viewport={{ once: true }}`
- **Progress bars / counters**: `useMotionValue` + `animate()`
- **Tabs / accordions**: `layout` + `AnimatePresence`

## Performance Rules

1. **Animate only `transform` and `opacity`** — they run on the GPU (scale, x, y, rotate, opacity). Avoid animating `width`, `height`, `top`, `left` directly.
2. **Use `will-change: transform`** on frequently animated elements via `style`.
3. **`viewport={{ once: true }}`** on scroll animations — don't re-trigger on scroll up.
4. **Avoid animating on every keystroke** — debounce or use `useMotionValue`.
5. **Keep `staggerChildren` ≤ 0.15s** for lists > 10 items or it feels slow.

## Implementation Approach

1. **Identify what to animate**: entry/exit, hover states, scroll reveals, layout shifts, page transitions
2. **Choose the right tool**: basic motion props → variants → AnimatePresence → scroll hooks
3. **Start subtle**: 20px y-offset, 0.3–0.5s duration, spring for interactive elements
4. **Layer purposefully**: not everything needs animation — highlight what matters
5. **Test feel**: springs feel alive, ease-out feels smooth, linear feels robotic
