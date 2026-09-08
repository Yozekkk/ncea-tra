import { Flame } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { getStreakPresentation, PROMOTION_STREAK_DAYS } from "./model";

export function StreakCard({ compact = false }: { compact?: boolean }) {
  const auth = useAuth();
  if (!auth.user) return null;
  if (!auth.streak) {
    return (
      <aside className={`streak-card${compact ? " streak-card-compact" : ""}`}>
        <div className="streak-icon" aria-hidden="true">
          <Flame />
        </div>
        <div>
          <strong>Серия временно недоступна</strong>
          <p>Товары продолжают работать; статус обновится при следующем входе.</p>
        </div>
      </aside>
    );
  }

  const presentation = getStreakPresentation(auth.streak.current_streak);
  const startedToday = auth.streak.streak_started_on === auth.streak.last_active_date;
  return (
    <aside className={`streak-card${compact ? " streak-card-compact" : ""}`}>
      <div className="streak-icon" aria-hidden="true">
        <Flame />
      </div>
      <div className="streak-copy">
        <strong>Серия: {presentation.days} дн. 🔥</strong>
        <p>
          {presentation.message}
          {startedToday && presentation.days === 1
            ? " Новая серия начинается с сегодняшнего посещения."
            : ""}
        </p>
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
          {presentation.progress}/{PROMOTION_STREAK_DAYS} дня до первого продвижения
        </small>
      </div>
    </aside>
  );
}
