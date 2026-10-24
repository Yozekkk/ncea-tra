import { useRef } from "react";
import { useInView } from "motion/react";

export function BrandMarquee({ text, compact = false }: { text: string; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.01 });
  return (
    <div
      ref={ref}
      className={`${compact ? "marketplace-ticker" : "ncea-marquee"}${visible ? " is-visible" : ""}`}
      aria-hidden="true"
    >
      <span>
        {text}
        {text}
      </span>
    </div>
  );
}
