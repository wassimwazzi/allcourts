import { createClient } from "jsr:@supabase/supabase-js@2";
import { requireEnv } from "./env.ts";
import { getBearerToken, HttpError } from "./http.ts";

export function createAdminClient() {
  return createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function getAuthenticatedUser(request: Request) {
  const accessToken = getBearerToken(request);
  if (!accessToken) {
    throw new HttpError(401, "missing_bearer_token", "Missing bearer token.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new HttpError(401, "invalid_bearer_token", "Invalid bearer token.");
  }

  // Anonymous sessions cannot make bookings — a real account is required.
  if (data.user.is_anonymous) {
    throw new HttpError(
      401,
      "anonymous_session_not_allowed",
      "An authenticated account is required to make a booking. Please sign in or create an account.",
    );
  }

  return data.user;
}
