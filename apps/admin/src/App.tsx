import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { AuthGate } from "./components/AuthGate";
import { useAdminAccess } from "./components/AdminAccess";
import { Dashboard } from "./pages/Dashboard";
import { ForumPage } from "./pages/ForumPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { ModerationPage } from "./pages/ModerationPage";
import { SettingsPage } from "./pages/SettingsPage";
import { UsersPage } from "./pages/UsersPage";

const routes: Record<string, React.ComponentType> = {
  "/": Dashboard,
  "/users": UsersPage,
  "/forum": ForumPage,
  "/marketplace": MarketplacePage,
  "/moderation": ModerationPage,
  "/settings": SettingsPage,
};

export function App() {
  return (
    <AuthGate>
      <AuthorizedApp />
    </AuthGate>
  );
}

function AuthorizedApp() {
  const { role } = useAdminAccess();
  const [path, setPath] = useState(normalizePath(window.location.pathname));
  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = (next: string) => {
    if (next === path) return;
    window.history.pushState({}, "", next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const allowedPath =
    role === "admin" || !["/users", "/settings"].includes(path) ? path : "/moderation";
  const Page = routes[allowedPath] ?? (role === "admin" ? Dashboard : ModerationPage);
  return (
    <AppShell path={allowedPath} navigate={navigate} role={role}>
      <Page />
    </AppShell>
  );
}

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, "") || "/";
  return routes[normalized] ? normalized : "/";
}
