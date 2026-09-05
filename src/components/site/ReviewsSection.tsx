import { motion } from "motion/react";
import { Star } from "lucide-react";
import {
  WORKERS_MOTION_VIEWPORT,
  workersDirectionalReveal,
  workersHeadingReveal,
  workersItemReveal,
  workersStaggerContainer,
} from "@/lib/motion";

const REVIEWS = [
  {
    nick: "ArseniyInvesto",
    text: "заказывал плагин на заряд ветра для ранних версий, все четинька , ставлю пять звезд (хотелось бы 100/5)",
  },
  {
    nick: "jofi8k",
    text: "Все прекрасно сделал, было много правок, сделал оперативно! Советую!",
  },
  {
    nick: "Bondar3501",
    text: "Нужен был анализ сервера, нашёл все минусы и подробно описал проблемы, в кратчайшие сроки всё исправил и скинул готовый результат",
  },
  {
    nick: "Rewards",
    text: "Топчик берите не пожелеете",
  },
  {
    nick: "Hinti22",
    text: "советую покупать плагины,лучший в своем деле",
  },
  {
    nick: "momoakk1",
    text: "Все прекрасно, отлично все объясняет",
  },
  {
    nick: "Bondar3501",
    text: "Вай ваще топ чел делает грязюку конкретную, я его руки целовал",
  },
  {
    nick: "Rewards",
    text: "Отличный продавец! Плагин именно такой, как в описании, работает без косяков. Связь быстрая, все вопросы решались мгновенно. Документация прилагалась. Рекомендую, буду брать еще.",
  },
  {
    nick: "zoomer0k",
    text: "Все сделал четко и быстро, как всегда. Даже настроил текстурпак и не взял за это деньги, всем советую!!!",
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
          <div className="ref-reviews-count" aria-label="Девять отзывов клиентов">
            <strong>9</strong>
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

      <motion.div
        className="ref-review-grid"
        variants={workersStaggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={WORKERS_MOTION_VIEWPORT}
      >
        {REVIEWS.map((review, index) => (
          <motion.div
            className="ref-review-card-motion"
            variants={workersItemReveal}
            key={`${review.nick}-${index}`}
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
              <footer>
                <span aria-hidden="true" />
                NCEA / CLIENT REVIEW
              </footer>
            </article>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
