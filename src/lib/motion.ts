import type { Transition, Variants } from "motion/react";

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const MOTION_DURATION = {
  fast: 0.18,
  normal: 0.3,
  reveal: 0.52,
} as const;

export const MOTION_SPRING: Transition = {
  type: "spring",
  duration: 0.32,
  bounce: 0.16,
};

export const MOTION_VIEWPORT = { once: true, margin: "-72px" } as const;

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.06,
    },
  },
};

export const revealItem: Variants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(0, 18px, 0)",
  },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: MOTION_DURATION.reveal,
      ease: MOTION_EASE,
    },
  },
};

export function directionalReveal(direction: "left" | "right" | "up" = "up", delay = 0): Variants {
  const hiddenTransform =
    direction === "left"
      ? "translate3d(-22px, 0, 0)"
      : direction === "right"
        ? "translate3d(22px, 0, 0)"
        : "translate3d(0, 20px, 0)";

  return {
    hidden: { opacity: 0, transform: hiddenTransform },
    visible: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: { delay, duration: MOTION_DURATION.reveal, ease: MOTION_EASE },
    },
  };
}
