const fallbackBaseUrl = "https://www.allcourts.com";

type PublicSupabaseEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? fallbackBaseUrl;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  };
}
