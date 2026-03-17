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
    <div className="search-bar-wrap" role="search">
      <div className="search-bar-inner">
        <span className="search-bar-sparkle" aria-hidden="true">✦</span>
        <input
          ref={inputRef}
          type="text"
          className="search-bar-input"
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
            className="search-bar-clear"
            onClick={onClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          className="search-bar-submit button button-primary"
          onClick={onSubmit}
          aria-label="Search"
        >
          Search
        </button>
      </div>
    </div>
  );
}
