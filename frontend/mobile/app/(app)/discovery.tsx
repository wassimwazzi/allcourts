import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppShell } from "@/components/AppShell";
import { AccentButton, SectionCard, StatPill } from "@/components/Ui";
import { VenueCard } from "@/components/VenueCard";
import { discoveryMetrics, reservations, venues } from "@/data/mock";

const trustSignals = ["Verified hosts", "Clear cancellation", "Fast check-in"];

export default function DiscoveryScreen() {
  const router = useRouter();
  const featuredReservation = reservations.upcoming[0];

  return (
    <AppShell
      eyebrow="Booking-first foundation"
      title="Find the right court fast, with the details that build trust."
      subtitle="Discovery leads with tonight's availability, straight-line pricing, and confidence signals before checkout."
    >
      <SectionCard tone="accent">
        <Text style={styles.heroLabel}>Tonight's best match</Text>
        <Text style={styles.heroTitle}>{venues[0].name}</Text>
        <Text style={styles.heroCopy}>
          {venues[0].nextSlot} • {venues[0].confidence}
        </Text>
        <View style={styles.heroActions}>
          <AccentButton
            label="Review booking"
            detail={venues[0].availability}
            onPress={() => router.push({ pathname: "/booking/[id]", params: { id: venues[0].id } })}
          />
          <AccentButton label="See reservations" detail="Keep upcoming play in view" quiet onPress={() => router.push("/reservations")} />
        </View>
      </SectionCard>

      <View style={styles.metricsRow}>
        {discoveryMetrics.map((metric) => (
          <StatPill key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </View>

      <SectionCard title="Why players feel confident" subtitle="Simple signals that reduce booking hesitation on mobile.">
        <View style={styles.signalRow}>
          {trustSignals.map((signal) => (
            <View key={signal} style={styles.signalPill}>
              <Text style={styles.signalText}>{signal}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Continue where you left off" subtitle={featuredReservation.time}>
        <Text style={styles.resumeVenue}>{featuredReservation.venue}</Text>
        <Text style={styles.resumeMeta}>
          {featuredReservation.date} • {featuredReservation.confidence}
        </Text>
        <AccentButton label="Open reservation" detail={featuredReservation.status} onPress={() => router.push("/reservations")} quiet />
      </SectionCard>

      <View style={styles.venueList}>
        {venues.map((venue) => (
          <VenueCard key={venue.id} {...venue} onPress={(id) => router.push({ pathname: "/booking/[id]", params: { id } })} />
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroLabel: {
    color: "#b7d5ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800"
  },
  heroCopy: {
    color: "#d8eaff",
    fontSize: 15,
    lineHeight: 22
  },
  heroActions: {
    gap: 10
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10
  },
  signalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  signalPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#0d1728"
  },
  signalText: {
    color: "#e0ebf8",
    fontSize: 13,
    fontWeight: "700"
  },
  resumeVenue: {
    color: "#f8fbff",
    fontSize: 20,
    fontWeight: "800"
  },
  resumeMeta: {
    color: "#adc1d8",
    fontSize: 14,
    lineHeight: 20
  },
  venueList: {
    gap: 14
  }
});
