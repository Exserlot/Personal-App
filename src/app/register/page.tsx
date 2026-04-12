"use client";

import { useState, useTransition } from "react";
import { signUpWithCredentials } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import logoImg from "@/../public/logo.png";

export default function RegisterPage() {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await signUpWithCredentials(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-50/50 via-rose-50/50 to-orange-50/50 dark:from-purple-900/10 dark:via-rose-950/20 dark:to-orange-950/10">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-secondary/30 to-rose-500/30 blur-3xl animate-pulse mix-blend-multiply dark:mix-blend-screen opacity-70" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-primary/30 to-orange-500/30 blur-3xl animate-pulse mix-blend-multiply dark:mix-blend-screen opacity-70" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="rounded-3xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-stone-900/40 backdrop-blur-2xl shadow-2xl shadow-rose-500/10 p-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto h-16 w-16 rounded-2xl shadow-lg flex items-center justify-center mb-4 overflow-hidden relative">
               <Image src={logoImg} alt="Personal App Logo" fill className="object-cover" sizes="(max-width: 64px) 100vw, 64px" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create Account
            </h1>
            <p className="text-muted-foreground font-medium">
              Sign up to get started
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-destructive text-sm font-bold text-center backdrop-blur-md">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                disabled={isPending}
                className="w-full rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-5 py-3.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
                placeholder="Choose a username"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                disabled={isPending}
                className="w-full rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-5 py-3.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                disabled={isPending}
                className="w-full rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-5 py-3.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
                placeholder="Create a password (min 6 chars)"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                minLength={6}
                disabled={isPending}
                className="w-full rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-5 py-3.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-rose-500 py-4 text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 mt-2"
            >
              {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign Up"}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm font-medium pt-2 border-t border-white/30 dark:border-white/10 mt-6 pt-6">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 transition-colors font-bold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
