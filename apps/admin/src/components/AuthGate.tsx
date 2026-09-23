import { useEffect, useState, type FormEvent, type PropsWithChildren } from "react";
import type { User } from "@supabase/supabase-js";
import { LockKeyhole, LogIn, ShieldX } from "lucide-react";
import { getCurrentRole } from "../lib/data";
import { getSupabase, supabaseConfig } from "../lib/supabase";
import { Button, ErrorState, LoadingState } from "./ui";
import type { AppRole } from "../lib/types";
import { AdminAccessContext, type StaffRole } from "./AdminAccess";

export function AuthGate({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<"loading" | "login" | "denied" | "staff">("loading");
  const [role, setRole] = useState<AppRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabaseConfig.configured) {
      setError("Supabase environment variables are missing.");
      setStatus("login");
      return;
    }
    const supabase = getSupabase();
    let active = true;
    let version = 0;
    let receivedEvent = false;
    let currentUserId: string | null = null;
    const verify = async (nextUser: User | null) => {
      const current = ++version;
      setUser(nextUser);
      if (!nextUser) {
        currentUserId = null;
        setRole(null);
        setStatus("login");
        return;
      }
      if (currentUserId !== nextUser.id) {
        currentUserId = nextUser.id;
        setRole(null);
        setStatus("loading");
      }
      try {
        const nextRole = await getCurrentRole(nextUser.id);
        if (!active || current !== version) return;
        setRole(nextRole);
        setError("");
        if (nextRole === "owner" || nextRole === "admin" || nextRole === "moderator") setStatus("staff");
        else setStatus("denied");
      } catch (reason) {
        if (!active || current !== version) return;
        setRole(null);
        setError(reason instanceof Error ? reason.message : "Authorization failed.");
        setStatus("denied");
      }
    };
    void supabase.auth.getSession().then(({ data }) => {
      if (active && !receivedEvent) return verify(data.session?.user ?? null);
    }).catch((reason) => {
      if (!active || receivedEvent) return;
      setError(reason instanceof Error ? reason.message : "Session restore failed.");
      setStatus("login");
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      receivedEvent = true;
      queueMicrotask(() => { if (active) void verify(session?.user ?? null); });
    });
    return () => { active = false; version++; data.subscription.unsubscribe(); };
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await getSupabase().auth.signInWithPassword({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      if (authError) setError(authError.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    if (supabaseConfig.configured) await getSupabase().auth.signOut();
    setStatus("login");
  };

  if (status === "loading") {
    return (
      <main className="auth-screen">
        <LoadingState />
      </main>
    );
  }

  if (status === "login") {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <div className="brand-mark">
            <LockKeyhole size={20} />
          </div>
          <p className="eyebrow">PRIVATE SYSTEM</p>
          <h1>NCEA Admin</h1>
          <p>Sign in with an account assigned the owner, admin or moderator role.</p>
          {error && <ErrorState message={error} />}
          <form onSubmit={login}>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <Button type="submit" disabled={busy || !supabaseConfig.configured}>
              <LogIn size={17} /> {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </section>
      </main>
    );
  }

  if (status === "denied") {
    return (
      <main className="auth-screen">
        <section className="auth-card denied-card">
          <div className="brand-mark">
            <ShieldX size={20} />
          </div>
          <p className="eyebrow">ACCESS DENIED</p>
          <h1>Staff role required</h1>
          <p>{error || `${user?.email ?? "This account"} does not have access to NCEA Admin.`}</p>
          <Button onClick={logout}>End session</Button>
        </section>
      </main>
    );
  }

  return (
    <AdminAccessContext.Provider value={{ role: role as StaffRole }}>
      {children}
    </AdminAccessContext.Provider>
  );
}
