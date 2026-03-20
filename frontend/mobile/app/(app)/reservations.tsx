import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { User } from "@supabase/supabase-js";

import { AppShell } from "@/components/AppShell";
import { AccentButton, LabelValue, SectionCard } from "@/components/Ui";
import { reservations as mockReservations } from "@/data/mock";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  booking_reference: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_cents: number;
  currency: string;
  courts: { name: string; facilities: { name: string } | null } | null;
};

type RawBooking = {
  id: string;
  booking_reference: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_cents: number;
  currency: string;
  courts: Array<{
    name: string;
    facilities: Array<{ name: string }> | null;
  }> | null;
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const d = new Date(); d.setHours(h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export default function ReservationsScreen() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user?.is_anonymous ? null : (data.user ?? null);
      setUser(u);
      if (u) fetchBookings();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user?.is_anonymous ? null : (session?.user ?? null);
      setUser(u);
      if (u) fetchBookings();
      else setBookings([]);
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchBookings() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("bookings")
      .select("id, booking_reference, booking_date, start_time, end_time, status, total_cents, currency, courts(name, facilities(name))")
      .gte("booking_date", today)
      .in("status", ["pending", "awaiting_payment", "confirmed", "checked_in"])
      .order("booking_date")
      .order("start_time")
      .limit(20);
    const normalized = ((data ?? []) as unknown as RawBooking[]).map((booking) => ({
      ...booking,
      courts: booking.courts?.[0]
        ? {
            name: booking.courts[0].name,
            facilities: booking.courts[0].facilities?.[0]
              ? { name: booking.courts[0].facilities[0].name }
              : null,
          }
        : null,
    }));
    setBookings(normalized);
    setLoading(false);
  }

  // Not yet loaded
  if (user === undefined) {
    return (
      <AppShell eyebrow="Reservations" title="Your bookings" subtitle="">
        <ActivityIndicator color="#34d399" style={{ marginTop: 32 }} />
      </AppShell>
    );
  }

  // Signed in — show real bookings
  if (user) {
    return (
      <AppShell
        eyebrow="Reservations"
        title="Upcoming bookings"
        subtitle="Your confirmed and pending sessions."
      >
        {loading && <ActivityIndicator color="#34d399" style={{ marginTop: 16 }} />}
        {!loading && bookings.length === 0 && (
          <SectionCard title="No upcoming bookings">
            <Text style={styles.emptyText}>Book a court to see it here.</Text>
          </SectionCard>
        )}
        {bookings.map((b) => (
          <SectionCard
            key={b.id}
            tone="accent"
            title={b.courts?.facilities?.name ?? "Court"}
            subtitle={`${formatDate(b.booking_date)} • ${formatTime(b.start_time)} – ${formatTime(b.end_time)}`}
          >
            <LabelValue label="Court" value={b.courts?.name ?? "—"} />
            <LabelValue label="Status" value={b.status.replace(/_/g, " ")} />
            <LabelValue label="Total" value={formatAmount(b.total_cents, b.currency)} />
            <View style={styles.refRow}>
              <Text style={styles.refLabel}>Ref</Text>
              <Text style={styles.refValue}>{b.booking_reference}</Text>
            </View>
            <AccentButton label="View details" detail="" quiet />
          </SectionCard>
        ))}
      </AppShell>
    );
  }

  // Guest — show mock data with sign-in prompt
  return (
    <AppShell
      eyebrow="Reservations"
      title="Keep every upcoming session organized."
      subtitle="Sign in to see your real bookings here."
    >
      <SectionCard tone="accent" title="Sign in to see your bookings" subtitle="Your confirmed reservations will appear here.">
        <Pressable
          style={styles.signInBtn}
          onPress={() => {
            // Profile tab has the auth form
          }}
        >
          <Text style={styles.signInText}>Go to Profile → Sign in</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Preview (demo data)">
        {mockReservations.upcoming.map((r) => (
          <View key={r.id} style={styles.mockRow}>
            <Text style={styles.mockVenue}>{r.venue}</Text>
            <Text style={styles.mockMeta}>{r.date} • {r.time}</Text>
          </View>
        ))}
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  emptyText: { color: "#a9b9cd", fontSize: 14, textAlign: "center", paddingVertical: 12 },
  refRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  refLabel: { color: "#a9b9cd", fontSize: 13 },
  refValue: { color: "#34d399", fontSize: 13, fontFamily: "monospace" },
  signInBtn: { backgroundColor: "#34d399", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 8 },
  signInText: { color: "#081120", fontWeight: "700", fontSize: 14 },
  mockRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#223149" },
  mockVenue: { color: "#f8fbff", fontSize: 15, fontWeight: "700" },
  mockMeta: { color: "#a9b9cd", fontSize: 13, marginTop: 3 },
});
