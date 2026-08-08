import { useNavigate, useRouterState } from "@tanstack/react-router";

/** Плавный скролл к секции главной страницы (с переходом на "/" при необходимости). */
export function useHashNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (hash: string) => {
    const scrollToSection = () => {
      const section = document.getElementById(hash);
      if (!section) return false;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `/#${hash}`);
      return true;
    };

    if (pathname === "/") {
      scrollToSection();
      return;
    }

    navigate({ to: "/", hash });
    window.setTimeout(scrollToSection, 120);
    window.setTimeout(scrollToSection, 420);
  };
}
