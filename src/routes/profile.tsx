import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/features/auth/api";
import { useAuth } from "@/features/auth/AuthProvider";
import { profileSchema, type ProfileValues } from "@/features/auth/schemas";
import { CommunityHero, CommunityShell, LoadingPanel } from "@/features/community/CommunityShell";
import { StreakCard } from "@/features/streak/components";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Профиль — NCEA" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const auth = useAuth();
  if (!auth.ready)
    return (
      <CommunityShell>
        <LoadingPanel />
      </CommunityShell>
    );
  if (!auth.user || !auth.profile)
    return (
      <CommunityShell>
        <section className="community-section">
          <div className="community-state">
            <strong>Войдите, чтобы открыть профиль</strong>
            <div className="community-actions">
              <Link to="/login" search={{ redirect: "/profile" }} className="community-button">
                Войти
              </Link>
              <Link to="/register" className="community-button-secondary">
                Регистрация
              </Link>
            </div>
          </div>
        </section>
      </CommunityShell>
    );
  return <ProfileEditor />;
}

function ProfileEditor() {
  const auth = useAuth();
  const [result, setResult] = useState("");
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: {
      username: auth.profile?.username ?? "",
      displayName: auth.profile?.display_name ?? "",
      bio: auth.profile?.bio ?? "",
    },
  });
  const submit = form.handleSubmit(async (values) => {
    setResult("");
    try {
      await updateProfile(auth.user!.id, values);
      await auth.refreshProfile();
      setResult("Профиль сохранён");
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Не удалось сохранить профиль");
    }
  });
  return (
    <CommunityShell>
      <section className="community-section">
        <CommunityHero
          eyebrow="ВАШ АККАУНТ"
          title={auth.profile?.username ?? "Профиль"}
          description="Короткая публичная карточка участника NCEA."
        />
        <StreakCard />
        <form className="profile-card" onSubmit={submit}>
          <div className="form-field">
            <Label htmlFor="profile-username">Username</Label>
            <Input id="profile-username" autoComplete="username" {...form.register("username")} />
            {form.formState.errors.username ? (
              <p className="field-error">{form.formState.errors.username.message}</p>
            ) : null}
          </div>
          <div className="form-field">
            <Label htmlFor="display-name">Отображаемое имя</Label>
            <Input id="display-name" {...form.register("displayName")} />
          </div>
          <div className="form-field">
            <Label htmlFor="bio">О себе</Label>
            <Textarea id="bio" rows={5} {...form.register("bio")} />
          </div>
          {result ? (
            <p role="status" className="field-help">
              {result}
            </p>
          ) : null}
          <div className="community-actions">
            <Button className="rounded-full">Сохранить изменения</Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => void auth.logout()}
            >
              Выйти
            </Button>
          </div>
        </form>
      </section>
    </CommunityShell>
  );
}
