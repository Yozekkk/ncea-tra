import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "iconoir-react";
import { REVIEWS } from "@/components/site/ReviewsSection";

export function ServiceReviews() {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) => {
    const first = track.current?.querySelector<HTMLElement>(".ncea-review-card");
    track.current?.scrollBy({
      left: direction * ((first?.offsetWidth ?? 320) + 18),
      behavior: "smooth",
    });
  };
  return (
    <section className="ncea-service-reviews" aria-labelledby="service-reviews-title">
      <div className="ncea-service-reviews-heading">
        <div>
          <p className="ncea-section-label">ОТЗЫВЫ КЛИЕНТОВ</p>
          <h2 id="service-reviews-title">О работе с NCEA</h2>
          <p>Отзывы, опубликованные клиентами студии.</p>
        </div>
        <div className="ncea-review-controls">
          <button type="button" aria-label="Предыдущие отзывы" onClick={() => scroll(-1)}>
            <ArrowLeft aria-hidden="true" />
          </button>
          <button type="button" aria-label="Следующие отзывы" onClick={() => scroll(1)}>
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="ncea-review-track" ref={track} tabIndex={0} aria-label="Отзывы клиентов">
        {REVIEWS.map((review, index) => (
          <article className="ncea-review-card" key={`${review.nick}-${index}`}>
            <header>
              <span className="ncea-review-avatar" aria-hidden="true">
                {review.nick.slice(0, 1).toLocaleUpperCase("ru")}
              </span>
              <strong>{review.nick}</strong>
            </header>
            <blockquote>{review.text}</blockquote>
          </article>
        ))}
      </div>
    </section>
  );
}
