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
import type {
  ActivityStreak,
  AppRole,
  Profile,
  StreakRenewalResult,
} from "@/features/community/types";

type AuthState = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  streak: ActivityStreak | null;
  isStaff: boolean;
  isAdmin: boolean;
  renewStreak: () => Promise<StreakRenewalResult>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [streak, setStreak] = useState<ActivityStreak | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const hydrateVersion = useRef(0);

  const hydrate = useCallback(async (nextSession: Session | null) => {
    const currentVersion = ++hydrateVersion.current;
    const previousUserId = sessionRef.current?.user.id;
    sessionRef.current = nextSession;
    setSession(nextSession);
    if (!nextSession) {
      setProfile(null);
      setRole(null);
      setStreak(null);
      setReady(true);
      return;
    }
    if (previousUserId !== nextSession.user.id) {
      setReady(false);
      setProfile(null);
      setRole(null);
      setStreak(null);
    }
    const [{ getSupabaseClient }, { getStrikeModeStatus }] = await Promise.all([
      import("@/lib/supabase"),
      import("@/features/streak/api"),
    ]);
    const supabase = getSupabaseClient();
    const [{ data: nextProfile }, { data: nextRole }, nextStreak] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", nextSession.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", nextSession.user.id).maybeSingle(),
      getStrikeModeStatus().catch(() => null),
    ]);
    if (hydrateVersion.current === currentVersion) {
      setProfile((nextProfile as Profile | null) ?? null);
      setRole((nextRole?.role as AppRole | undefined) ?? "user");
      setStreak(nextStreak);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    let receivedEvent = false;
    void import("@/lib/supabase")
      .then(({ getSupabaseClient, isSupabaseConfigured }) => {
        if (!active) return;
        if (!isSupabaseConfigured()) {
          setReady(true);
          return;
        }
        const supabase = getSupabaseClient();
        void supabase.auth
          .getSession()
          .then(({ data }) => {
            if (active && !receivedEvent) return hydrate(data.session);
          })
          .catch(() => {
            if (active && !receivedEvent) setReady(true);
          });
        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          receivedEvent = true;
          queueMicrotask(() => active && void hydrate(nextSession));
        });
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [hydrate]);

  const refreshProfile = useCallback(async () => hydrate(sessionRef.current), [hydrate]);
  const renewStreak = useCallback(async () => {
    const { renewStrikeMode } = await import("@/features/streak/api");
    const nextStreak = await renewStrikeMode();
    setStreak(nextStreak);
    return nextStreak;
  }, []);
  const logout = useCallback(async () => {
    const { getSupabaseClient, isSupabaseConfigured } = await import("@/lib/supabase");
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
      streak,
      isStaff: role === "moderator" || role === "admin" || role === "owner",
      isAdmin: role === "admin" || role === "owner",
      renewStreak,
      refreshProfile,
      logout,
    }),
    [ready, session, profile, role, streak, renewStreak, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
