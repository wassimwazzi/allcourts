import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign In" };

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-brand-accent/30 bg-gradient-to-br from-brand-accent/20 to-brand-blue/25 text-sm font-extrabold text-white">
              AC
            </span>
            <span className="text-xl font-bold text-white">AllCourts</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to manage your bookings</p>
        </div>
        <LoginForm next={next} />
        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href={
              next
                ? { pathname: "/auth/signup", query: { next } }
                : { pathname: "/auth/signup" }
            }
            className="text-brand-accent hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
