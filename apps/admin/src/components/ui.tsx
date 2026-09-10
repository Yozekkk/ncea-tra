import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${className}`} {...props} />;
}

export function IconButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`icon-button ${className}`} {...props} />;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">NCEA CONTROL</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <div className="empty-mark">—</div>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle size={18} className="spin" /> Loading live data…
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="error-state" role="alert">
      <AlertTriangle size={18} />
      <span>{message}</span>
      {retry && <Button onClick={retry}>Retry</Button>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: PropsWithChildren<{ tone?: string }>) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: PropsWithChildren<{ title: string; onClose: () => void; wide?: boolean }>) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      previous?.focus();
    };
  }, []);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className={wide ? "modal modal-wide" : "modal"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <IconButton aria-label="Close dialog" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

export function ConfirmButton({
  children,
  confirmLabel,
  onConfirm,
}: PropsWithChildren<{ confirmLabel: string; onConfirm: () => unknown | Promise<unknown> }>) {
  const handleClick = () => {
    if (window.confirm(confirmLabel)) void onConfirm();
  };
  return (
    <Button className="button-danger button-small" onClick={handleClick}>
      {children}
    </Button>
  );
}
