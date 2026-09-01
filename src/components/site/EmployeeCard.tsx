import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Clock, Copy, Github, MessageCircle, Send } from "lucide-react";
import type { Employee } from "@/lib/employees";

type EmployeeCardProps = {
  employee: Employee;
  index: number;
};

const LEVEL_CLASS: Record<Employee["level"], string> = {
  Стажёр: "is-intern",
  Junior: "is-junior",
  Middle: "is-middle",
  Lead: "is-lead",
};

async function copyToClipboard(value: string) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Continue with the DOM fallback for browsers that deny Clipboard API access.
    }
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Clipboard copy failed");
}

export function EmployeeCard({ employee, index }: EmployeeCardProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);
  const telegramUsername = employee.telegram.replace(/^@/, "");

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleDiscordCopy = async () => {
    try {
      await copyToClipboard(employee.discord);
      setCopied(true);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="employee-card">
      <div className="employee-card__topline">
        <span className={`employee-level ${LEVEL_CLASS[employee.level]}`}>{employee.level}</span>
        <span className="employee-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="employee-card__identity">
        <h2>{employee.name}</h2>
        <p>{employee.role}</p>
      </div>

      <div className="employee-timezone">
        <Clock aria-hidden="true" />
        <span>{employee.timezone}</span>
      </div>

      <div className="employee-actions" aria-label={`Контакты: ${employee.name}`}>
        <a
          className="employee-action"
          href={`https://t.me/${telegramUsername}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="employee-action__icon">
            <Send aria-hidden="true" />
          </span>
          <span className="employee-action__copy">
            <strong>Telegram</strong>
            <small>Перейти</small>
          </span>
          <ArrowUpRight className="employee-action__arrow" aria-hidden="true" />
        </a>

        <button className="employee-action" type="button" onClick={handleDiscordCopy}>
          <span className="employee-action__icon">
            <MessageCircle aria-hidden="true" />
          </span>
          <span className="employee-action__copy" aria-live="polite">
            <strong>Discord</strong>
            <small>{copied ? "Скопировано ✓" : "Скопировать"}</small>
          </span>
          {copied ? (
            <Check className="employee-action__arrow is-copied" aria-hidden="true" />
          ) : (
            <Copy className="employee-action__arrow" aria-hidden="true" />
          )}
        </button>

        {employee.github ? (
          <a className="employee-action" href={employee.github} target="_blank" rel="noreferrer">
            <span className="employee-action__icon">
              <Github aria-hidden="true" />
            </span>
            <span className="employee-action__copy">
              <strong>GitHub</strong>
              <small>Перейти</small>
            </span>
            <ArrowUpRight className="employee-action__arrow" aria-hidden="true" />
          </a>
        ) : (
          <button className="employee-action is-disabled" type="button" disabled>
            <span className="employee-action__icon">
              <Github aria-hidden="true" />
            </span>
            <span className="employee-action__copy">
              <strong>GitHub</strong>
              <small>Не указан</small>
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
