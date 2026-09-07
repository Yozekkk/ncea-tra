import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export function CommunityShell({ children }: { children: ReactNode }) {
  return (
    <div className="ref-site community-site">
      <a className="community-skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <SiteHeader />
      <main id="main-content" className="community-main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function CommunityHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="community-hero">
      <div>
        <p className="ref-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="community-hero-actions">{actions}</div> : null}
    </header>
  );
}

export function LoadingPanel({ label = "Загрузка…" }: { label?: string }) {
  return (
    <div className="community-state" role="status">
      <span className="community-spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="community-state community-state-error" role="alert">
      <strong>Не удалось загрузить данные</strong>
      <span>{message}</span>
    </div>
  );
}

export function EmptyPanel({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="community-state">
      <strong>{title}</strong>
      <span>{description}</span>
      {action}
    </div>
  );
}
