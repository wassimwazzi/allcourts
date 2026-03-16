import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  tone?: "default" | "accent";
};

export function SectionCard({ title, subtitle, children, tone = "default" }: SectionCardProps) {
  return (
    <View style={[styles.sectionCard, tone === "accent" && styles.sectionCardAccent]}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

type StatPillProps = {
  label: string;
  value: string;
};

export function StatPill({ label, value }: StatPillProps) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type AccentButtonProps = {
  label: string;
  detail?: string;
  onPress?: () => void;
  quiet?: boolean;
};

export function AccentButton({ label, detail, onPress, quiet = false }: AccentButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, quiet && styles.buttonQuiet]}>
      <Text style={[styles.buttonLabel, quiet && styles.buttonLabelQuiet]}>{label}</Text>
      {detail ? <Text style={[styles.buttonDetail, quiet && styles.buttonDetailQuiet]}>{detail}</Text> : null}
    </Pressable>
  );
}

export function LabelValue({ label, value }: StatPillProps) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.labelText}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#122136",
    borderWidth: 1,
    borderColor: "#223149"
  },
  sectionCardAccent: {
    backgroundColor: "#15345f",
    borderColor: "#2d5fa2"
  },
  sectionHeader: {
    gap: 6
  },
  sectionTitle: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "800"
  },
  sectionSubtitle: {
    color: "#9db1c9",
    fontSize: 14,
    lineHeight: 20
  },
  statPill: {
    minWidth: 88,
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#0d1728",
    borderWidth: 1,
    borderColor: "#223149"
  },
  statValue: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "800"
  },
  statLabel: {
    color: "#90a5bf",
    fontSize: 12,
    lineHeight: 16
  },
  button: {
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#1e7cf2"
  },
  buttonQuiet: {
    backgroundColor: "#0d1728",
    borderWidth: 1,
    borderColor: "#223149"
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  buttonLabelQuiet: {
    color: "#e2ebf7"
  },
  buttonDetail: {
    color: "#d3e6ff",
    fontSize: 12,
    lineHeight: 16
  },
  buttonDetailQuiet: {
    color: "#90a5bf"
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  labelText: {
    color: "#90a5bf",
    fontSize: 14,
    lineHeight: 20
  },
  valueText: {
    color: "#f8fbff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "right",
    flexShrink: 1
  }
});
