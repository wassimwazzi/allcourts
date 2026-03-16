import { StyleSheet, Text, View } from "react-native";

import { AppShell } from "@/components/AppShell";
import { AccentButton, LabelValue, SectionCard } from "@/components/Ui";
import { profileHighlights } from "@/data/mock";

export default function ProfileScreen() {
  return (
    <AppShell
      eyebrow="Profile shell"
      title="Auth-ready account space for repeat booking confidence."
      subtitle="This screen is intentionally lightweight today, but ready for identity, preferences, and community alerts later."
    >
      <SectionCard tone="accent" title="Guest mode is supported" subtitle="Players can explore first, then sign in when it helps them book faster.">
        <LabelValue label="Saved favorites" value="Ready for later" />
        <LabelValue label="Payment methods" value="Reserved for authenticated flow" />
        <LabelValue label="Notifications" value="Booking reminders and community updates" />
        <AccentButton label="Continue as guest" detail="Account hooks can attach here later" quiet />
      </SectionCard>

      <SectionCard title="Foundation decisions">
        {profileHighlights.map((item) => (
          <View key={item.label} style={styles.itemRow}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemValue}>{item.value}</Text>
          </View>
        ))}
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    gap: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#223149"
  },
  itemLabel: {
    color: "#f8fbff",
    fontSize: 16,
    fontWeight: "800"
  },
  itemValue: {
    color: "#a9b9cd",
    fontSize: 14,
    lineHeight: 20
  }
});
