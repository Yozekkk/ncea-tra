import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ============================================================
   NCEA — валюты. Базовая валюта каталога — EUR.
   Курсы фиксированные (локальные), без внешнего API.
   ============================================================ */

export type CurrencyCode = "EUR" | "USD" | "RUB";

export type CurrencyInfo = {
  code: CurrencyCode;
  symbol: string;
  label: string;
  /** сколько единиц валюты в 1 EUR */
  rate: number;
  /** шаг округления итоговой суммы */
  step: number;
};

export const CURRENCIES: CurrencyInfo[] = [
  { code: "EUR", symbol: "€", label: "Евро", rate: 1, step: 0.5 },
  { code: "USD", symbol: "$", label: "Доллар", rate: 1.08, step: 0.5 },
  { code: "RUB", symbol: "₽", label: "Рубль", rate: 99, step: 10 },
];

export const CURRENCY_BY_CODE: Record<CurrencyCode, CurrencyInfo> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
) as Record<CurrencyCode, CurrencyInfo>;

const STORAGE_KEY = "ncea:currency";

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

/** Конвертирует сумму из EUR в выбранную валюту. */
export function convert(amountEur: number, code: CurrencyCode) {
  const info = CURRENCY_BY_CODE[code];
  return roundTo(amountEur * info.rate, info.step);
}

/** Форматирует сумму, заданную в EUR, в выбранной валюте. */
export function formatMoney(amountEur: number, code: CurrencyCode) {
  const info = CURRENCY_BY_CODE[code];
  const value = convert(amountEur, code);
  const fractionDigits = Number.isInteger(value) ? 0 : 1;
  const text = value.toLocaleString("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${text} ${info.symbol}`;
}

type Ctx = {
  code: CurrencyCode;
  info: CurrencyInfo;
  setCode: (code: CurrencyCode) => void;
  /** форматирование суммы, указанной в EUR */
  fmt: (amountEur: number) => string;
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<CurrencyCode>("EUR");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved && CURRENCY_BY_CODE[saved]) setCodeState(saved);
    } catch {
      /* localStorage может быть недоступен */
    }
  }, []);

  const setCode = useCallback((next: CurrencyCode) => {
    setCodeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage может быть недоступен */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      code,
      info: CURRENCY_BY_CODE[code],
      setCode,
      fmt: (amountEur: number) => formatMoney(amountEur, code),
    }),
    [code, setCode],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): Ctx {
  const ctx = useContext(CurrencyContext);
  if (ctx) return ctx;
  /* безопасный фолбэк вне провайдера (например, при SSR отдельных фрагментов) */
  return {
    code: "EUR",
    info: CURRENCY_BY_CODE.EUR,
    setCode: () => undefined,
    fmt: (amountEur: number) => formatMoney(amountEur, "EUR"),
  };
}
