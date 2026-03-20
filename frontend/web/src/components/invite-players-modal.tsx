"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type Props = {
  bookingId: string;
  onClose: () => void;
  onInvited: () => void;
};

type Role = "player" | "spectator";

export function InvitePlayersModal({ bookingId, onClose, onInvited }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("player");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    const client = getSupabaseBrowserClient();
    if (!client) {
      setError("Service unavailable.");
      setLoading(false);
      return;
    }

    const { data: { session } } = await client.auth.getSession();
    if (!session?.access_token) {
      setError("You must be signed in to invite players.");
      setLoading(false);
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/invite-participant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bookingId, inviteeEmail: trimmed, role }),
      }
    );

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error?.message ?? body.message ?? "Failed to send invitation.");
      return;
    }

    setSuccess(`Invitation sent to ${trimmed}`);
    setEmail("");
    onInvited();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-t-2xl bg-slate-900 p-6 shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Invite a Player</h2>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-accent focus:outline-none"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Role</label>
            <div className="flex gap-2">
              {(["player", "spectator"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                    role === r
                      ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
            >
              Done
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
