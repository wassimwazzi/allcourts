"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useState } from "react";

export function AuthNav() {
  const { user, profile, signOut, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  if (loading) {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-700/50" />;
  }

  if (!user || user.is_anonymous) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="text-sm text-slate-300 hover:text-white"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const displayName = profile?.fullName?.trim() || user.email?.trim() || "Account";
  const initials = (() => {
    if (profile?.fullName?.trim()) {
      const letters = profile.fullName
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

      if (letters) return letters;
    }

    return (user.email?.trim()?.[0] ?? "A").toUpperCase();
  })();

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);

    const result = await signOut();
    if (result.error) {
      setSignOutError(result.error);
      setSigningOut(false);
      window.location.assign("/");
      return;
    }

    window.location.assign("/");
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {signOutError ? (
        <span className="hidden text-xs text-red-400 md:block">{signOutError}</span>
      ) : null}
      <div
        className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-sm text-white"
        aria-label="Signed in user"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-accent/20 text-xs font-bold text-brand-accent">
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate sm:block">
          {displayName}
        </span>
      </div>
      <Link
        href="/bookings"
        className="hidden text-sm text-slate-300 hover:text-white sm:block"
      >
        My Bookings
      </Link>
      <Link
        href="/profile"
        className="hidden text-sm text-slate-300 hover:text-white md:block"
      >
        Profile
      </Link>
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-600 hover:text-white"
      >
        {signingOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
