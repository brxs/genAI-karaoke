"use client";

import { TOKEN_PACKS, formatTokenPrice, type PackType, estimatePresentationCost } from "@/hooks/useTokens";

interface TokenPackListProps {
  onPurchase: (packType: PackType) => void;
  purchasingPack: PackType | null;
}

export default function TokenPackList({
  onPurchase,
  purchasingPack,
}: TokenPackListProps) {
  const averagePresentationCost = estimatePresentationCost(5, true, 0, 0);
  const averageSlideCost = averagePresentationCost / 5;

  return (
    <div className="space-y-3">
      {(Object.entries(TOKEN_PACKS) as [PackType, typeof TOKEN_PACKS[PackType]][]).map(
        ([type, pack]) => (
          <button
            key={type}
            onClick={() => onPurchase(type)}
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
                  ~{Math.floor(pack.tokens / averagePresentationCost)} presentations
                </p>
                <p className="text-xs text-white/40">
                  ~{Math.floor(pack.tokens / averageSlideCost)} slides
                </p>
              </div>
            </div>
            {purchasingPack === type && (
              <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Redirecting to checkout...
              </div>
            )}
          </button>
        )
      )}
    </div>
  );
}
