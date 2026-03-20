import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { getBookingDetail } from "@/lib/bookings";
import { BookingDetailView } from "@/components/booking-detail";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Booking Details" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getServerUser();
  if (!user || user.is_anonymous) redirect(`/auth/login?next=/bookings/${id}`);

  const supabase = await createSupabaseServerClient();
  const booking = await getBookingDetail(supabase, id);
  if (!booking) notFound();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/bookings"
            className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            ← My Bookings
          </Link>
          <BookingDetailView booking={booking} currentUserId={user.id} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
