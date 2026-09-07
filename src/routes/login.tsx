import { createFileRoute, Link } from "@tanstack/react-router";
import { CommunityShell, LoadingPanel } from "@/features/community/CommunityShell";
import { AuthForm } from "@/features/auth/AuthForm";
import { useAuth } from "@/features/auth/AuthProvider";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : "/profile",
  }),
  head: () => ({
    meta: [{ title: "Вход — NCEA" }, { name: "description", content: "Вход в аккаунт NCEA." }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const auth = useAuth();
  return (
    <CommunityShell>
      <section className="auth-page">
        <div className="auth-card">
          <p className="ref-eyebrow">АККАУНТ NCEA</p>
          <h1>С возвращением</h1>
          <p>Войдите, чтобы писать на форуме и управлять объявлениями.</p>
          {!auth.ready ? (
            <LoadingPanel />
          ) : auth.user ? (
            <div className="community-state">
              <strong>Вы уже вошли как {auth.profile?.username}</strong>
              <Link to="/profile" className="community-link">
                Открыть профиль
              </Link>
            </div>
          ) : (
            <AuthForm mode="login" redirect={redirect} />
          )}
        </div>
      </section>
    </CommunityShell>
  );
}
