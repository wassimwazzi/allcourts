"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@allcourts/types";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/auth-context";

type Props = {
  profile: UserProfile;
};

export function ProfileForm({ profile }: Props) {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [timezone, setTimezone] = useState(profile.timezone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const client = getSupabaseBrowserClient();
    if (!client) { setError("Service unavailable."); setSaving(false); return; }

    const { error: updateError } = await client
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        timezone,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) { setError(updateError.message); return; }

    await refreshProfile();
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Email (read-only) */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
        <input
          type="email"
          value={profile.email ?? ""}
          readOnly
          className="w-full cursor-not-allowed rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-400"
        />
        <p className="mt-1 text-xs text-slate-600">Email cannot be changed here.</p>
      </div>

      {/* Full name */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* Timezone */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-brand-accent focus:outline-none"
        >
          {Intl.supportedValuesOf("timeZone").map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-emerald-400">Profile saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-1 w-full rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
