import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { getUserBookings } from "@/lib/bookings";
import { BookingListCard } from "@/components/booking-list-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "My Bookings" };

export default async function BookingsPage() {
  const user = await getServerUser();
  if (!user || user.is_anonymous) redirect("/auth/login?next=/bookings");

  const supabase = await createSupabaseServerClient();
  const [upcoming, past] = await Promise.all([
    getUserBookings(supabase, "upcoming"),
    getUserBookings(supabase, "past"),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-2xl font-bold text-white">My Bookings</h1>

          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <EmptyState
                message="No upcoming bookings"
                cta="Find a court"
                href="/discover"
              />
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((b) => (
                  <BookingListCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Past
            </h2>
            {past.length === 0 ? (
              <EmptyState message="No past bookings yet" />
            ) : (
              <div className="flex flex-col gap-3">
                {past.map((b) => (
                  <BookingListCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function EmptyState({
  message,
  cta,
  href,
}: {
  message: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700/30 bg-white/[0.02] py-10 text-center">
      <p className="text-sm text-slate-500">{message}</p>
      {cta && href && (
        <a
          href={href}
          className="mt-3 inline-block text-sm text-brand-accent hover:underline"
        >
          {cta} →
        </a>
      )}
    </div>
  );
}
