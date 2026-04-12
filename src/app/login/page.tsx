"use client";

import { useState, useTransition } from "react";
import { signInWithCredentials } from "@/lib/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import logoImg from "@/../public/logo.png";

export default function LoginPage() {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await signInWithCredentials(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    });
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-rose-100/50 via-purple-50/50 to-sky-100/50 dark:from-rose-950/20 dark:via-purple-900/10 dark:to-sky-950/20">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 blur-3xl animate-pulse mix-blend-multiply dark:mix-blend-screen opacity-70" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-secondary/30 to-sky-500/30 blur-3xl animate-pulse mix-blend-multiply dark:mix-blend-screen opacity-70" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="rounded-3xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-stone-900/40 backdrop-blur-2xl shadow-2xl shadow-purple-500/10 p-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto h-16 w-16 rounded-2xl shadow-lg flex items-center justify-center mb-4 overflow-hidden relative">
               <Image src={logoImg} alt="Personal App Logo" fill className="object-cover" sizes="(max-width: 64px) 100vw, 64px" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground font-medium">
              Sign in to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-destructive text-sm font-bold text-center backdrop-blur-md">
              {error}
            </div>
          )}

          {/* Login Form */}
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
                disabled={isPending || isGoogleLoading}
                className="w-full rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-5 py-3.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
                placeholder="Enter your username"
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
                disabled={isPending || isGoogleLoading}
                className="w-full rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-5 py-3.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || isGoogleLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-indigo-500 py-4 text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/30 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="px-4 text-muted-foreground bg-white/80 dark:bg-stone-900/80 rounded-full py-1 backdrop-blur-md border border-white/20 dark:border-white/5">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isPending || isGoogleLoading}
            className="w-full rounded-2xl bg-white/70 dark:bg-black/40 border border-white/50 dark:border-white/10 py-3.5 font-bold hover:bg-white dark:hover:bg-black transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 backdrop-blur-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading ? <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" /> : "Sign in with Google"}
          </button>

          {/* Register Link */}
          <div className="text-center text-sm font-medium pt-2">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 transition-colors font-bold"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
