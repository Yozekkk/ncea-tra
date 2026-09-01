import { Link } from "@tanstack/react-router";
import { Lightbulb, Send } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { LOGO_MARK } from "@/components/site/ui";
import { MOTION_DURATION, MOTION_EASE, MOTION_VIEWPORT, staggerContainer } from "@/lib/motion";

export function SiteFooter() {
  const reduceMotion = useReducedMotion();
  const columnVariants: Variants = {
    hidden: {
      opacity: 0,
      transform: reduceMotion ? "none" : "translate3d(0, 14px, 0)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: { duration: MOTION_DURATION.reveal, ease: MOTION_EASE },
    },
  };

  return (
    <footer className="ref-footer">
      <motion.div
        className="ref-footer-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={MOTION_VIEWPORT}
      >
        <motion.div className="ref-footer-brand" variants={columnVariants}>
          <Link to="/">
            <img src={LOGO_MARK} alt="" />
            <strong>NCEA</strong>
          </Link>
          <p>Minecraft Digital Agency: разработка, дизайн, контент и поддержка игровых проектов.</p>
          <small>© {new Date().getFullYear()} NCEA</small>
        </motion.div>
        <motion.div variants={columnVariants}>
          <h3>Навигация</h3>
          <ul>
            <li>
              <Link to="/services">Услуги</Link>
            </li>
            <li>
              <a href="/workers">Сотрудники</a>
            </li>
            <li>
              <a href="/#reviews">Отзывы</a>
            </li>
          </ul>
        </motion.div>
        <motion.div variants={columnVariants}>
          <h3>Направления</h3>
          <ul>
            <li>
              <Link to="/plugins">Плагины</Link>
            </li>
            <li>
              <Link to="/server-setup">Настройка серверов</Link>
            </li>
            <li>
              <Link to="/websites">Сайты</Link>
            </li>
            <li>
              <Link to="/design">Дизайн</Link>
            </li>
          </ul>
        </motion.div>
        <motion.div variants={columnVariants}>
          <h3>Связь</h3>
          <ul>
            <li>
              <a href="https://t.me/lisiy_bob" target="_blank" rel="noreferrer">
                <Send /> Написать в ЛС
              </a>
            </li>
            <li>
              <a href="https://t.me/ncea_official" target="_blank" rel="noreferrer">
                <Lightbulb /> Telegram-канал
              </a>
            </li>
          </ul>
        </motion.div>
      </motion.div>
      <p className="ref-legal">
        Это не официальный продукт или услуга Minecraft. NCEA не одобрена и не связана с Mojang
        Studios или Microsoft. Minecraft является товарным знаком Mojang Studios. Все упомянутые
        товарные знаки принадлежат их владельцам.
      </p>
    </footer>
  );
}
