import { lazy, Suspense, useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { AuthGate } from "./components/AuthGate";
import { useAdminAccess } from "./components/AdminAccess";
import { LoadingState } from "./components/ui";

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const ForumPage = lazy(() =>
  import("./pages/ForumPage").then((module) => ({ default: module.ForumPage })),
);
const MarketplacePage = lazy(() =>
  import("./pages/MarketplacePage").then((module) => ({ default: module.MarketplacePage })),
);
const ModerationPage = lazy(() =>
  import("./pages/ModerationPage").then((module) => ({ default: module.ModerationPage })),
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage })),
);
const UsersPage = lazy(() =>
  import("./pages/UsersPage").then((module) => ({ default: module.UsersPage })),
);
const DeletedPage = lazy(() =>
  import("./pages/DeletedPage").then((module) => ({ default: module.DeletedPage })),
);

const routes: Record<string, React.ComponentType> = {
  "/": Dashboard,
  "/users": UsersPage,
  "/forum": ForumPage,
  "/marketplace": MarketplacePage,
  "/moderation": ModerationPage,
  "/settings": SettingsPage,
  "/deleted": DeletedPage,
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
  const forbidden =
    role === "owner" ? [] : role === "admin" ? ["/deleted"] : ["/users", "/settings", "/deleted"];
  const allowedPath = forbidden.includes(path) ? "/moderation" : path;
  const Page = routes[allowedPath] ?? (role === "moderator" ? ModerationPage : Dashboard);
  return (
    <AppShell path={allowedPath} navigate={navigate} role={role}>
      <Suspense fallback={<LoadingState />}>
        <Page />
      </Suspense>
    </AppShell>
  );
}

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, "") || "/";
  return routes[normalized] ? normalized : "/";
}
