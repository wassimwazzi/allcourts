import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Extra padding preset. Defaults to "md". */
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

/**
 * Glassmorphism card surface — the AllCourts panel primitive.
 * Replaces the former `.surface` custom CSS class.
 */
export function Surface({ padding = "md", className, children, ...props }: SurfaceProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-700/20",
        "bg-gradient-to-b from-slate-900/92 to-slate-950/92 shadow-2xl",
        "before:absolute before:inset-0 before:pointer-events-none",
        "before:bg-gradient-to-br before:from-white/[0.06] before:to-transparent",
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
