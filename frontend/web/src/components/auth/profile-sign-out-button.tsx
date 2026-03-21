"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export function ProfileSignOutButton() {
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);

    const result = await signOut();
    if (result.error) {
      setError(result.error);
      setSigningOut(false);
      return;
    }

    window.location.assign("/");
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-100 transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
      >
        {signingOut ? "Signing out..." : "Sign out"}
      </button>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
