import type { BookingSummary } from "@allcourts/types";
import Link from "next/link";

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
    weekday: "short",
    month: "short",
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
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

type Props = {
  booking: BookingSummary;
};

export function BookingListCard({ booking }: Props) {
  const statusStyle = STATUS_STYLES[booking.status] ?? "bg-slate-500/15 text-slate-400";
  const statusLabel = STATUS_LABELS[booking.status] ?? booking.status;

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="group block rounded-xl border border-slate-700/30 bg-white/[0.03] p-4 transition hover:border-slate-600/50 hover:bg-white/[0.05]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">
            {booking.facilityName} · {booking.courtName}
          </p>
          {booking.facilityCity && (
            <p className="mt-0.5 text-xs text-slate-500">{booking.facilityCity}</p>
          )}
          <p className="mt-2 text-sm text-slate-300">
            {formatDate(booking.bookingDate)}
          </p>
          <p className="text-sm text-slate-400">
            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle}`}>
            {statusLabel}
          </span>
          <span className="text-sm font-semibold text-white">
            {formatCents(booking.totalCents, booking.currency)}
          </span>
          <span className="font-mono text-xs text-slate-500">{booking.bookingReference}</span>
        </div>
      </div>
    </Link>
  );
}
