import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { User } from "@supabase/supabase-js";

import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/Ui";
import { supabase } from "@/lib/supabase";

type AuthMode = "signin" | "signup";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user?.is_anonymous ? null : (data.user ?? null));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null;
      setUser(u?.is_anonymous ? null : u);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth() {
    setLoading(true);
    setError(null);
    setMessage(null);
    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.auth.signUp({ email: email.trim(), password });
      if (err) setError(err.message);
      else setMessage("Check your email to confirm your account.");
    }
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (user === undefined) {
    return (
      <AppShell eyebrow="Profile" title="Loading…" subtitle="">
        <ActivityIndicator color="#34d399" style={{ marginTop: 32 }} />
      </AppShell>
    );
  }

  if (user) {
    return (
      <AppShell
        eyebrow="Profile"
        title={user.email ?? "My Account"}
        subtitle="Manage your account and bookings."
      >
        <SectionCard title="Account">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </SectionCard>

        <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Profile"
      title={mode === "signin" ? "Welcome back" : "Create account"}
      subtitle="Sign in to view and manage your bookings."
    >
      <SectionCard>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#4a6480"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#4a6480"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.successMsg}>{message}</Text> : null}

        <Pressable onPress={handleAuth} disabled={loading} style={styles.submitBtn}>
          <Text style={styles.submitText}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
          style={styles.toggleBtn}
        >
          <Text style={styles.toggleText}>
            {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
          </Text>
        </Pressable>
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6, marginBottom: 14 },
  label: { color: "#a9b9cd", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "#0d1e30",
    borderWidth: 1,
    borderColor: "#223149",
    borderRadius: 10,
    color: "#f8fbff",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: { color: "#f87171", fontSize: 13, marginBottom: 8 },
  successMsg: { color: "#34d399", fontSize: 13, marginBottom: 8 },
  submitBtn: {
    backgroundColor: "#34d399",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitText: { color: "#081120", fontSize: 15, fontWeight: "700" },
  toggleBtn: { alignItems: "center", marginTop: 16 },
  toggleText: { color: "#34d399", fontSize: 13 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  infoLabel: { color: "#a9b9cd", fontSize: 14 },
  infoValue: { color: "#f8fbff", fontSize: 14, fontWeight: "600" },
  signOutBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#f87171",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: { color: "#f87171", fontSize: 14, fontWeight: "600" },
});
