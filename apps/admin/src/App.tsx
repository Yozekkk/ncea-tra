import { lazy, Suspense, useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { AuthGate } from "./components/AuthGate";
import { useAdminAccess } from "./components/AdminAccess";
import { LoadingState } from "./components/ui";
import type { AdminWorkspace } from "./lib/types";

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
const EmployeesPage = lazy(() =>
  import("./pages/EmployeesPage").then((module) => ({ default: module.EmployeesPage })),
);
const NCreateDashboard = lazy(() =>
  import("./pages/NCreateDashboard").then((module) => ({ default: module.NCreateDashboard })),
);
const NCreateSettingsPage = lazy(() =>
  import("./pages/NCreateSettingsPage").then((module) => ({ default: module.NCreateSettingsPage })),
);
const NCreateForumPage = lazy(() =>
  import("./pages/NCreateForumPage").then((module) => ({ default: module.NCreateForumPage })),
);

const routes: Record<string, React.ComponentType> = {
  "/": Dashboard,
  "/users": UsersPage,
  "/forum": ForumPage,
  "/marketplace": MarketplacePage,
  "/employees": EmployeesPage,
  "/moderation": ModerationPage,
  "/settings": SettingsPage,
  "/deleted": DeletedPage,
};

const ncreateRoutes: Record<string, React.ComponentType> = {
  "/": NCreateDashboard,
  "/site": NCreateSettingsPage,
  "/forum": NCreateForumPage,
};

const deploymentBase =
  window.location.pathname === "/ncea-admin" || window.location.pathname.startsWith("/ncea-admin/")
    ? "/ncea-admin"
    : "";

export function App() {
  return (
    <AuthGate>
      <AuthorizedApp />
    </AuthGate>
  );
}

function AuthorizedApp() {
  const { role } = useAdminAccess();
  const [workspace, setWorkspaceState] = useState<AdminWorkspace>(() =>
    window.localStorage.getItem("ncea-admin-workspace") === "ncreate" ? "ncreate" : "ncea",
  );
  const [path, setPath] = useState(getCurrentPath);
  useEffect(() => {
    const onPopState = () => setPath(getCurrentPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = (next: string) => {
    if (next === path) return;
    window.history.pushState({}, "", `${deploymentBase}${next === "/" ? "" : next}` || "/");
    setPath(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const setWorkspace = (next: AdminWorkspace) => {
    window.localStorage.setItem("ncea-admin-workspace", next);
    setWorkspaceState(next);
    window.history.pushState({}, "", deploymentBase || "/");
    setPath("/");
  };
  const forbidden =
    workspace === "ncreate"
      ? role === "moderator"
        ? ["/site"]
        : []
      : role === "owner"
        ? []
        : role === "admin"
          ? ["/deleted"]
          : ["/users", "/employees", "/settings", "/deleted"];
  const allowedPath = forbidden.includes(path) ? "/moderation" : path;
  const activeRoutes = workspace === "ncreate" ? ncreateRoutes : routes;
  const safePath = activeRoutes[allowedPath] ? allowedPath : "/";
  const Page = activeRoutes[safePath] ?? Dashboard;
  return (
    <AppShell
      path={safePath}
      navigate={navigate}
      role={role}
      workspace={workspace}
      setWorkspace={setWorkspace}
    >
      <Suspense fallback={<LoadingState />}>
        <Page />
      </Suspense>
    </AppShell>
  );
}

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, "") || "/";
  return normalized;
}

function getCurrentPath() {
  const pathname =
    deploymentBase && window.location.pathname.startsWith(deploymentBase)
      ? window.location.pathname.slice(deploymentBase.length)
      : window.location.pathname;
  return normalizePath(pathname);
}
