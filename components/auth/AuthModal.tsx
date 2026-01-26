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

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

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
