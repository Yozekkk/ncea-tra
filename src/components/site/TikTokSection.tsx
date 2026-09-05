import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import {
  CHROME_MOTION_DURATION,
  CHROME_MOTION_EASE,
  WORKERS_MOTION_VIEWPORT,
  workersDirectionalReveal,
  workersHeadingReveal,
  workersStaggerContainer,
} from "@/lib/motion";

export const TIKTOK_CHANNELS = [
  {
    name: "NCEA Argentia",
    badge: "Официальный",
    status: "Официальный TikTok NCEA",
    handle: "@ncea_argentia",
    description: "Новости студии, анонсы, проекты, обновления и основная деятельность NCEA.",
    href: "https://www.tiktok.com/@ncea_argentia",
    kind: "official",
  },
  {
    name: "NCEA Kreativ",
    badge: "Creative Lab",
    status: "Креативное направление",
    handle: "@ncea_kreativ",
    description: "Эксперименты, необычные форматы, продвижение, креативы и тестовые идеи NCEA.",
    href: "https://www.tiktok.com/@ncea_kreativ",
    kind: "creative",
  },
] as const;

export function TikTokMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.4 3.2v9.95a4.85 4.85 0 1 1-4.15-4.8v3.12a1.92 1.92 0 1 0 1.22 1.78V3.2h2.93Zm0 0c.42 2.26 1.77 3.58 4.15 4.02v3.02a8.15 8.15 0 0 1-4.15-1.42"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TikTokSection() {
  return (
    <motion.section
      className="ref-tiktok"
      aria-labelledby="tiktok-heading"
      variants={workersStaggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={WORKERS_MOTION_VIEWPORT}
    >
      <motion.header className="ref-tiktok-heading" variants={workersHeadingReveal}>
        <p>SOCIAL / NCEA</p>
        <h2 id="tiktok-heading">Два направления. Одна студия.</h2>
        <span>Следите за основной жизнью NCEA и экспериментами нашей creative-команды.</span>
      </motion.header>
      <motion.div className="ref-tiktok-grid" variants={workersStaggerContainer}>
        {TIKTOK_CHANNELS.map((channel, index) => (
          <motion.article
            className={`ref-tiktok-card-motion ref-tiktok-card-motion--${channel.kind}`}
            variants={workersDirectionalReveal(index === 0 ? "left" : "right")}
            key={channel.href}
          >
            <motion.a
              className={`ref-tiktok-card ref-tiktok-card--${channel.kind}`}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Открыть TikTok ${channel.name} в новой вкладке`}
              whileHover={{ y: -5, scale: 1.006 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: CHROME_MOTION_DURATION.fast, ease: CHROME_MOTION_EASE }}
            >
              <span className="ref-tiktok-card-index" aria-hidden="true">
                0{index + 1}
              </span>
              <div className="ref-tiktok-card-top">
                <span className="ref-tiktok-icon">
                  <TikTokMark />
                </span>
                <span className="ref-tiktok-badge">{channel.badge}</span>
              </div>
              <div className="ref-tiktok-card-copy">
                <small>{channel.status}</small>
                <h3>{channel.name}</h3>
                <p>{channel.description}</p>
              </div>
              <footer>
                <span>{channel.handle}</span>
                <strong>
                  Смотреть <ArrowUpRight />
                </strong>
              </footer>
            </motion.a>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
