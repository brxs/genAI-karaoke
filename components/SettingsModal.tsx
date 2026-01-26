"use client";

import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email?: string } | null;
  onSignOut: () => void;
  onApiKeySave: () => void;
  onApiKeyClear: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  onSignOut,
  onApiKeySave,
  onApiKeyClear,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/check-api-key")
        .then((res) => res.json())
        .then((data) => {
          setMaskedKey(data.maskedKey);
        })
        .catch(() => {
          setMaskedKey(null);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/set-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save API key");
        return;
      }

      setApiKey("");
      setMaskedKey(data.maskedKey || apiKey.slice(0, 4) + "..." + apiKey.slice(-4));
      onApiKeySave();
    } catch {
      setError("Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearApiKey = async () => {
    setError("");
    setIsClearing(true);

    try {
      const response = await fetch("/api/set-api-key", {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Failed to clear API key");
        return;
      }

      setMaskedKey(null);
      setApiKey("");
      onApiKeyClear();
    } catch {
      setError("Failed to clear API key");
    } finally {
      setIsClearing(false);
    }
  };

  const handleSignOut = () => {
    onSignOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Account Section */}
        {user && (
          <div className="mb-6 pb-6 border-b border-white/10">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
              Account
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{user.email}</p>
                <p className="text-white/40 text-sm">Signed in</p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* API Key Section */}
        <div>
          <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
            API Key
          </h3>
          <p className="text-white/40 text-sm mb-4">
            Your API key is stored securely in a cookie and never sent to our servers.
          </p>

          {maskedKey && !apiKey && (
            <div className="mb-3 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-between">
              <p className="text-sm text-white/50">
                Current: <span className="font-mono text-white/70">{maskedKey}</span>
              </p>
              <button
                type="button"
                onClick={handleClearApiKey}
                disabled={isClearing}
                className="text-sm text-red-400/70 hover:text-red-400 disabled:opacity-50 transition-colors"
              >
                {isClearing ? "Clearing..." : "Clear"}
              </button>
            </div>
          )}

          <div className="relative mb-3">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={maskedKey ? "Enter new key to replace..." : "AIza..."}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/20 pr-20 text-white placeholder-white/30 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-3">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 hover:text-white/70 underline underline-offset-2 transition-colors"
            >
              Get API key
            </a>
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey || isLoading}
              className="px-4 py-2 text-sm text-black rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
                boxShadow: "0 2px 0 #a1a1aa, 0 3px 8px rgba(0,0,0,0.2)",
              }}
            >
              {isLoading ? "Saving..." : "Save Key"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
