import { toast } from "sonner";

export const LOGO_MARK = "/images/brand/ncea-logo-full.webp";
export const LOGO_ROUND = "/images/brand/ncea-logo-mark.webp";

export const DISCORD_TAG = "@yozekkk";
export const TELEGRAM_TAG = "@lisiy_bob";
export const DESIGNER = "@yozekkk";

export type IconProps = { className?: string };

export const I = {
  Home: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path
        d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Star: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path
        d="m12 3 2.6 5.6 6 .6-4.5 4.1 1.3 6L12 16.8 6.6 19.3l1.3-6L3.4 9.2l6-.6z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Cube: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path
        d="M12 3 3 7.5v9L12 21l9-4.5v-9zM3 7.5 12 12m0 0 9-4.5M12 12v9"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Group: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <circle cx="9" cy="9" r="3.2" />
      <circle cx="17" cy="11" r="2.4" />
      <path d="M3 19c.7-3 3.2-4.6 6-4.6S14.3 16 15 19M14.5 19c.4-1.8 1.8-3 3.5-3s3.1 1.2 3.5 3" />
    </svg>
  ),
  Chat: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path d="M4 5h16v11H8l-4 4z" strokeLinejoin="round" />
    </svg>
  ),
  Shield: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path d="M12 3 4 6v6c0 4.5 3.3 8.3 8 9 4.7-.7 8-4.5 8-9V6z" strokeLinejoin="round" />
    </svg>
  ),
  Scale: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path d="M12 4v16M5 20h14M6 8h12l-3 7H9zM6 8l-3 5h6zM18 8l3 5h-6z" strokeLinejoin="round" />
    </svg>
  ),
  Heart: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path d="M3 10h3l2-3 3 8 2-5 2 3h6" />
    </svg>
  ),
  Service: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <rect x="3" y="5" width="18" height="6" rx="1.5" />
      <rect x="3" y="13" width="18" height="6" rx="1.5" />
      <circle cx="7" cy="8" r="1" fill="currentColor" />
      <circle cx="7" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  Arrow: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={p.className}
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  ArrowLeft: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={p.className}
    >
      <path d="M19 12H5M11 6l-6 6 6 6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  ArrowDown: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={p.className}
    >
      <path d="M12 5v14M6 13l6 6 6-6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  Chevron: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={p.className}
    >
      <path d="m6 9 6 6 6-6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  Check: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className={p.className}
    >
      <path d="m5 12.5 4.5 4.5L19 7" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  Telegram: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className}>
      <path d="M9.04 15.47 8.9 19.4c.4 0 .58-.17.8-.38l1.92-1.84 3.98 2.91c.73.4 1.25.19 1.45-.67l2.63-12.3c.27-1.07-.39-1.5-1.1-1.24L3.4 10.41c-1.05.4-1.04.99-.18 1.25l4.07 1.27 9.45-5.96c.45-.28.86-.13.52.16z" />
    </svg>
  ),
  Discord: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className}>
      <path d="M19.3 5.3A17 17 0 0 0 15.3 4l-.2.4a13 13 0 0 0-6.2 0L8.7 4a17 17 0 0 0-4 1.3C2.2 9 1.5 12.5 1.8 16a17 17 0 0 0 5.2 2.6l.4-.6c-.9-.3-1.7-.7-2.4-1.2l.2-.1a12 12 0 0 0 10.6 0l.2.1c-.7.5-1.5.9-2.4 1.2l.4.6a17 17 0 0 0 5.2-2.6c.3-4.1-.6-7.6-2.9-10.7zM8.8 14c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
    </svg>
  ),
  Menu: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={p.className}
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  ),
  Close: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={p.className}
    >
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  ),
  Sword: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path d="M14 4h6v6L9 21l-3-3zM5 19l2 2" strokeLinejoin="round" />
    </svg>
  ),
  Hammer: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path d="m3 21 7-7M9 13l4-4M8 6l4-4 7 7-4 4z" strokeLinejoin="round" />
    </svg>
  ),
  Compass: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-4 2-2 4 4-2z" strokeLinejoin="round" />
    </svg>
  ),
  Gift: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path
        d="M3 9h18v4H3zM5 13v8h14v-8M12 9V5m0 4c-2 0-4-1-4-3a2 2 0 0 1 4 0m0 4c2 0 4-1 4-3a2 2 0 0 0-4 0"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Map: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14" strokeLinejoin="round" />
    </svg>
  ),
  Globe: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
    </svg>
  ),
  Paint: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path
        d="M4 20c0-2 1-3 3-3 1.6 0 2.5 1 2.5 2.2C9.5 20.6 8.2 21 7 21c-1.8 0-3-.4-3-1zM10 17 20 7l-3-3L7 14z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Sparkle: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path
        d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"
        strokeLinecap="round"
      />
    </svg>
  ),
  Layers: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5" strokeLinejoin="round" />
    </svg>
  ),
  Monitor: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M9 20h6M12 16v4" strokeLinecap="round" />
    </svg>
  ),
  User: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />
    </svg>
  ),
  Wrench: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <path
        d="M15.5 3a5.5 5.5 0 0 0-5.1 7.6L3 18l3 3 7.4-7.4A5.5 5.5 0 1 0 15.5 3z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Info: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={p.className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
  ),
};

export function copyWithToast(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} скопировано`))
    .catch(() => toast.error("Не удалось скопировать"));
}

export function Blob({ className = "" }: { className?: string }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;
}

export type IconKey = keyof typeof I;
