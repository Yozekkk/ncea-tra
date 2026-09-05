import { useEffect, useRef } from "react";

const CELL_SIZE = 56;
const DESKTOP_FRAME_INTERVAL = 1000 / 30;
const MOBILE_FRAME_INTERVAL = 1000 / 8;

/**
 * Original NCEA renderer following the single-canvas lifecycle used by React Bits ShapeGrid:
 * https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Backgrounds/ShapeGrid
 */
export function InteractiveGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    let reducedMotion = reducedMotionQuery.matches;
    let coarsePointer = coarsePointerQuery.matches;
    let width = 0;
    let height = 0;
    let animationFrame: number | null = null;
    let lastFrame = 0;
    let lastPointerMove = 0;
    let intensity = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      context.strokeStyle = "rgba(24, 24, 27, 0.048)";
      context.beginPath();
      for (let x = 0.5; x <= width; x += CELL_SIZE) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
      }
      for (let y = 0.5; y <= height; y += CELL_SIZE) {
        context.moveTo(0, y);
        context.lineTo(width, y);
      }
      context.stroke();
      if (reducedMotion) return;

      const activeX = coarsePointer ? width * (0.5 + Math.sin(time * 0.00012) * 0.22) : pointerX;
      const activeY = coarsePointer ? height * (0.45 + Math.cos(time * 0.0001) * 0.16) : pointerY;
      const activeIntensity = coarsePointer ? 0.2 : intensity;
      if (activeIntensity < 0.008) return;

      const glow = context.createRadialGradient(activeX, activeY, 0, activeX, activeY, 210);
      glow.addColorStop(0, `rgba(243, 92, 23, ${0.055 * activeIntensity})`);
      glow.addColorStop(1, "rgba(243, 92, 23, 0)");
      context.fillStyle = glow;
      context.fillRect(activeX - 210, activeY - 210, 420, 420);

      const centerColumn = Math.floor(activeX / CELL_SIZE);
      const centerRow = Math.floor(activeY / CELL_SIZE);
      for (let column = centerColumn - 4; column <= centerColumn + 4; column += 1) {
        for (let row = centerRow - 4; row <= centerRow + 4; row += 1) {
          const cellX = column * CELL_SIZE;
          const cellY = row * CELL_SIZE;
          const distance = Math.hypot(
            cellX + CELL_SIZE / 2 - activeX,
            cellY + CELL_SIZE / 2 - activeY,
          );
          const proximity = Math.max(0, 1 - distance / (CELL_SIZE * 4.25));
          if (proximity <= 0) continue;

          const alpha = proximity * proximity * activeIntensity;
          context.fillStyle = `rgba(255, 138, 34, ${0.075 * alpha})`;
          context.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          context.strokeStyle = `rgba(243, 92, 23, ${0.2 * alpha})`;
          context.strokeRect(cellX + 0.5, cellY + 0.5, CELL_SIZE, CELL_SIZE);
        }
      }
    };

    const stopAnimation = () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      animationFrame = null;
    };
    const tick = (time: number) => {
      animationFrame = null;
      if (document.hidden || reducedMotion) return;
      const interval = coarsePointer ? MOBILE_FRAME_INTERVAL : DESKTOP_FRAME_INTERVAL;
      if (time - lastFrame >= interval) {
        lastFrame = time;
        if (!coarsePointer) {
          const target = time - lastPointerMove < 190 ? 1 : 0;
          intensity += (target - intensity) * (target ? 0.24 : 0.11);
        }
        draw(time);
      }
      if (coarsePointer || intensity > 0.008 || time - lastPointerMove < 250) {
        animationFrame = requestAnimationFrame(tick);
      }
    };
    const startAnimation = () => {
      if (animationFrame === null && !document.hidden && !reducedMotion) {
        animationFrame = requestAnimationFrame(tick);
      }
    };
    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1 : 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw(performance.now());
      if (coarsePointer) startAnimation();
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (coarsePointer || reducedMotion) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastPointerMove = performance.now();
      startAnimation();
    };
    const handleVisibility = () => {
      if (document.hidden) stopAnimation();
      else {
        draw(performance.now());
        if (coarsePointer || intensity > 0.008) startAnimation();
      }
    };
    const handlePreferenceChange = () => {
      reducedMotion = reducedMotionQuery.matches;
      coarsePointer = coarsePointerQuery.matches;
      stopAnimation();
      resize();
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotionQuery.addEventListener("change", handlePreferenceChange);
    coarsePointerQuery.addEventListener("change", handlePreferenceChange);
    resize();
    return () => {
      stopAnimation();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotionQuery.removeEventListener("change", handlePreferenceChange);
      coarsePointerQuery.removeEventListener("change", handlePreferenceChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="ncea-grid-background" aria-hidden="true" />;
}
