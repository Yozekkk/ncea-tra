import { motion } from "motion/react";
import { Star } from "lucide-react";
import {
  WORKERS_MOTION_VIEWPORT,
  workersDirectionalReveal,
  workersHeadingReveal,
  workersItemReveal,
  workersStaggerContainer,
} from "@/lib/motion";

export const REVIEWS = [
  {
    id: "existing-1",
    nick: "ArseniyInvesto",
    text: "заказывал плагин на заряд ветра для ранних версий, все четинька , ставлю пять звезд (хотелось бы 100/5)",
  },
  {
    id: "existing-2",
    nick: "jofi8k",
    text: "Все прекрасно сделал, было много правок, сделал оперативно! Советую!",
  },
  {
    id: "existing-3",
    nick: "Bondar3501",
    text: "Нужен был анализ сервера, нашёл все минусы и подробно описал проблемы, в кратчайшие сроки всё исправил и скинул готовый результат",
  },
  {
    id: "existing-4",
    nick: "Rewards",
    text: "Топчик берите не пожелеете",
  },
  {
    id: "existing-5",
    nick: "Hinti22",
    text: "советую покупать плагины,лучший в своем деле",
  },
  {
    id: "existing-6",
    nick: "momoakk1",
    text: "Все прекрасно, отлично все объясняет",
  },
  {
    id: "existing-7",
    nick: "Bondar3501",
    text: "Вай ваще топ чел делает грязюку конкретную, я его руки целовал",
  },
  {
    id: "existing-8",
    nick: "Rewards",
    text: "Отличный продавец! Плагин именно такой, как в описании, работает без косяков. Связь быстрая, все вопросы решались мгновенно. Документация прилагалась. Рекомендую, буду брать еще.",
  },
  {
    id: "existing-9",
    nick: "zoomer0k",
    text: "Все сделал четко и быстро, как всегда. Даже настроил текстурпак и не взял за это деньги, всем советую!!!",
  },
  {
    id: "UT3KKQZA",
    nick: "ruti16333",
    text: "ТИИИГРРРРР",
    category: "Minecraft",
    price: "1 000 ₽",
    order: "#UT3KKQZA",
    date: "15 мая, 17:53",
  },
  {
    id: "H968B5D6",
    nick: "Amogus55561",
    text: "Все очень супер, быстрое обслуживание",
    category: "Minecraft",
    price: "600 ₽",
    order: "#H968B5D6",
    date: "16 мая, 15:05",
  },
  {
    id: "Y14R1X85",
    nick: "ruti16333",
    text: "👍👍👍👍👍👍",
    category: "Minecraft",
    price: "300 ₽",
    order: "#Y14R1X85",
  },
  {
    id: "XK9GEHY5",
    nick: "difinbeeyMC",
    text: "Всё сделал чотенько",
    category: "Minecraft",
    price: "1 000 ₽",
    order: "#XK9GEHY5",
    date: "14 апреля, 11:28",
  },
  {
    id: "BRW4TGQ",
    nick: "YTExzmaN",
    text: "как обычно все имбуля",
    category: "Minecraft",
    price: "800 ₽",
    order: "#BRW4TGQ",
    date: "2 апреля, 20:48",
  },
  {
    id: "F8GSZMS3",
    nick: "tapalkahamster",
    text: "продавец хороший, уступил в цене, и помог с настройкой плагина",
    category: "Minecraft",
    price: "600 ₽",
    order: "#F8GSZMS3",
  },
  {
    id: "T92CNADJ",
    nick: "zoomer0k",
    text: "Как всегда все быстро, четко, иба чотка, круто и тд",
    category: "Minecraft",
    price: "500 ₽",
    order: "#T92CNADJ",
    date: "1 апреля, 19:56",
  },
  {
    id: "BS3JNX47",
    nick: "ImKamonas",
    text: "Впервые такую студию вижу, вы лучшие! Теперь только у вас заказывать буду)) Жду ролик в тт)",
    category: "Minecraft",
    price: "1 000 ₽",
    order: "#BS3JNX47",
    date: "21 марта, 18:52",
  },
] as const;

function FiveStars() {
  return (
    <span className="ref-review-stars" role="img" aria-label="Оценка 5 из 5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} aria-hidden="true" fill="currentColor" />
      ))}
    </span>
  );
}

export function ReviewsSection() {
  return (
    <section className="ref-reviews" id="reviews" aria-labelledby="reviews-title">
      <motion.div
        className="ref-reviews-showcase"
        variants={workersStaggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={WORKERS_MOTION_VIEWPORT}
      >
        <motion.header className="ref-reviews-intro" variants={workersHeadingReveal}>
          <p>CLIENT REVIEWS / NCEA</p>
          <h2 id="reviews-title">Отзывы нашей студии</h2>
          <span>Что говорят клиенты после работы с NCEA.</span>
          <div className="ref-reviews-count" aria-label={`${REVIEWS.length} отзывов клиентов`}>
            <strong>{REVIEWS.length}</strong>
            <small>
              реальных
              <br />
              отзывов
            </small>
          </div>
        </motion.header>

        <motion.figure className="ref-reviews-art" variants={workersDirectionalReveal("right")}>
          <span className="ref-reviews-art-grid" aria-hidden="true" />
          <img
            src="/images/reviews/minecraft-client-reviews.webp"
            alt="Minecraft-персонаж NCEA рядом с ящиками и инструментами"
            width={1126}
            height={580}
            loading="lazy"
          />
        </motion.figure>
      </motion.div>

      <div className="ref-review-grid">
        {REVIEWS.map((review, index) => (
          <motion.div
            className="ref-review-card-motion"
            variants={workersItemReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            key={review.id}
          >
            <article className="ref-review-card">
              <header>
                <span className="ref-review-index">{String(index + 1).padStart(2, "0")}</span>
                <FiveStars />
              </header>
              <h3>{review.nick}</h3>
              <blockquote>
                <p>{review.text}</p>
              </blockquote>
              {"category" in review ? (
                <p className="ref-review-meta">
                  {review.category} · {review.price}
                </p>
              ) : null}
              <footer>
                <span aria-hidden="true" />
                NCEA / CLIENT REVIEW
              </footer>
            </article>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
