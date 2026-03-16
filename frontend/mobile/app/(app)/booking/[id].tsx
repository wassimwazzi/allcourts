import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppShell } from "@/components/AppShell";
import { AccentButton, LabelValue, SectionCard } from "@/components/Ui";
import { venues } from "@/data/mock";

export default function BookingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const selectedId = Array.isArray(params.id) ? params.id[0] : params.id;
  const venue = useMemo(() => venues.find((entry) => entry.id === selectedId) ?? venues[0], [selectedId]);

  return (
    <AppShell
      eyebrow="Reservation details"
      title={venue.name}
      subtitle="Booking shell focused on the information players need before they commit."
    >
      <SectionCard tone="accent">
        <Text style={styles.slotLabel}>Best next slot</Text>
        <Text style={styles.slotValue}>{venue.nextSlot}</Text>
        <Text style={styles.slotCopy}>{venue.confidence}</Text>
        <View style={styles.buttonRow}>
          <AccentButton label="Hold this slot" detail={`${venue.rate}/hour • instant confirmation`} />
          <AccentButton label="Back to discovery" detail="Compare other venues" quiet onPress={() => router.push("/discovery")} />
        </View>
      </SectionCard>

      <SectionCard title="What you'll know before checkout" subtitle="Clarity that reduces drop-off on mobile.">
        <LabelValue label="Address" value={venue.address} />
        <LabelValue label="Check-in" value={venue.checkIn} />
        <LabelValue label="Surface" value={venue.surface} />
        <LabelValue label="Format" value={venue.players} />
      </SectionCard>

      <SectionCard title="Included confidence signals">
        <View style={styles.tagsRow}>
          {venue.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.confidenceCopy}>{venue.trustNote}</Text>
      </SectionCard>

      <SectionCard title="Booking notes" subtitle="Space for future payment, teammate invites, and host messaging.">
        <LabelValue label="Estimated total" value={`${venue.rate} + taxes`} />
        <LabelValue label="Cancellation" value="Visible before pay" />
        <LabelValue label="Confirmation" value="Reservation + entry instructions" />
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  slotLabel: {
    color: "#b7d5ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  slotValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30
  },
  slotCopy: {
    color: "#d8eaff",
    fontSize: 15,
    lineHeight: 22
  },
  buttonRow: {
    gap: 10
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#0d1728"
  },
  tagText: {
    color: "#dbe7f5",
    fontSize: 12,
    fontWeight: "700"
  },
  confidenceCopy: {
    color: "#c7d7e8",
    fontSize: 14,
    lineHeight: 20
  }
});
