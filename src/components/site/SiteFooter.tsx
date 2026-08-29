import { Link } from "@tanstack/react-router";
import { Lightbulb, Send } from "lucide-react";
import { LOGO_MARK } from "@/components/site/ui";

export function SiteFooter() {
  return (
    <footer className="ref-footer">
      <div className="ref-footer-grid">
        <div className="ref-footer-brand">
          <Link to="/">
            <img src={LOGO_MARK} alt="" />
            <strong>NCEA</strong>
          </Link>
          <p>Minecraft Digital Agency: разработка, дизайн, контент и поддержка игровых проектов.</p>
          <small>© {new Date().getFullYear()} NCEA</small>
        </div>
        <div>
          <h3>Навигация</h3>
          <ul>
            <li>
              <Link to="/services">Услуги</Link>
            </li>
            <li>
              <a href="/#about">О нас</a>
            </li>
            <li>
              <a href="/workers">Работники</a>
            </li>
            <li>
              <a href="/#reviews">Отзывы</a>
            </li>
          </ul>
        </div>
        <div>
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
        </div>
        <div>
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
        </div>
      </div>
      <p className="ref-legal">
        NCEA не связана с Mojang Studios или Microsoft. Minecraft является товарным знаком Mojang
        Studios. Все упомянутые товарные знаки принадлежат их владельцам.
      </p>
    </footer>
  );
}
