import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { I, LOGO_MARK, LOGO_ROUND } from "@/components/site/ui";
import appCss from "../styles.css?url";
import liquidCss from "../liquid.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const SITE_URL = "https://ncea-tra.vercel.app";

function RouteEffects() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

function BrandIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("ncea:intro:shown");
    if (alreadyShown) return;
    setVisible(true);
    sessionStorage.setItem("ncea:intro:shown", "1");
    const timer = window.setTimeout(() => setVisible(false), 1650);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="ncea-intro fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-stone-950" aria-hidden="true">
      <div className="noise absolute inset-0 opacity-40" />
      <div className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/16 blur-[120px]" />
      <div className="ncea-intro-scan" />
      <div className="relative flex flex-col items-center px-6 text-center [perspective:900px]">
        <div className="ncea-wordmark" aria-label="NCEA"><span>N</span><span>C</span><span>E</span><span>A</span></div>
        <div className="ncea-intro-caption mt-12 text-[10px] font-semibold uppercase tracking-[.42em] text-white/48 sm:text-xs">NovaCraft Event Agency</div>
      </div>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 text-white">
      <div className="noise fixed inset-0 opacity-40 pointer-events-none" />
      <SiteHeader />
      <main className="relative z-10 min-h-[82vh] flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-2xl text-center liquid-panel p-8 sm:p-12">
          <img src={LOGO_MARK} alt="NCEA" className="round-brand-image mx-auto h-28 w-28" />
          <div className="mt-4 font-display text-8xl sm:text-9xl font-black gradient-text">404</div>
          <h1 className="mt-3 font-display text-2xl sm:text-4xl font-bold">Страница не найдена</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-white/55">Возможно, адрес изменился или такой страницы больше нет. Вернитесь на главную либо откройте каталог услуг NCEA.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="inline-flex h-12 items-center gap-2 rounded-full gradient-btn px-6 font-medium"><I.Home className="h-4 w-4" /> На главную</Link>
            <Link to="/services" className="liquid-secondary inline-flex h-12 items-center gap-2 px-6 font-medium">Посмотреть услуги <I.Arrow className="h-4 w-4" /></Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-stone-950 px-4 text-white">
      <div className="noise fixed inset-0 opacity-40 pointer-events-none" />
      <div className="relative max-w-md text-center liquid-panel p-8">
        <img src={LOGO_ROUND} alt="NCEA" className="round-brand-image mx-auto h-20 w-20" />
        <h1 className="mt-5 font-display text-2xl font-bold">Страница не загрузилась</h1>
        <p className="mt-3 text-sm text-white/55">Произошла техническая ошибка. Попробуйте загрузить страницу повторно или вернитесь на главную.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex h-11 items-center justify-center rounded-full gradient-btn px-5 text-sm font-medium">Повторить</button>
          <a href="/" className="liquid-secondary inline-flex h-11 items-center justify-center px-5 text-sm font-medium">На главную</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0c0a09" },
      { name: "application-name", content: "NCEA" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { title: "NCEA — разработка и оформление Minecraft-проектов" },
      { name: "description", content: "NCEA создаёт плагины, сборки, сайты, карты, скины, ресурспаки, дизайн и ивенты для Minecraft-проектов." },
      { property: "og:title", content: "NCEA — разработка и оформление Minecraft-проектов" },
      { property: "og:description", content: "Плагины, серверные сборки, сайты, карты, дизайн, ресурспаки и комплексные решения для Minecraft-сообществ." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/ncea-mark.svg` },
      { property: "og:image:alt", content: "Официальный логотип NCEA" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "NCEA — разработка и оформление Minecraft-проектов" },
      { name: "twitter:description", content: "Плагины, сборки, сайты, карты, дизайн, ресурспаки и ивенты для Minecraft-проектов." },
      { name: "twitter:image", content: `${SITE_URL}/ncea-mark.svg` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: liquidCss },
      { rel: "stylesheet", href: "/ncea-intro.css" },
      { rel: "stylesheet", href: "/visual-fixes.css" },
      { rel: "stylesheet", href: "/nav-motion.css" },
      { rel: "stylesheet", href: "/network-effects.css" },
      { rel: "canonical", href: SITE_URL },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", type: "image/svg+xml", href: "/ncea-round.svg" },
      { rel: "apple-touch-icon", href: "/ncea-round.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&family=Manrope:wght@600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <html lang="ru"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <RouteEffects />
      <BrandIntro />
      <Outlet />
      <Toaster position="bottom-right" theme="dark" />
    </QueryClientProvider>
  );
}
