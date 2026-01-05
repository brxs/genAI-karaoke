"use client";

import { useState, useEffect } from "react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onClear: () => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSave, onClear }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Fetch the masked key when modal opens
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

  const handleSave = async () => {
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
      onSave();
      onClose();
    } catch {
      setError("Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
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
      onClear();
      onClose();
    } catch {
      setError("Failed to clear API key");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Enter your Google AI API Key
        </h2>
        <p className="text-white/50 text-sm mb-6">
          Your API key is stored securely in a cookie and never sent to our servers.
        </p>

        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-white/70 mb-2">
            API Key
          </label>
          {maskedKey && !apiKey && (
            <div className="mb-3 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-between">
              <p className="text-sm text-white/50">
                Current key: <span className="font-mono text-white/70">{maskedKey}</span>
              </p>
              <button
                type="button"
                onClick={handleClear}
                disabled={isClearing}
                className="text-sm text-red-400/70 hover:text-red-400 disabled:opacity-50 transition-colors"
              >
                {isClearing ? "Clearing..." : "Clear"}
              </button>
            </div>
          )}
          <div className="relative">
            <input
              id="apiKey"
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
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <p className="text-sm text-white/40 mb-6">
          Get your API key from{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white underline underline-offset-2"
          >
            Google AI Studio
          </a>
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey || isLoading}
            className="flex-1 px-4 py-3 bg-white text-black rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            {isLoading ? "Saving..." : "Save Key"}
          </button>
        </div>
      </div>
    </div>
  );
}
