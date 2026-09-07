import { createFileRoute, Link } from "@tanstack/react-router";
import { CommunityShell, LoadingPanel } from "@/features/community/CommunityShell";
import { AuthForm } from "@/features/auth/AuthForm";
import { useAuth } from "@/features/auth/AuthProvider";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Регистрация — NCEA" },
      { name: "description", content: "Создание аккаунта NCEA." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const auth = useAuth();
  return (
    <CommunityShell>
      <section className="auth-page">
        <div className="auth-card">
          <p className="ref-eyebrow">НОВЫЙ УЧАСТНИК</p>
          <h1>Создать аккаунт</h1>
          <p>Один аккаунт для форума, маркетплейса и управления своими публикациями.</p>
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
            <AuthForm mode="register" />
          )}
        </div>
      </section>
    </CommunityShell>
  );
}
