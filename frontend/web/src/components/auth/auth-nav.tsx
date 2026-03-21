"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type AuthNavProps = {
  layout?: "inline" | "stacked";
  className?: string;
};

export function AuthNav({ layout = "inline", className }: AuthNavProps) {
  const { user, profile, loading } = useAuth();
  const isStacked = layout === "stacked";

  if (loading) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-2xl border border-white/10 bg-white/5",
          isStacked ? "h-28 w-full" : "h-11 w-44",
          className
        )}
      />
    );
  }

  if (!user || user.is_anonymous) {
    return (
      <div
        className={cn(
          "flex",
          isStacked ? "flex-col gap-3" : "items-center gap-2",
          className
        )}
      >
        <Link
          href="/auth/login"
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent",
            isStacked
              ? "border border-white/10 bg-white/[0.04] px-4 text-slate-100 hover:border-brand-accent/40 hover:bg-white/[0.08]"
              : "border border-white/10 bg-white/[0.03] px-4 text-slate-100 hover:border-brand-accent/40 hover:bg-white/[0.08]"
          )}
        >
          Sign in
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

  return (
    <div className={className}>
      <Link
        href="/profile"
        className={cn(
          "inline-flex items-center gap-3 rounded-full border text-sm text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent",
          isStacked
            ? "min-h-11 w-full border-white/10 bg-white/[0.04] px-4 py-3 hover:border-brand-blue/40 hover:bg-white/[0.08]"
            : "border-slate-700/60 bg-slate-800/60 px-3 py-1.5 hover:border-slate-500 hover:bg-slate-800/80"
        )}
        aria-label="Open profile"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full bg-brand-accent/20 text-xs font-bold text-brand-accent",
            isStacked ? "h-9 w-9" : "h-6 w-6"
          )}
        >
          {initials}
        </span>
        <span className={cn("max-w-[180px] truncate", !isStacked && "hidden sm:block")}>
          {displayName}
        </span>
      </Link>
    </div>
  );
}
