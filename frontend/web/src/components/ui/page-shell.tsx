import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * Max-width container for page content.
 * Replaces the former `.page-shell` + `.page-stack` + `.app-shell` CSS classes.
 */
export function PageShell({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-[min(1180px,calc(100%-24px))] pt-6 pb-[72px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
