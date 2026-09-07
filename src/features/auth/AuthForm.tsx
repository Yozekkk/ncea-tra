import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, registerAccount } from "./api";
import { loginSchema, registerSchema, type LoginValues, type RegisterValues } from "./schemas";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="field-error">
      {message}
    </p>
  ) : null;
}

export function AuthForm({
  mode,
  redirect = "/profile",
}: {
  mode: "login" | "register";
  redirect?: string;
}) {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const isRegister = mode === "register";
  const schema = isRegister ? registerSchema : loginSchema.extend({ username: z.literal("") });
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "" },
    mode: "onBlur",
  });
  const submit = form.handleSubmit(async (values) => {
    setServerError("");
    try {
      if (isRegister) await registerAccount(values);
      else await login(values as LoginValues);
      await navigate({ to: redirect.startsWith("/") ? redirect : "/profile" });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Не удалось выполнить вход");
    }
  });
  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {serverError ? (
        <div className="form-error-summary" role="alert" tabIndex={-1}>
          {serverError}
        </div>
      ) : null}
      {isRegister ? (
        <div className="form-field">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            autoComplete="username"
            aria-invalid={Boolean(form.formState.errors.username)}
            aria-describedby="username-error username-help"
            {...form.register("username")}
          />
          <p id="username-help" className="field-help">
            3–32 символа: латиница, цифры, точка, дефис или подчёркивание.
          </p>
          <FieldError id="username-error" message={form.formState.errors.username?.message} />
        </div>
      ) : null}
      <div className="form-field">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby="email-error"
          {...form.register("email")}
        />
        <FieldError id="email-error" message={form.formState.errors.email?.message} />
      </div>
      <div className="form-field">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          aria-invalid={Boolean(form.formState.errors.password)}
          aria-describedby="password-error"
          {...form.register("password")}
        />
        <FieldError id="password-error" message={form.formState.errors.password?.message} />
      </div>
      <Button
        className="h-12 w-full rounded-full gradient-btn"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
        {isRegister ? "Создать аккаунт" : "Войти"}
      </Button>
      <p className="auth-switch">
        {isRegister ? "Уже есть аккаунт?" : "Ещё нет аккаунта?"}{" "}
        <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Войти" : "Регистрация"}</Link>
      </p>
    </form>
  );
}
