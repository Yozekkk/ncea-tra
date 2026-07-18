import { useRef, useEffect, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  perspective?: number;
};

export function TiltCard({
  children,
  className = "",
  max = 7,
  scale = 1.02,
  perspective = 1400,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  // animation state
  const target = useRef({ rx: 0, ry: 0, s: 1, gx: 50, gy: 50, gO: 0 });
  const current = useRef({ rx: 0, ry: 0, s: 1, gx: 50, gy: 50, gO: 0 });
  const rafRef = useRef<number | null>(null);
  const hoveringRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    const glare = glareRef.current;
    if (!wrap || !inner) return;

    const tick = () => {
      const c = current.current;
      const t = target.current;
      // spring easing (lerp)
      const k = 0.12;
      c.rx += (t.rx - c.rx) * k;
      c.ry += (t.ry - c.ry) * k;
      c.s += (t.s - c.s) * k;
      c.gx += (t.gx - c.gx) * k;
      c.gy += (t.gy - c.gy) * k;
      c.gO += (t.gO - c.gO) * k;

      inner.style.transform = `perspective(${perspective}px) rotateX(${c.rx.toFixed(3)}deg) rotateY(${c.ry.toFixed(3)}deg) scale(${c.s.toFixed(4)})`;

      // dynamic shadow based on tilt
      const shX = (-c.ry / max) * 30;
      const shY = (c.rx / max) * 30 + 20;
      const blur = 40 + Math.abs(c.rx) * 3 + Math.abs(c.ry) * 3;
      const lift = (Math.abs(c.rx) + Math.abs(c.ry)) / (max * 2);
      inner.style.filter = `drop-shadow(${shX.toFixed(1)}px ${shY.toFixed(1)}px ${blur.toFixed(1)}px rgba(0,0,0,${(0.35 + lift * 0.25).toFixed(3)}))`;

      if (glare) {
        glare.style.opacity = String(c.gO);
        glare.style.background = `radial-gradient(circle at ${c.gx}% ${c.gy}%, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)`;
      }

      const still =
        Math.abs(t.rx - c.rx) < 0.01 &&
        Math.abs(t.ry - c.ry) < 0.01 &&
        Math.abs(t.s - c.s) < 0.001 &&
        Math.abs(t.gO - c.gO) < 0.005;
      if (still && !hoveringRef.current) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      // px, py 0..1; center 0.5. Top-left → tilt back+left: rotateX positive, rotateY negative
      const nx = px - 0.5;
      const ny = py - 0.5;
      target.current.ry = nx * max * 2;
      target.current.rx = -ny * max * 2;
      target.current.s = scale;
      target.current.gx = px * 100;
      target.current.gy = py * 100;
      target.current.gO = 1;
      start();
    };

    const onEnter = () => {
      hoveringRef.current = true;
      start();
    };

    const onLeave = () => {
      hoveringRef.current = false;
      target.current.rx = 0;
      target.current.ry = 0;
      target.current.s = 1;
      target.current.gO = 0;
      // small wobble
      const wobble = [
        { rx: max * 0.25, ry: -max * 0.2 },
        { rx: -max * 0.15, ry: max * 0.12 },
        { rx: max * 0.08, ry: -max * 0.06 },
        { rx: 0, ry: 0 },
      ];
      let i = 0;
      const step = () => {
        if (hoveringRef.current) return;
        if (i >= wobble.length) return;
        target.current.rx = wobble[i].rx;
        target.current.ry = wobble[i].ry;
        i++;
        start();
        setTimeout(step, 140);
      };
      setTimeout(step, 60);
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [max, scale, perspective]);

  return (
    <div ref={wrapRef} className={className} style={{ perspective: `${perspective}px` }}>
      <div
        ref={innerRef}
        className="relative will-change-transform transition-[filter] duration-300"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay opacity-0"
          style={{ transition: "opacity .3s ease" }}
        />
      </div>
    </div>
  );
}
