import { StyleSheet, Text, View } from "react-native";

import { AppShell } from "@/components/AppShell";
import { AccentButton, LabelValue, SectionCard } from "@/components/Ui";
import { reservations } from "@/data/mock";

export default function ReservationsScreen() {
  return (
    <AppShell
      eyebrow="Reservations"
      title="Keep every upcoming session organized and reassuring."
      subtitle="Upcoming bookings, teammate signals, and quick next actions stay available without extra taps."
    >
      {reservations.upcoming.map((reservation) => (
        <SectionCard key={reservation.id} tone="accent" title={reservation.venue} subtitle={`${reservation.date} • ${reservation.time}`}>
          <LabelValue label="Status" value={reservation.status} />
          <LabelValue label="Confidence" value={reservation.confidence} />
          <LabelValue label="Teammates" value={reservation.teammate} />
          <AccentButton label="Keep reservation details handy" detail="Notifications and check-in can plug in here later" quiet />
        </SectionCard>
      ))}

      <SectionCard title="Past play" subtitle="Easy rebooking matters for repeat use.">
        {reservations.past.map((reservation) => (
          <View key={reservation.id} style={styles.pastRow}>
            <View style={styles.pastCopy}>
              <Text style={styles.pastVenue}>{reservation.venue}</Text>
              <Text style={styles.pastMeta}>{reservation.date} • {reservation.time}</Text>
            </View>
            <Text style={styles.pastStatus}>{reservation.confidence}</Text>
          </View>
        ))}
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  pastRow: {
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#223149"
  },
  pastCopy: {
    gap: 4
  },
  pastVenue: {
    color: "#f8fbff",
    fontSize: 16,
    fontWeight: "800"
  },
  pastMeta: {
    color: "#90a5bf",
    fontSize: 13
  },
  pastStatus: {
    color: "#d3dfed",
    fontSize: 13,
    lineHeight: 18
  }
});
