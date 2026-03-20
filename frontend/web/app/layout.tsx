import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import type { UserProfile } from "@allcourts/types";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: {
    default: "AllCourts",
    template: "%s · AllCourts"
  },
  description:
    "Booking-first sports marketplace for discovering courts, comparing open slots, and checking out with confidence.",
  openGraph: {
    title: "AllCourts",
    description:
      "Booking-first sports marketplace for discovering courts, comparing open slots, and checking out with confidence.",
    type: "website"
  }
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return <RootLayoutContent>{children}</RootLayoutContent>;
}

async function RootLayoutContent({ children }: RootLayoutProps) {
  const user = await getServerUser();
  let initialProfile: UserProfile | null = null;

  if (user && !user.is_anonymous) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, phone, avatar_url, timezone, role, onboarding_status")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      initialProfile = {
        id: data.id,
        email: data.email?.trim() || undefined,
        fullName: data.full_name?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        avatarUrl: data.avatar_url?.trim() || undefined,
        timezone: data.timezone,
        role: data.role,
        onboardingStatus: data.onboarding_status,
      };
    }
  }

  return (
    <html lang="en">
      <body>
        <AuthProvider
          initialUser={user && !user.is_anonymous ? user : null}
          initialProfile={initialProfile}
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
