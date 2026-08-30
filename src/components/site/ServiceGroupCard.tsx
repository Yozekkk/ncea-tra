import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/services";

type GroupVariant = "primary" | "creative" | "compact";

type ArtAsset = {
  src: string;
  role: string;
};

type ServiceGroupCardProps = {
  number: string;
  label: string;
  title: readonly string[];
  description: string;
  services: readonly Service[];
  variant: GroupVariant;
  art: readonly ArtAsset[];
  ctaTitle: string;
  ctaCopy: string;
  revealDelay: number;
};

type GroupStyle = CSSProperties & {
  "--services-reveal-delay": string;
};

const ORDER_URL = "https://t.me/lisiy_bob";
const FINE_POINTER = "(hover: hover) and (pointer: fine) and (min-width: 769px)";

export function ServiceGroupCard({
  number,
  label,
  title,
  description,
  services,
  variant,
  art,
  ctaTitle,
  ctaCopy,
  revealDelay,
}: ServiceGroupCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 50, y: 50, tiltX: 0, tiltY: 0, artX: 0, artY: 0 });

  useEffect(
    () => () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const paintPointer = () => {
    frameRef.current = null;
    const card = cardRef.current;
    if (!card) return;
    const pointer = pointerRef.current;
    card.style.setProperty("--services-mouse-x", `${pointer.x.toFixed(2)}%`);
    card.style.setProperty("--services-mouse-y", `${pointer.y.toFixed(2)}%`);
    card.style.setProperty("--services-tilt-x", `${pointer.tiltX.toFixed(3)}deg`);
    card.style.setProperty("--services-tilt-y", `${pointer.tiltY.toFixed(3)}deg`);
    card.style.setProperty("--services-art-x", `${pointer.artX.toFixed(2)}px`);
    card.style.setProperty("--services-art-y", `${pointer.artY.toFixed(2)}px`);
  };

  const schedulePaint = () => {
    if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(paintPointer);
  };

  const onPointerEnter = (event: ReactPointerEvent<HTMLElement>) => {
    if (!window.matchMedia(FINE_POINTER).matches) return;
    rectRef.current = event.currentTarget.getBoundingClientRect();
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!window.matchMedia(FINE_POINTER).matches) return;
    const rect = rectRef.current ?? event.currentTarget.getBoundingClientRect();
    rectRef.current = rect;
    const normalizedX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const normalizedY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    pointerRef.current = {
      x: normalizedX * 100,
      y: normalizedY * 100,
      tiltX: (0.5 - normalizedY) * 2.2,
      tiltY: (normalizedX - 0.5) * 2.2,
      artX: (normalizedX - 0.5) * 10,
      artY: (normalizedY - 0.5) * 8,
    };
    schedulePaint();
  };

  const onPointerLeave = () => {
    rectRef.current = null;
    pointerRef.current = { x: 50, y: 50, tiltX: 0, tiltY: 0, artX: 0, artY: 0 };
    schedulePaint();
  };

  return (
    <article
      ref={cardRef}
      className={`services-group services-group--${variant} services-reveal`}
      style={{ "--services-reveal-delay": `${revealDelay}ms` } as GroupStyle}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span className="services-group-light" aria-hidden="true" />
      <span className="services-group-corners" aria-hidden="true" />
      <span className="services-group-art" aria-hidden="true">
        {art.map((asset, index) => (
          <img
            src={asset.src}
            alt=""
            width={280}
            height={280}
            loading="lazy"
            className={`services-group-art-${asset.role}`}
            key={`${asset.src}-${index}`}
          />
        ))}
      </span>

      <header className="services-group-header">
        <span className="services-group-number">{number}</span>
        <span className="services-group-label">{label}</span>
        <span className="services-group-count">
          {String(services.length).padStart(2, "0")} направлений
        </span>
      </header>

      <div className="services-group-intro">
        <h2 aria-label={title.join(" ")}>
          {title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
        <p>{description}</p>
      </div>

      <nav className="services-group-links" aria-label={`Услуги: ${title.join(" ")}`}>
        {services.map((service, index) => (
          <Link to={service.path} className="services-group-link" key={service.id}>
            <span className="services-group-link-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="services-group-link-copy">
              <strong>{service.title}</strong>
              <small>{service.short}</small>
            </span>
            <span className="services-group-link-arrow" aria-hidden="true">
              <ArrowUpRight />
            </span>
          </Link>
        ))}
      </nav>

      <a className="services-group-cta" href={ORDER_URL} target="_blank" rel="noreferrer">
        <span>
          <strong>{ctaTitle}</strong>
          <small>{ctaCopy}</small>
        </span>
        <span className="services-group-cta-action">
          Обсудить проект
          <span className="services-inline-arrow" aria-hidden="true">
            <ArrowUpRight />
          </span>
        </span>
      </a>
    </article>
  );
}
