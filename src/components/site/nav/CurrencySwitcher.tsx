import { useEffect, useRef, useState } from "react";
import { Coins, Check, ChevronDown } from "lucide-react";
import { CURRENCIES, useCurrency, type CurrencyCode } from "@/lib/currency";

export function CurrencySwitcher({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { code, info, setCode } = useCurrency();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (variant === "mobile") {
    return (
      <div className="nv-cur-mobile" role="group" aria-label="Валюта">
        {CURRENCIES.map((currency) => (
          <button
            key={currency.code}
            type="button"
            onClick={() => setCode(currency.code as CurrencyCode)}
            aria-pressed={code === currency.code}
            className={`nv-cur-seg${code === currency.code ? " is-active" : ""}`}
          >
            {currency.symbol} {currency.code}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="nv-cur-wrap">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Переключить валюту"
        className="nv-cur-btn"
      >
        <Coins className="h-4 w-4 text-brand-orange" aria-hidden="true" />
        <span className="font-semibold">{info.code}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="nv-cur-menu" role="listbox" aria-label="Валюта">
          {CURRENCIES.map((currency) => (
            <button
              key={currency.code}
              type="button"
              role="option"
              aria-selected={code === currency.code}
              onClick={() => {
                setCode(currency.code as CurrencyCode);
                setOpen(false);
              }}
              className={`nv-cur-item${code === currency.code ? " is-active" : ""}`}
            >
              <span className="nv-cur-sym">{currency.symbol}</span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-[13px] font-medium text-white/88">{currency.code}</span>
                <span className="block text-[11px] text-white/40">{currency.label}</span>
              </span>
              {code === currency.code && (
                <Check className="h-4 w-4 text-brand-orange" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
