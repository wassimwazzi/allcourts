import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const env =
  (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env ?? {};

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Supabase recommends using AsyncStorage or SecureStore for session persistence in Expo.
// SecureStore encrypts tokens at rest on device.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
