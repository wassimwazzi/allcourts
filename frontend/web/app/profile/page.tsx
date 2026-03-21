import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { ProfileForm } from "@/components/profile-form";
import { ProfileSignOutButton } from "@/components/auth/profile-sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { UserProfile } from "@allcourts/types";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user || user.is_anonymous) redirect("/auth/login?next=/profile");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, avatar_url, timezone, role, onboarding_status")
    .eq("id", user.id)
    .single();

  if (!data) redirect("/auth/login");

  const profile: UserProfile = {
    id: data.id,
    email: data.email ?? undefined,
    fullName: data.full_name ?? undefined,
    phone: data.phone ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    timezone: data.timezone,
    role: data.role,
    onboardingStatus: data.onboarding_status,
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-md">
          <h1 className="mb-8 text-2xl font-bold text-white">Profile</h1>
          <div className="space-y-4 rounded-2xl border border-slate-700/30 bg-white/[0.03] p-6">
            <ProfileForm profile={profile} />
            <div className="border-t border-slate-800/80 pt-4">
              <ProfileSignOutButton />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
