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
  X,
  Trash2,
} from "lucide-react";
import { getSupabase } from "../lib/supabase";
import { IconButton } from "./ui";

const navigation = [
  { path: "/", label: "Dashboard", icon: CircleGauge },
  { path: "/users", label: "Users", icon: Users },
  { path: "/forum", label: "Forum", icon: MessageSquareText },
  { path: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { path: "/moderation", label: "Moderation", icon: ShieldCheck },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/deleted", label: "Удалённые", icon: Trash2 },
];

export function AppShell({
  path,
  navigate,
  role,
  children,
}: PropsWithChildren<{
  path: string;
  navigate: (path: string) => void;
  role: "moderator" | "admin" | "owner";
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
          NCEA<span>/admin</span>
        </button>
        <IconButton aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
          <Menu />
        </IconButton>
      </header>
      <aside className={menuOpen ? "sidebar sidebar-open" : "sidebar"}>
        <div className="sidebar-top">
          <button className="wordmark" onClick={() => move("/")}>
            NCEA<span>/admin</span>
          </button>
          <IconButton
            className="mobile-close"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </IconButton>
        </div>
        <nav aria-label="Admin navigation">
          {navigation
            .filter(({ path: itemPath }) =>
              role === "owner"
                ? true
                : role === "admin"
                  ? itemPath !== "/deleted"
                  : !["/users", "/settings", "/deleted"].includes(itemPath),
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
