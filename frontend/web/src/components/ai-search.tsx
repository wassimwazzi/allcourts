"use client";

import { useRef } from "react";

type AISearchProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export function AISearch({ value, onChange, onSubmit, onClear }: AISearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div role="search">
      <div className="flex items-center gap-2.5 rounded-2xl border border-slate-600/30 bg-white/[0.04] px-4 py-1.5 transition focus-within:border-brand-accent/45 focus-within:shadow-[0_0_0_3px_rgb(var(--brand-accent)/0.08)]">
        <span className="shrink-0 text-base text-brand-accent opacity-80 select-none" aria-hidden="true">
          ✦
        </span>
        <input
          ref={inputRef}
          type="text"
          className="min-w-0 flex-1 border-none bg-transparent py-2.5 text-base text-white outline-none placeholder:text-slate-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
            if (e.key === "Escape") onClear();
          }}
          placeholder="Try: 'tennis near downtown' or 'cheap padel this weekend'"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search courts"
        />
        {value && (
          <button
            type="button"
            className="shrink-0 rounded px-2 py-1.5 text-sm text-slate-400 transition hover:text-white"
            onClick={onClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          className="shrink-0 inline-flex min-h-[42px] items-center justify-center rounded-full bg-gradient-to-br from-brand-accent to-brand-blue px-5 text-sm font-bold text-slate-900 transition hover:-translate-y-px hover:shadow-md active:translate-y-0"
          onClick={onSubmit}
          aria-label="Search"
        >
          Search
        </button>
      </div>
    </div>
  );
}
