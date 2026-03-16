export interface PublicSupabaseEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function getPublicSupabaseEnv(env: Record<string, string | undefined>): PublicSupabaseEnv {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing public Supabase environment variables.');
  }

  return { supabaseUrl, supabaseAnonKey };
}
