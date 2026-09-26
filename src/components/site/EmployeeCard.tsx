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
  const [copyFailed, setCopyFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);
  const telegramHref = employee.telegram
    ? employee.telegram.startsWith("https://t.me/")
      ? employee.telegram
      : `https://t.me/${employee.telegram.replace(/^@/, "")}`
    : null;

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  useEffect(() => setImageFailed(false), [employee.image_url]);

  const handleDiscordCopy = async () => {
    setCopyFailed(false);
    try {
      if (!employee.discord) return;
      await copyToClipboard(employee.discord);
      setCopied(true);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setCopyFailed(true);
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

      {employee.image_url ? (
        <div className={`employee-card__media${imageFailed ? " is-failed" : ""}`}>
          {imageFailed ? (
            <span>Фото недоступно</span>
          ) : (
            <img
              src={employee.image_url}
              alt={`Фото сотрудника ${employee.name}`}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
      ) : null}

      <div className="employee-card__identity">
        <h2>{employee.name}</h2>
        {employee.username ? <small>@{employee.username.replace(/^@/, "")}</small> : null}
        <p>{employee.role}</p>
      </div>

      {employee.bio ? <p className="employee-card__bio">{employee.bio}</p> : null}

      <div className="employee-timezone">
        <Clock aria-hidden="true" />
        <span>{employee.timezone ?? "Часовой пояс не указан"}</span>
      </div>

      <div className="employee-actions" aria-label={`Контакты: ${employee.name}`}>
        {telegramHref ? (
          <a className="employee-action" href={telegramHref} target="_blank" rel="noreferrer">
            <span className="employee-action__icon">
              <Send aria-hidden="true" />
            </span>
            <span className="employee-action__copy">
              <strong>Telegram</strong>
              <small>Перейти</small>
            </span>
            <ArrowUpRight className="employee-action__arrow" aria-hidden="true" />
          </a>
        ) : (
          <button className="employee-action is-disabled" type="button" disabled>
            <span className="employee-action__icon">
              <Send aria-hidden="true" />
            </span>
            <span className="employee-action__copy">
              <strong>Telegram</strong>
              <small>Не указан</small>
            </span>
          </button>
        )}

        <button
          className={`employee-action${employee.discord ? "" : " is-disabled"}`}
          type="button"
          onClick={handleDiscordCopy}
          disabled={!employee.discord}
        >
          <span className="employee-action__icon">
            <MessageCircle aria-hidden="true" />
          </span>
          <span className="employee-action__copy" aria-live="polite">
            <strong>Discord</strong>
            <small>
              {copied ? "Скопировано ✓" : copyFailed ? "Не удалось скопировать" : "Скопировать"}
            </small>
          </span>
          {copied ? (
            <Check className="employee-action__arrow is-copied" aria-hidden="true" />
          ) : (
            <Copy className="employee-action__arrow" aria-hidden="true" />
          )}
        </button>

        {employee.github_url ? (
          <a
            className="employee-action"
            href={employee.github_url}
            target="_blank"
            rel="noreferrer"
          >
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
