import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { AppRole, Profile } from "@/features/community/types";

type AuthState = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  isStaff: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const sessionRef = useRef<Session | null>(null);

  const hydrate = useCallback(async (nextSession: Session | null) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
    if (!nextSession) {
      setProfile(null);
      setRole(null);
      setReady(true);
      return;
    }
    const supabase = getSupabaseClient();
    const [{ data: nextProfile }, { data: nextRole }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", nextSession.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", nextSession.user.id).maybeSingle(),
    ]);
    if (sessionRef.current?.user.id === nextSession.user.id) {
      setProfile((nextProfile as Profile | null) ?? null);
      setRole((nextRole?.role as AppRole | undefined) ?? "user");
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const supabase = getSupabaseClient();
    void supabase.auth.getSession().then(({ data }) => hydrate(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      queueMicrotask(() => void hydrate(nextSession));
    });
    return () => data.subscription.unsubscribe();
  }, [hydrate]);

  const refreshProfile = useCallback(async () => hydrate(sessionRef.current), [hydrate]);
  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) await getSupabaseClient().auth.signOut();
    await hydrate(null);
  }, [hydrate]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      profile,
      role,
      isStaff: role === "moderator" || role === "admin",
      isAdmin: role === "admin",
      refreshProfile,
      logout,
    }),
    [ready, session, profile, role, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
