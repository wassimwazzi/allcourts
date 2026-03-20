import { createBrowserClient } from "@supabase/ssr";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  _client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

export async function getAuthenticatedSession(): Promise<string | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  if (!session?.access_token) return null;

  // Reject anonymous sessions — checkout requires a real account
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.is_anonymous) return null;

  return session.access_token;
}

/** @deprecated Use getAuthenticatedSession() — anonymous checkout is no longer supported */
export async function getOrCreateAnonSession(): Promise<string | null> {
  return getAuthenticatedSession();
}
