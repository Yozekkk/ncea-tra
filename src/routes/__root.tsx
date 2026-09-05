import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { I, LOGO_ROUND } from "@/components/site/ui";
import { CurrencyProvider } from "@/lib/currency";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CHROME_MOTION_DURATION, CHROME_MOTION_EASE } from "../lib/motion";

const SITE_URL = "https://www.ncea-studio.com";

function RouteEffects() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function NotFoundComponent() {
  return (
    <div className="ncea-status-page relative min-h-screen overflow-hidden bg-white text-stone-950">
      <div className="noise fixed inset-0 opacity-[.06] pointer-events-none" />
      <SiteHeader />
      <main className="relative z-10 min-h-[82vh] flex items-center justify-center px-4 pt-24 pb-16">
        <div className="ncea-status-panel max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-[0_28px_80px_rgba(24,24,27,.1)] sm:p-12">
          <img
            src={LOGO_ROUND}
            alt="NCEA"
            width={112}
            height={112}
            className="round-brand-image mx-auto h-28 w-28"
          />
          <div className="mt-4 font-display text-8xl sm:text-9xl font-black gradient-text">404</div>
          <h1 className="mt-3 font-display text-2xl sm:text-4xl font-bold">Страница не найдена</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-stone-500 sm:text-base">
            Возможно, адрес изменился или такой страницы больше нет. Вернитесь на главную либо
            откройте каталог услуг NCEA.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="inline-flex h-12 items-center gap-2 rounded-full gradient-btn px-6 font-medium"
            >
              <I.Home className="h-4 w-4" /> На главную
            </Link>
            <Link
              to="/services"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-stone-200 bg-white px-6 font-medium shadow-sm"
            >
              Посмотреть услуги <I.Arrow className="h-4 w-4" />
            </Link>
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
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="ncea-status-page relative flex min-h-screen items-center justify-center bg-white px-4 text-stone-950">
      <div className="noise fixed inset-0 opacity-[.06] pointer-events-none" />
      <div className="ncea-status-panel relative max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-[0_28px_80px_rgba(24,24,27,.1)]">
        <img src={LOGO_ROUND} alt="NCEA" className="round-brand-image mx-auto h-20 w-20" />
        <h1 className="mt-5 font-display text-2xl font-bold">Страница не загрузилась</h1>
        <p className="mt-3 text-sm text-stone-500">
          Произошла техническая ошибка. Попробуйте загрузить страницу повторно или вернитесь на
          главную.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full gradient-btn px-5 text-sm font-medium"
          >
            Повторить
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-5 text-sm font-medium shadow-sm"
          >
            На главную
          </a>
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
      { name: "theme-color", content: "#ffffff" },
      { name: "application-name", content: "NCEA" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { title: "NCEA — разработка и оформление Minecraft-проектов" },
      {
        name: "description",
        content:
          "NCEA создаёт плагины, сборки, сайты, карты, скины, ресурспаки, дизайн и ивенты для Minecraft-проектов.",
      },
      { property: "og:title", content: "NCEA — разработка и оформление Minecraft-проектов" },
      {
        property: "og:description",
        content:
          "Плагины, серверные сборки, сайты, карты, дизайн, ресурспаки и комплексные решения для Minecraft-сообществ.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/images/brand/ncea-logo-mark.webp` },
      { property: "og:image:alt", content: "Официальный логотип NCEA" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "NCEA — разработка и оформление Minecraft-проектов" },
      {
        name: "twitter:description",
        content:
          "Плагины, сборки, сайты, карты, дизайн, ресурспаки и ивенты для Minecraft-проектов.",
      },
      { name: "twitter:image", content: `${SITE_URL}/images/brand/ncea-logo-mark.webp` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: SITE_URL },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" data-theme="light" style={{ colorScheme: "light" }}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <MotionConfig
          reducedMotion="user"
          transition={{ duration: CHROME_MOTION_DURATION.normal, ease: CHROME_MOTION_EASE }}
        >
          <RouteEffects />
          <Outlet />
          <Toaster position="bottom-right" theme="light" />
        </MotionConfig>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
