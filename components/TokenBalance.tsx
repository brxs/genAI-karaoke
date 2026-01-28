"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTokens, type PackType } from "@/hooks/useTokens";
import TokenPackList from "./TokenPackList";

export default function TokenBalance() {
  const { balance, loading, checkout } = useTokens();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasingPack, setPurchasingPack] = useState<PackType | null>(null);

  const handlePurchase = async (packType: PackType) => {
    setPurchasingPack(packType);
    try {
      await checkout(packType);
    } catch {
      // Error is handled in the hook
    } finally {
      setPurchasingPack(null);
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 animate-pulse">
        <div className="h-4 w-16 bg-white/10 rounded" />
      </div>
    );
  }

  if (balance === null) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowPurchaseModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors group"
      >
        <img src="/banana.svg" alt="" className="w-4 h-4" />
        <span className="text-sm text-white font-medium">{balance.toLocaleString()}</span>
      </button>

      {/* Purchase Modal - rendered via portal to escape header's stacking context */}
      {showPurchaseModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPurchaseModal(false)}
          >
            <div
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Buy Tokens
                  <img src="/banana.svg" alt="Banana" className="w-8 h-8 inline-block ml-2" />
                </h3>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/60">Current balance</p>
                <p className="text-2xl font-bold text-white">{balance.toLocaleString()} tokens</p>
              </div>

              <TokenPackList
                onPurchase={handlePurchase}
                purchasingPack={purchasingPack}
              />

              <p className="mt-4 text-xs text-white/30 text-center">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
