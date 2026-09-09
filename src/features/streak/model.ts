export const PROMOTION_STREAK_DAYS = 3;

export interface StreakPresentation {
  days: number;
  progress: number;
  eligible: boolean;
  message: string;
}

export function getStreakPresentation(value: number): StreakPresentation {
  const days = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const progress = Math.min(days, PROMOTION_STREAK_DAYS);
  const eligible = days >= PROMOTION_STREAK_DAYS;
  return {
    days,
    progress,
    eligible,
    message:
      days === 0
        ? "Зайдите сегодня, чтобы начать серию"
        : eligible
          ? "Ваши опубликованные товары участвуют в продвижении"
          : `До продвижения: ${PROMOTION_STREAK_DAYS - days} дн.`,
  };
}

export interface PromotableListing {
  id: string;
  listing_source?: "agency" | "user";
  sort_order?: number | null;
  effective_streak: number;
  last_bumped_at: string | null;
  created_at: string;
}

export function rankMarketplaceListings<T extends PromotableListing>(listings: T[]): T[] {
  return [...listings].sort((left, right) => {
    const leftIsAgency = left.listing_source === "agency";
    const rightIsAgency = right.listing_source === "agency";
    if (leftIsAgency !== rightIsAgency) return leftIsAgency ? -1 : 1;

    if (leftIsAgency && rightIsAgency) {
      const orderDifference =
        (left.sort_order ?? Number.MAX_SAFE_INTEGER) -
        (right.sort_order ?? Number.MAX_SAFE_INTEGER);
      if (orderDifference) return orderDifference;
      const createdDifference = Date.parse(left.created_at) - Date.parse(right.created_at);
      if (createdDifference) return createdDifference;
      return left.id.localeCompare(right.id);
    }

    const leftEligible = left.effective_streak >= PROMOTION_STREAK_DAYS ? 1 : 0;
    const rightEligible = right.effective_streak >= PROMOTION_STREAK_DAYS ? 1 : 0;
    if (leftEligible !== rightEligible) return rightEligible - leftEligible;
    if (leftEligible && rightEligible) {
      if (left.effective_streak !== right.effective_streak)
        return right.effective_streak - left.effective_streak;
      const bumpDifference =
        Date.parse(right.last_bumped_at ?? "1970-01-01T00:00:00Z") -
        Date.parse(left.last_bumped_at ?? "1970-01-01T00:00:00Z");
      if (bumpDifference) return bumpDifference;
    }
    const createdDifference = Date.parse(right.created_at) - Date.parse(left.created_at);
    if (createdDifference) return createdDifference;
    return left.id.localeCompare(right.id);
  });
}
