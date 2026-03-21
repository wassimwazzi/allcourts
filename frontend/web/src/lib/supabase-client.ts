import {
  getAuthenticatedSessionAccessToken,
  getSupabaseBrowserClient as getSharedSupabaseBrowserClient,
} from "@allcourts/sdk";

export function getSupabaseBrowserClient() {
  return getSharedSupabaseBrowserClient(process.env);
}

export async function getAuthenticatedSession(): Promise<string | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  return getAuthenticatedSessionAccessToken(client);
}

/** @deprecated Use getAuthenticatedSession() — anonymous checkout is no longer supported */
export async function getOrCreateAnonSession(): Promise<string | null> {
  return getAuthenticatedSession();
}
