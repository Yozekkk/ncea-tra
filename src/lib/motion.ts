import type { Transition, Variants } from "motion/react";

/**
 * Content motion is copied from `/workers`, the site's motion source of truth.
 * Keep these values in sync with the reference route; do not tune them per page.
 */
export const WORKERS_MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export const WORKERS_MOTION_DURATION = {
  heading: 0.76,
  item: 0.84,
} as const;

export const WORKERS_MOTION_VIEWPORT = { once: true, amount: 0.16 } as const;

export const workersStaggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.12,
    },
  },
};

const WORKERS_CARD_START_X = [180, 120, 60, -60, -120, -180] as const;

/** Exact indexed card entrance used by the `/workers` deck. */
export const workersCardReveal: Variants = {
  hidden: (index: number) => ({
    opacity: 0,
    x: WORKERS_CARD_START_X[index],
    y: 40,
    scale: 0.95,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: WORKERS_MOTION_DURATION.item,
      ease: WORKERS_MOTION_EASE,
    },
  },
};

export const workersHeadingReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: WORKERS_MOTION_DURATION.heading,
      ease: WORKERS_MOTION_EASE,
    },
  },
};

export const workersItemReveal: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: WORKERS_MOTION_DURATION.item,
      ease: WORKERS_MOTION_EASE,
    },
  },
};

export function workersDirectionalReveal(direction: "left" | "right" | "up" = "up"): Variants {
  const x = direction === "left" ? -60 : direction === "right" ? 60 : 0;

  return {
    hidden: { opacity: 0, x, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: WORKERS_MOTION_DURATION.item,
        ease: WORKERS_MOTION_EASE,
      },
    },
  };
}

/** Header and footer values are also part of the `/workers` baseline. */
export const CHROME_MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const CHROME_MOTION_DURATION = {
  fast: 0.18,
  normal: 0.3,
  reveal: 0.52,
} as const;

export const CHROME_MOTION_SPRING: Transition = {
  type: "spring",
  duration: 0.32,
  bounce: 0.16,
};

export const CHROME_MOTION_VIEWPORT = { once: true, margin: "-72px" } as const;

export const chromeStaggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.06,
    },
  },
};
