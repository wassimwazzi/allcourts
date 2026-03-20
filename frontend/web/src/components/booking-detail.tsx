"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { BookingDetail, BookingParticipant } from "@allcourts/types";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { cancelBooking, isCancellable, acceptInvitation, declineInvitation } from "@/lib/bookings";
import { InvitePlayersModal } from "@/components/invite-players-modal";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400",
  awaiting_payment: "bg-amber-500/15 text-amber-400",
  pending: "bg-slate-500/15 text-slate-400",
  checked_in: "bg-brand-blue/15 text-brand-blue",
  completed: "bg-slate-600/15 text-slate-400",
  cancelled: "bg-red-500/15 text-red-400",
  refunded: "bg-purple-500/15 text-purple-400",
  no_show: "bg-red-500/15 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  awaiting_payment: "Awaiting payment",
  pending: "Pending",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  no_show: "No show",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

type Props = {
  booking: BookingDetail;
  currentUserId: string;
};

type DetailRow = [label: string, value: ReactNode];

export function BookingDetailView({ booking, currentUserId }: Props) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isOwner = booking.ownerProfileId === currentUserId;
  const canInvite = isOwner && isCancellable(booking.status);
  const canCancel = isOwner && isCancellable(booking.status);
  const detailRows: DetailRow[] = [
    ["Reference", <span key="ref" className="font-mono text-brand-accent">{booking.bookingReference}</span>],
    ["Date", formatDate(booking.bookingDate)],
    ["Time", `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`],
    ...(booking.bookedForName ? [["Booked for", booking.bookedForName] satisfies DetailRow] : []),
    ...(booking.notes ? [["Notes", booking.notes] satisfies DetailRow] : []),
  ];
  const paymentRows: Array<[label: string, value: string]> = [
    ["Subtotal", formatCents(booking.subtotalCents, booking.currency)],
    ...(booking.discountCents > 0
      ? [["Discount", `–${formatCents(booking.discountCents, booking.currency)}`] as [string, string]]
      : []),
    ...(booking.taxCents > 0
      ? [["Tax", formatCents(booking.taxCents, booking.currency)] as [string, string]]
      : []),
  ];

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    setCancelError(null);
    const client = getSupabaseBrowserClient();
    if (!client) { setCancelError("Service unavailable."); setCancelling(false); return; }
    const { ok, error } = await cancelBooking(client, booking.id);
    setCancelling(false);
    if (!ok) { setCancelError(error ?? "Failed to cancel."); return; }
    router.refresh();
  }

  const myPendingInvite = booking.participants.find(
    (p) => p.inviteeProfileId === currentUserId && p.status === "pending"
  );

  async function handleAccept(participantId: string) {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    await acceptInvitation(client, participantId);
    router.refresh();
  }

  async function handleDecline(participantId: string) {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    await declineInvitation(client, participantId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Invitation banner for invitees */}
      {myPendingInvite && (
        <div className="rounded-xl border border-brand-accent/30 bg-brand-accent/10 p-4">
          <p className="text-sm font-medium text-white">
            You&apos;ve been invited to this booking
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {booking.facilityName} · {booking.courtName} · {formatDate(booking.bookingDate)}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleAccept(myPendingInvite.id)}
              className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90"
            >
              Accept
            </button>
            <button
              onClick={() => handleDecline(myPendingInvite.id)}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">
            {booking.facilityName} · {booking.courtName}
          </h1>
          {booking.facilityCity && (
            <p className="mt-0.5 text-sm text-slate-400">{booking.facilityCity}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            STATUS_STYLES[booking.status] ?? "bg-slate-500/15 text-slate-400"
          }`}
        >
          {STATUS_LABELS[booking.status] ?? booking.status}
        </span>
      </div>

      {/* Details card */}
      <div className="rounded-xl border border-slate-700/30 bg-white/[0.03] overflow-hidden">
        {detailRows.map(([label, value], i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 border-b border-slate-700/15 px-4 py-3 text-sm last:border-b-0"
            >
              <span className="text-slate-400">{label}</span>
              <span className="text-right text-white">{value}</span>
            </div>
          ))}
      </div>

      {/* Price breakdown */}
      <div className="rounded-xl border border-slate-700/30 bg-white/[0.03] overflow-hidden">
        <div className="border-b border-slate-700/15 px-4 py-3 text-sm font-medium text-slate-300">
          Payment
        </div>
        {paymentRows.map(([label, value], i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 border-b border-slate-700/10 px-4 py-3 text-sm last:border-b-0"
            >
              <span className="text-slate-400">{label}</span>
              <span className="text-white">{value}</span>
            </div>
          ))}
        <div className="flex items-center justify-between gap-3 border-t border-slate-700/25 px-4 py-3">
          <span className="font-semibold text-slate-300">Total</span>
          <strong className="text-brand-accent">
            {formatCents(booking.totalCents, booking.currency)}
          </strong>
        </div>
      </div>

      {/* Participants */}
      <div className="rounded-xl border border-slate-700/30 bg-white/[0.03] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700/15 px-4 py-3">
          <span className="text-sm font-medium text-slate-300">Players</span>
          {canInvite && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-xs text-brand-accent hover:underline"
            >
              + Invite
            </button>
          )}
        </div>
        {booking.participants.length === 0 ? (
          <div className="px-4 py-5 text-center text-sm text-slate-500">
            No players invited yet
            {canInvite && (
              <>
                {" · "}
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="text-brand-accent hover:underline"
                >
                  Invite someone
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-700/15">
            {booking.participants.map((p) => (
              <ParticipantRow key={p.id} participant={p} />
            ))}
          </div>
        )}
      </div>

      {/* Cancel */}
      {canCancel && (
        <div className="pt-2">
          {cancelError && (
            <p className="mb-2 text-sm text-red-400">{cancelError}</p>
          )}
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            {cancelling ? "Cancelling…" : "Cancel booking"}
          </button>
        </div>
      )}

      {showInviteModal && (
        <InvitePlayersModal
          bookingId={booking.id}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => router.refresh()}
        />
      )}
    </div>
  );
}

function ParticipantRow({ participant }: { participant: BookingParticipant }) {
  const statusColor =
    participant.status === "accepted"
      ? "text-emerald-400"
      : participant.status === "declined"
      ? "text-red-400"
      : "text-slate-400";

  const initials = participant.inviteeEmail[0].toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-700/60 text-xs font-bold text-slate-300">
        {initials}
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-white">{participant.inviteeEmail}</p>
        <p className="text-xs text-slate-500 capitalize">{participant.role}</p>
      </div>
      <span className={`text-xs capitalize ${statusColor}`}>{participant.status}</span>
    </div>
  );
}
