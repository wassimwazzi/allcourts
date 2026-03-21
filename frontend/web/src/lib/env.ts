import {
  getOptionalPublicSupabaseEnv,
  type PublicSupabaseEnv,
} from "@allcourts/sdk";

const fallbackBaseUrl = "https://www.allcourts.com";

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
  return getOptionalPublicSupabaseEnv(process.env);
}
