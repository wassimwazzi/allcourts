import { Pressable, StyleSheet, Text, View } from "react-native";

type VenueCardProps = {
  id: string;
  name: string;
  area: string;
  trustNote: string;
  rate: string;
  availability: string;
  tags: readonly string[];
  onPress: (id: string) => void;
};

export function VenueCard({ id, name, area, trustNote, rate, availability, tags, onPress }: VenueCardProps) {
  return (
    <Pressable onPress={() => onPress(id)} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.area}>{area}</Text>
        </View>
        <View style={styles.ratePill}>
          <Text style={styles.rateValue}>{rate}</Text>
          <Text style={styles.rateLabel}>/hour</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.availability}>{availability}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.trust}>{trustNote}</Text>
      </View>

      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.link}>Review details →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#122136",
    borderWidth: 1,
    borderColor: "#223149"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  headerCopy: {
    flex: 1,
    gap: 4
  },
  name: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "800"
  },
  area: {
    color: "#95a9c2",
    fontSize: 14
  },
  ratePill: {
    alignItems: "flex-end",
    gap: 2
  },
  rateValue: {
    color: "#f8fbff",
    fontSize: 20,
    fontWeight: "800"
  },
  rateLabel: {
    color: "#90a5bf",
    fontSize: 12
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  availability: {
    color: "#6ee7b7",
    fontSize: 13,
    fontWeight: "700"
  },
  dot: {
    color: "#54718f"
  },
  trust: {
    color: "#cbd9e8",
    fontSize: 13,
    flexShrink: 1
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
    color: "#cbd9e8",
    fontSize: 12,
    fontWeight: "600"
  },
  link: {
    color: "#7db6ff",
    fontSize: 14,
    fontWeight: "700"
  }
});
