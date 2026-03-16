import { ReactNode } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";

type AppShellProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

const navItems = [
  { label: "Discover", route: "/discovery" },
  { label: "Trips", route: "/reservations" },
  { label: "Profile", route: "/profile" }
] as const;

export function AppShell({ eyebrow, title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerBlock}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {children}
        </ScrollView>

        <View style={styles.navWrap}>
          {navItems.map((item) => {
            const active = pathname === item.route;

            return (
              <Pressable
                accessibilityRole="button"
                key={item.route}
                onPress={() => router.push(item.route)}
                style={[styles.navItem, active && styles.navItemActive]}
              >
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#081120"
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 16
  },
  content: {
    paddingBottom: 18,
    gap: 18
  },
  headerBlock: {
    gap: 8,
    paddingTop: 8
  },
  eyebrow: {
    color: "#6ee7b7",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  title: {
    color: "#f8fbff",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    maxWidth: 310
  },
  subtitle: {
    color: "#a9b9cd",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 340
  },
  navWrap: {
    flexDirection: "row",
    gap: 10,
    padding: 8,
    borderRadius: 24,
    backgroundColor: "#101a2d",
    borderWidth: 1,
    borderColor: "#1f324d"
  },
  navItem: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18
  },
  navItemActive: {
    backgroundColor: "#1e7cf2"
  },
  navLabel: {
    color: "#d2dceb",
    fontSize: 14,
    fontWeight: "700"
  },
  navLabelActive: {
    color: "#ffffff"
  }
});
