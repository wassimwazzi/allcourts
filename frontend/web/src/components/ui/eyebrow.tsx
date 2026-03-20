import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * Small all-caps kicker label above a section heading.
 * Replaces the former `.eyebrow` / `.panel-kicker` / `.section-badge` CSS classes.
 */
export function Eyebrow({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "m-0 mb-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-accent",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
