import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { I } from "@/components/site/ui";
import { NAV_ITEMS, type NavKey } from "./nav-items";
import { ServicesDropdown } from "./ServicesDropdown";

type Props = {
  active: NavKey;
  megaOpen: boolean;
  onHash: (key: NavKey, hash: string) => void;
  onHome: () => void;
  onToggleMega: () => void;
  onOpenMega: () => void;
  onCloseMegaSoon: () => void;
  onCloseMega: () => void;
};

export function DesktopNav({
  active,
  megaOpen,
  onHash,
  onHome,
  onToggleMega,
  onOpenMega,
  onCloseMegaSoon,
  onCloseMega,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Partial<Record<NavKey, HTMLElement | null>>>({});
  const [pill, setPill] = useState({ x: 0, w: 0, ready: false });

  const sync = useCallback(() => {
    const list = listRef.current;
    const item = itemRefs.current[active];
    if (!list || !item) return;
    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    setPill({ x: itemRect.left - listRect.left, w: itemRect.width, ready: true });
  }, [active]);

  useLayoutEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    const timer = window.setTimeout(sync, 80);
    window.addEventListener("resize", sync);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(sync).catch(() => undefined);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const itemClass = (key: NavKey) => `nv-item${active === key ? " is-active" : ""}`;

  return (
    <div ref={listRef} className="nv-list" role="menubar" aria-label="Основная навигация">
      <span className="nv-pill" style={{ transform: `translateX(${pill.x}px)`, width: pill.w, opacity: pill.ready ? 1 : 0 }} />

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        if (item.kind === "route") {
          return (
            <Link key={item.key} to={item.to} onClick={onHome} className={itemClass(item.key)} ref={(node) => { itemRefs.current[item.key] = node; }}>
              <Icon className="nv-item-icon" aria-hidden="true" />
              {item.label}
            </Link>
          );
        }

        if (item.kind === "mega") {
          return (
            <div
              key={item.key}
              className="nv-mega-wrap"
              onMouseEnter={onOpenMega}
              onMouseLeave={onCloseMegaSoon}
            >
              <button
                type="button"
                ref={(node) => { itemRefs.current[item.key] = node; }}
                aria-expanded={megaOpen}
                aria-haspopup="menu"
                onClick={onToggleMega}
                className={itemClass(item.key)}
              >
                <Icon className="nv-item-icon" aria-hidden="true" />
                {item.label}
                <I.Chevron className={`h-3.5 w-3.5 opacity-70 transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`} />
              </button>
              {megaOpen && <ServicesDropdown onPick={onCloseMega} />}
            </div>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            ref={(node) => { itemRefs.current[item.key] = node; }}
            onClick={() => onHash(item.key, item.hash)}
            className={`${itemClass(item.key)}${item.key === "partner" ? " hidden xl:inline-flex" : ""}`}
          >
            <Icon className="nv-item-icon" aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
