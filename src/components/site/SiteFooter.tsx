import { Link } from "@tanstack/react-router";
import { I, LOGO_ROUND } from "@/components/site/ui";
import { SERVICES } from "@/lib/services";
import { useHashNav } from "@/components/site/SiteHeader";

const TELEGRAM_URL = "https://t.me/lisiy_bob";
const DISCORD_URL = "https://discord.gg/u73vDgBMAn";
const GITHUB_URL = "https://github.com/Yozekkk";

export function SiteFooter() {
  const goHash = useHashNav();
  const featured = SERVICES.slice(0, 6);

  return (
    <footer className="ar-footer">
      <div className="ar-footer-cta">
        <div><span>Готовы начать?</span><h2>Соберите заказ и узнайте<br />предварительную стоимость</h2><p>Выберите услугу, настройте параметры и отправьте готовую заявку менеджеру NCEA.</p></div>
        <Link to="/services" className="ar-button ar-button-primary">Выбрать услугу <I.Arrow className="h-5 w-5" /></Link>
      </div>

      <div className="ar-footer-main">
        <div className="ar-footer-brand">
          <Link to="/" aria-label="NCEA — на главную"><img src={LOGO_ROUND} alt="Логотип NCEA" /><strong>NCEA</strong></Link>
          <p>Агентство разработки и оформления Minecraft-проектов: плагины, сборки, сайты, карты, ресурспаки, дизайн и ивенты.</p>
        </div>
        <div><span>Услуги</span><ul>{featured.map((service) => <li key={service.id}><Link to={service.path}>{service.title}</Link></li>)}</ul></div>
        <div><span>Навигация</span><ul>
          <li><Link to="/">Главная</Link></li><li><Link to="/services">Все услуги</Link></li>
          <li><button onClick={() => goHash("about")}>О нас</button></li><li><button onClick={() => goHash("portfolio")}>Портфолио</button></li>
          <li><button onClick={() => goHash("team")}>Отзывы</button></li><li><button onClick={() => goHash("faq")}>FAQ</button></li>
        </ul></div>
        <div><span>Связь</span><ul>
          <li><a href={TELEGRAM_URL} target="_blank" rel="noreferrer">Telegram: @lisiy_bob</a></li>
          <li><a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord: сервер NCEA</a></li>
          <li><a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a></li>
          <li>Заказы принимаются через конфигураторы услуг.</li>
        </ul></div>
      </div>

      <div className="ar-footer-bottom"><span>© {new Date().getFullYear()} NovaCraft Event Agency. Все права защищены.</span><span>NCEA v2 · Minecraft Digital Agency</span></div>
    </footer>
  );
}

