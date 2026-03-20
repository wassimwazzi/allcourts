import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  titleId?: string;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, titleId, className }: SectionHeaderProps) {
  return (
    <header className={cn("mb-3.5 max-w-[760px]", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={titleId} className="mt-0 mb-0 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
        {title}
      </h2>
      <p className="mt-2 text-slate-300 leading-relaxed">{description}</p>
    </header>
  );
}
