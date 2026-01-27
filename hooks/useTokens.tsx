"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { createClient } from "@/lib/supabase/client";
import {
  TOKEN_COSTS,
  TOKEN_PACKS,
  estimatePresentationCost,
  formatTokenPrice,
  type PackType,
} from "@/lib/token-constants";

// Re-export shared constants
export {
  TOKEN_COSTS,
  TOKEN_PACKS,
  estimatePresentationCost,
  formatTokenPrice,
  type PackType,
};


interface UseTokensReturn {
  balance: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  checkout: (packType: PackType) => Promise<void>;
}

export function useTokens(): UseTokensReturn {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [userTokensId, setUserTokensId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance(null);
      setUserTokensId(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tokens");
      if (!response.ok) {
        throw new Error("Failed to fetch token balance");
      }
      const data = await response.json();
      setBalance(data.balance);
      setUserTokensId(data.userTokensId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Subscribe to Supabase Realtime for token changes
  useEffect(() => {
    if (!userTokensId) return;

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`tokens:${userTokensId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "token_usage",
          filter: `user_tokens_id=eq.${userTokensId}`,
        },
        () => {
          fetchBalance();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "token_purchases",
          filter: `user_tokens_id=eq.${userTokensId}`,
        },
        () => {
          fetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userTokensId, fetchBalance]);

  const checkout = useCallback(async (packType: PackType) => {
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packType,
          successUrl: `${window.location.origin}?payment=success`,
          cancelUrl: `${window.location.origin}?payment=cancelled`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start checkout");
      throw e;
    }
  }, []);

  return {
    balance,
    loading,
    error,
    refresh: fetchBalance,
    checkout,
  };
}
