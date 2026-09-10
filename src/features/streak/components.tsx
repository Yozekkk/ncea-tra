import { useQueryClient } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { getStreakPresentation, PROMOTION_STREAK_DAYS } from "./model";

function dayLabel(days: number) {
  const mod100 = days % 100;
  const mod10 = days % 10;
  if (mod100 >= 11 && mod100 <= 14) return "дней";
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дня";
  return "дней";
}

export function StreakCard({ compact = false }: { compact?: boolean }) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [isRenewing, setIsRenewing] = useState(false);
  const [feedback, setFeedback] = useState("");
  if (!auth.user) return null;
  if (!auth.streak) {
    return (
      <aside className={`streak-card${compact ? " streak-card-compact" : ""}`}>
        <div className="streak-icon" aria-hidden="true">
          <Flame />
        </div>
        <div className="streak-copy">
          <h2>🔥 Ударный режим</h2>
          <p>Статус временно недоступен. Обновите страницу и попробуйте снова.</p>
        </div>
      </aside>
    );
  }

  const presentation = getStreakPresentation(auth.streak.current_streak);
  const alreadyRenewed = auth.streak.renewed_today;
  const statusMessage =
    feedback || (alreadyRenewed ? "Сегодня ударный режим уже продлён. Возвращайтесь завтра." : "");

  async function renew() {
    if (isRenewing || alreadyRenewed) return;
    setIsRenewing(true);
    setFeedback("");
    try {
      const result = await auth.renewStreak();
      setFeedback(
        result.renewed
          ? `🔥 Ударный режим продлён. Текущая серия: ${result.current_streak} ${dayLabel(result.current_streak)}.`
          : "Сегодня ударный режим уже продлён. Возвращайтесь завтра.",
      );
      await queryClient.invalidateQueries({ queryKey: ["marketplace", "published"] });
    } catch {
      setFeedback("Не удалось продлить ударный режим. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsRenewing(false);
    }
  }

  return (
    <aside className={`streak-card${compact ? " streak-card-compact" : ""}`}>
      <div className="streak-icon" aria-hidden="true">
        <Flame />
      </div>
      <div className="streak-copy">
        <h2>🔥 Ударный режим</h2>
        <strong className="streak-count">
          Серия: {presentation.days} {dayLabel(presentation.days)}
        </strong>
        <p>Продлевайте серию каждый день, чтобы поднимать свои товары выше в Marketplace.</p>
        <div
          className="streak-progress"
          role="progressbar"
          aria-label="Прогресс до продвижения товаров"
          aria-valuemin={0}
          aria-valuemax={PROMOTION_STREAK_DAYS}
          aria-valuenow={presentation.progress}
        >
          <span style={{ width: `${(presentation.progress / PROMOTION_STREAK_DAYS) * 100}%` }} />
        </div>
        <small>
          {presentation.eligible
            ? "Продвижение активно: больший streak поднимает товары выше"
            : `${presentation.progress}/${PROMOTION_STREAK_DAYS} до начала продвижения`}
        </small>
        <button
          type="button"
          className="streak-renew-button"
          onClick={() => void renew()}
          disabled={isRenewing || alreadyRenewed}
          aria-describedby="strike-mode-status"
        >
          {isRenewing
            ? "Продлеваем…"
            : alreadyRenewed
              ? "Продлено сегодня"
              : "Продлить ударный режим"}
        </button>
        <p id="strike-mode-status" className="streak-status" role="status" aria-live="polite">
          {statusMessage}
        </p>
      </div>
    </aside>
  );
}
