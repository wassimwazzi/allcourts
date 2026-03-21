import { createBrowserClient, createServerClient } from "@supabase/ssr";
import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";

export interface PublicSupabaseEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

type PublicSupabaseEnvSource = Record<string, string | undefined>;

export type SupabaseCookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | "lax" | "none" | "strict";
  secure?: boolean;
  priority?: "high" | "low" | "medium";
  partitioned?: boolean;
};

export type SupabaseCookie = {
  name: string;
  value: string;
  options?: SupabaseCookieOptions;
};

export type SupabaseCookieMethods = {
  getAll(): Array<Pick<SupabaseCookie, "name" | "value">>;
  setAll(cookiesToSet: SupabaseCookie[]): void;
};

function readPublicSupabaseEnv(env: PublicSupabaseEnvSource): PublicSupabaseEnv | null {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function getOptionalPublicSupabaseEnv(
  env: PublicSupabaseEnvSource,
): PublicSupabaseEnv | null {
  return readPublicSupabaseEnv(env);
}

export function getPublicSupabaseEnv(env: PublicSupabaseEnvSource): PublicSupabaseEnv {
  const config = readPublicSupabaseEnv(env);

  if (!config) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return config;
}

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient(env: PublicSupabaseEnvSource) {
  if (browserClient) {
    return browserClient;
  }

  const config = getOptionalPublicSupabaseEnv(env);
  if (!config) {
    return null;
  }

  browserClient = createBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
  return browserClient;
}

export function createPublicSupabaseClient(
  env: PublicSupabaseEnvSource,
  options: SupabaseClientOptions<"public"> = {},
) {
  const config = getPublicSupabaseEnv(env);

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    ...options,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      ...(options.auth ?? {}),
    },
  });
}

export function createSupabaseServerClient(
  env: PublicSupabaseEnvSource,
  cookies: SupabaseCookieMethods,
) {
  const config = getPublicSupabaseEnv(env);

  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies,
  });
}

export async function getAuthenticatedSessionAccessToken(
  client: SupabaseClient,
): Promise<string | null> {
  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user || user.is_anonymous) {
    return null;
  }

  return session.access_token;
}

export function getSupabaseFunctionUrl(
  env: PublicSupabaseEnvSource,
  functionName: string,
): string {
  const config = getPublicSupabaseEnv(env);
  return `${config.supabaseUrl}/functions/v1/${functionName}`;
}
