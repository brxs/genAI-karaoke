"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [oAuthLoading, setOAuthLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError("");
    setOAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
      setOAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password);
        setSuccess("Check your email to confirm your account!");
        setEmail("");
        setPassword("");
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setSuccess("");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          {mode === "signin" ? "Sign in to your account" : "Create an account"}
        </h2>
        <p className="text-white/50 text-sm mb-6">
          {mode === "signin"
            ? "Sign in to save your presentations and access them from anywhere."
            : "Create an account to save your presentations and access them from anywhere."}
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading || oAuthLoading}
          className="w-full px-4 py-3 mb-4 bg-white/[0.03] border border-white/10 rounded-xl text-white font-medium transition-all duration-150 hover:bg-white/[0.06] hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
          {oAuthLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-white/40">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/70 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/20 text-white placeholder-white/30 outline-none transition-all"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/70 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/20 text-white placeholder-white/30 outline-none transition-all"
            />
          </div>

          {mode === "signup" && (
            <div className="mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/30 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-white/50">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-white/70 hover:text-white underline underline-offset-2"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-white/70 hover:text-white underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>
          )}

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {success && (
            <p className="text-green-400 text-sm mb-4">{success}</p>
          )}

          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-white font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(180deg, #52525b 0%, #3f3f46 100%)",
                boxShadow:
                  "0 3px 0 #27272a, 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (mode === "signup" && !agreedToTerms)}
              className="flex-1 px-4 py-3 text-black rounded-xl font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
                boxShadow:
                  "0 3px 0 #a1a1aa, 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              {isLoading
                ? mode === "signin"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </div>
        </form>

        <p className="text-sm text-white/40 text-center">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-white/70 hover:text-white underline underline-offset-2"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-white/70 hover:text-white underline underline-offset-2"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
