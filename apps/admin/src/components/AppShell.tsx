import { useState, type PropsWithChildren } from "react";
import {
  CircleGauge,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Users,
  UserRoundCog,
  X,
  Trash2,
  Boxes,
  Globe2,
  ChevronsUpDown,
} from "lucide-react";
import { getSupabase } from "../lib/supabase";
import { IconButton } from "./ui";
import type { AdminWorkspace } from "../lib/types";

const navigation = [
  { path: "/", label: "Dashboard", icon: CircleGauge },
  { path: "/users", label: "Users", icon: Users },
  { path: "/forum", label: "Forum", icon: MessageSquareText },
  { path: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { path: "/employees", label: "Сотрудники", icon: UserRoundCog },
  { path: "/moderation", label: "Moderation", icon: ShieldCheck },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/deleted", label: "Удалённые", icon: Trash2 },
];

const ncreateNavigation = [
  { path: "/", label: "Dashboard", icon: CircleGauge },
  { path: "/site", label: "Сайт", icon: Globe2 },
  { path: "/forum", label: "Forum", icon: MessageSquareText },
];

export function AppShell({
  path,
  navigate,
  role,
  children,
  workspace,
  setWorkspace,
}: PropsWithChildren<{
  path: string;
  navigate: (path: string) => void;
  role: "moderator" | "admin" | "owner";
  workspace: AdminWorkspace;
  setWorkspace: (workspace: AdminWorkspace) => void;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const move = (next: string) => {
    navigate(next);
    setMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <button className="wordmark" onClick={() => move("/")}>
          {workspace === "ncea" ? "NCEA" : "NCreate"}
          <span>/admin</span>
        </button>
        <IconButton aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
          <Menu />
        </IconButton>
      </header>
      <aside className={menuOpen ? "sidebar sidebar-open" : "sidebar"}>
        <div className="sidebar-top">
          <button className="wordmark" onClick={() => move("/")}>
            {workspace === "ncea" ? "NCEA" : "NCreate"}
            <span>/admin</span>
          </button>
          <IconButton
            className="mobile-close"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </IconButton>
        </div>
        <div className="project-switcher" aria-label="Project switcher">
          <button
            className={workspace === "ncea" ? "active" : ""}
            onClick={() => setWorkspace("ncea")}
          >
            <Globe2 size={16} />
            <span>
              <strong>NCEA</strong>
              <small>Основной проект</small>
            </span>
          </button>
          <button
            className={workspace === "ncreate" ? "active ncreate" : ""}
            onClick={() => setWorkspace("ncreate")}
          >
            <Boxes size={16} />
            <span>
              <strong>NCreate</strong>
              <small>Minecraft server</small>
            </span>
          </button>
          <ChevronsUpDown size={14} aria-hidden />
        </div>
        <nav aria-label="Admin navigation">
          {(workspace === "ncreate" ? ncreateNavigation : navigation)
            .filter(({ path: itemPath }) =>
              workspace === "ncreate"
                ? role !== "moderator" || itemPath !== "/site"
                : role === "owner"
                  ? true
                  : role === "admin"
                    ? itemPath !== "/deleted"
                    : !["/users", "/employees", "/settings", "/deleted"].includes(itemPath),
            )
            .map(({ path: itemPath, label, icon: Icon }) => (
              <button
                key={itemPath}
                className={path === itemPath ? "nav-item active" : "nav-item"}
                onClick={() => move(itemPath)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
        </nav>
        <button className="nav-item sign-out" onClick={() => void getSupabase().auth.signOut()}>
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </aside>
      {menuOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <main className="main-content">{children}</main>
    </div>
  );
}
