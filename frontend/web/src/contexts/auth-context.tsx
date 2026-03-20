"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type { UserProfile } from "@allcourts/types";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

type AuthState = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signOut: () => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialUser?: User | null;
  initialProfile?: UserProfile | null;
};

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: initialUser,
    session: null,
    profile: initialProfile,
    loading: false,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) return null;

    const { data } = await client
      .from("profiles")
      .select("id, email, full_name, phone, avatar_url, timezone, role, onboarding_status")
      .eq("id", userId)
      .single();

    if (!data) return null;

    return {
      id: data.id,
      email: normalizeOptionalString(data.email),
      fullName: normalizeOptionalString(data.full_name),
      phone: normalizeOptionalString(data.phone),
      avatarUrl: normalizeOptionalString(data.avatar_url),
      timezone: data.timezone,
      role: data.role,
      onboardingStatus: data.onboarding_status,
    } satisfies UserProfile;
  }, []);

  const refreshProfile = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const profile = await fetchProfile(user.id);
    setState((s) => ({ ...s, profile }));
  }, [fetchProfile]);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    // Seed initial session
    client.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      const user = session?.user ?? null;
      setState((current) => ({
        user,
        session,
        profile: user && !user.is_anonymous ? current.profile : null,
        loading: false,
      }));
    });

    // Do not perform async Supabase calls inside this callback.
    // Supabase documents a deadlock bug where async work here can cause later auth calls
    // like signOut() to hang indefinitely.
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        const user = session?.user ?? null;
        setState((current) => ({
          user,
          session,
          profile: user && !user.is_anonymous ? current.profile : null,
          loading: false,
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!state.user || state.user.is_anonymous) {
      if (state.profile !== null) {
        setState((current) => ({ ...current, profile: null }));
      }
      return;
    }

    let cancelled = false;

    fetchProfile(state.user.id).then((profile) => {
      if (cancelled) return;
      setState((current) => {
        if (current.user?.id !== state.user?.id) return current;
        return { ...current, profile };
      });
    });

    return () => {
      cancelled = true;
    };
  }, [fetchProfile, state.user, state.profile]);

  const signOut = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return { error: "Service unavailable." };
    }

    const timeout = new Promise<{ error: { message: string } }>((resolve) => {
      window.setTimeout(() => {
        resolve({ error: { message: "Sign out timed out." } });
      }, 3000);
    });

    const { error } = await Promise.race([client.auth.signOut(), timeout]);
    if (error) {
      return { error: error.message };
    }

    setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
    });

    return {};
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
