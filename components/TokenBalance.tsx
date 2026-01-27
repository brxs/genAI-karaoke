"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTokens, TOKEN_PACKS, formatTokenPrice, type PackType } from "@/hooks/useTokens";

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
                <h3 className="text-lg font-semibold text-white">Buy Tokens</h3>
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

              <div className="space-y-3">
                {(Object.entries(TOKEN_PACKS) as [PackType, typeof TOKEN_PACKS[PackType]][])
                  .map(([type, pack]) => (
                    <button
                      key={type}
                      onClick={() => handlePurchase(type)}
                      disabled={purchasingPack !== null}
                      className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white group-hover:text-white/90">
                            {pack.name}
                          </p>
                          <p className="text-sm text-white/50">
                            {pack.tokens.toLocaleString()} tokens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            {formatTokenPrice(pack.price)}
                          </p>
                          <p className="text-xs text-white/40">
                            ~{Math.floor(pack.tokens / 360)} presentations
                          </p>
                        </div>
                      </div>
                      {purchasingPack === type && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Redirecting to checkout...
                        </div>
                      )}
                    </button>
                  )
                )}
              </div>

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
