// @ts-expect-error - Deno stdlib import is valid for Supabase Edge Functions runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  corsHeaders,
  errorResponse,
  getRequestId,
  HttpError,
  json,
  methodNotAllowed,
  readJson,
} from "../_shared/http.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

type InviteRequest = {
  bookingId: string;
  inviteeEmail: string;
  role?: "player" | "spectator";
};

serve(async (req: Request) => {
  const requestId = getRequestId(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return methodNotAllowed(["POST"], { requestId });
  }

  try {
    const inviter = await getAuthenticatedUser(req);
    const body = await readJson<InviteRequest>(req);

    const { bookingId, inviteeEmail, role = "player" } = body;

    if (!bookingId || !inviteeEmail) {
      throw new HttpError(400, "missing_fields", "bookingId and inviteeEmail are required.");
    }

    const emailNorm = inviteeEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      throw new HttpError(400, "invalid_email", "Invalid email address.");
    }

    if (!["player", "spectator"].includes(role)) {
      throw new HttpError(400, "invalid_role", "Role must be 'player' or 'spectator'.");
    }

    const admin = createAdminClient();

    // Verify caller owns this booking
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, profile_id, status")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new HttpError(404, "booking_not_found", "Booking not found.");
    }

    if (booking.profile_id !== inviter.id) {
      throw new HttpError(403, "not_booking_owner", "Only the booking owner can invite participants.");
    }

    const terminalStatuses = ["cancelled", "refunded", "completed", "no_show"];
    if (terminalStatuses.includes(booking.status)) {
      throw new HttpError(409, "booking_not_active", "Cannot invite participants to a completed or cancelled booking.");
    }

    // Resolve invitee profile if they already have an account
    const { data: inviteeProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", emailNorm)
      .maybeSingle();

    // Upsert — idempotent on (booking_id, invitee_email)
    const { data: participant, error: insertError } = await admin
      .from("booking_participants")
      .upsert(
        {
          booking_id: bookingId,
          inviter_profile_id: inviter.id,
          invitee_profile_id: inviteeProfile?.id ?? null,
          invitee_email: emailNorm,
          role,
          status: "pending",
        },
        { onConflict: "booking_id,invitee_email", ignoreDuplicates: false }
      )
      .select("id, status")
      .single();

    if (insertError) {
      throw new HttpError(500, "invite_failed", insertError.message);
    }

    // Send notification email
    if (inviteeProfile) {
      // Existing user — send a magic-link-style notification via Supabase Auth Admin
      // (No-op if SMTP is not configured; invitation is still created in DB)
      try {
        await admin.auth.admin.generateLink({
          type: "magiclink",
          email: emailNorm,
          options: { redirectTo: `${req.headers.get("origin") ?? ""}/bookings/${bookingId}` },
        });
      } catch {
        // Non-fatal — invitation row exists, user will see it when they log in
      }
    } else {
      // New user — invite them to create an account
      try {
        await admin.auth.admin.inviteUserByEmail(emailNorm, {
          redirectTo: `${req.headers.get("origin") ?? ""}/bookings/${bookingId}`,
        });
      } catch {
        // Non-fatal — invitation row exists; they can still be linked via trigger on signup
      }
    }

    return json(200, { participantId: participant.id, status: participant.status }, { requestId });
  } catch (err) {
    return errorResponse(err, 500, requestId);
  }
});
