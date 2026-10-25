import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, Shield, Store, UserRound, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "./AuthProvider";
import { StreakDetails, StreakIndicator } from "@/features/streak/components";

export function AccountMenu({ compact = false }: { compact?: boolean }) {
  const auth = useAuth();
  const navigate = useNavigate();
  if (!auth.ready) return <div className="account-skeleton" aria-label="Проверка сессии" />;
  if (!auth.user) {
    return (
      <div className={`guest-actions${compact ? " guest-actions-compact" : ""}`}>
        <Link to="/login" search={{ redirect: "/profile" }} className="account-link">
          <LogIn aria-hidden="true" />
          Войти
        </Link>
        {!compact ? (
          <Link to="/register" className="account-register">
            <UserPlus aria-hidden="true" />
            Регистрация
          </Link>
        ) : null}
      </div>
    );
  }
  const username = auth.profile?.username ?? "Аккаунт";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="account-trigger"
        aria-label={`Меню аккаунта ${username} и ударный режим`}
      >
        {!compact ? (
          <Avatar className="h-9 w-9">
            <AvatarImage src={auth.profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : null}
        {!compact ? <span>{username}</span> : null}
        <StreakIndicator />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="account-dropdown w-72 rounded-2xl p-2">
        <DropdownMenuLabel className="truncate">{auth.user.email}</DropdownMenuLabel>
        <div className="account-streak-details">
          <StreakDetails compact />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserRound />
            Профиль
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/marketplace/my">
            <Store />
            Мои объявления
          </Link>
        </DropdownMenuItem>
        {auth.isAdmin ? (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <Shield />
              Модерация
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void auth.logout().then(() => navigate({ to: "/" }))}>
          <LogOut />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
