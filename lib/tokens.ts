import { prisma } from "./prisma";
import type { TokenUsage, TokenPurchase, UserTokens, Prisma } from "@prisma/client";
import {
  TOKEN_COSTS,
  TOKEN_PACKS,
  estimatePresentationCost,
  type OperationType,
  type PackType,
} from "./token-constants";

// Re-export shared constants
export {
  TOKEN_COSTS,
  TOKEN_PACKS,
  estimatePresentationCost,
  type OperationType,
  type PackType,
};

/**
 * Get or create UserTokens record for a user
 */
export async function getOrCreateUserTokens(
  userId: string
): Promise<UserTokens> {
  let userTokens = await prisma.userTokens.findUnique({
    where: { userId },
  });

  if (!userTokens) {
    userTokens = await prisma.userTokens.create({
      data: { userId },
    });
  }

  return userTokens;
}

/**
 * Calculate available token balance for a user
 * Available = purchases - pending (reserved) - completed (actual)
 */
export async function getAvailableBalance(userId: string): Promise<number> {
  const userTokens = await getOrCreateUserTokens(userId);

  const [totalPurchased, pendingUsage, completedUsage] = await Promise.all([
    prisma.tokenPurchase.aggregate({
      where: { userTokensId: userTokens.id, status: "completed" },
      _sum: { tokensAmount: true },
    }),
    prisma.tokenUsage.aggregate({
      where: { userTokensId: userTokens.id, status: "pending" },
      _sum: { estimatedTokens: true },
    }),
    prisma.tokenUsage.aggregate({
      where: { userTokensId: userTokens.id, status: "completed" },
      _sum: { tokensUsed: true },
    }),
  ]);

  return (
    (totalPurchased._sum.tokensAmount ?? 0) -
    (pendingUsage._sum.estimatedTokens ?? 0) -
    (completedUsage._sum.tokensUsed ?? 0)
  );
}

/**
 * Reserve tokens before executing an operation
 * Creates a pending usage record that blocks the tokens
 */
export async function reserveTokens(
  userId: string,
  estimatedTokens: number,
  operationType: OperationType,
  presentationId?: string,
  metadata?: Prisma.InputJsonValue
): Promise<TokenUsage> {
  const userTokens = await getOrCreateUserTokens(userId);

  return prisma.tokenUsage.create({
    data: {
      userTokensId: userTokens.id,
      presentationId,
      operationType,
      estimatedTokens,
      status: "pending",
      metadata,
    },
  });
}

/**
 * Complete a usage record after successful operation
 * Updates with actual tokens used and marks as completed
 */
export async function completeUsage(
  usageId: string,
  tokensUsed: number
): Promise<TokenUsage> {
  return prisma.tokenUsage.update({
    where: { id: usageId },
    data: {
      tokensUsed,
      status: "completed",
      completedAt: new Date(),
    },
  });
}

/**
 * Fail a usage record (releases reserved tokens)
 */
export async function failUsage(usageId: string): Promise<TokenUsage> {
  return prisma.tokenUsage.update({
    where: { id: usageId },
    data: {
      status: "failed",
      completedAt: new Date(),
    },
  });
}

/**
 * Create a purchase record (called after Stripe webhook confirms payment)
 */
export async function createPurchase(
  userId: string,
  packType: PackType,
  stripeSessionId: string,
  stripePaymentIntentId?: string
): Promise<TokenPurchase> {
  const userTokens = await getOrCreateUserTokens(userId);
  const pack = TOKEN_PACKS[packType];

  return prisma.tokenPurchase.create({
    data: {
      userTokensId: userTokens.id,
      packType,
      tokensAmount: pack.tokens,
      amountPaid: pack.price,
      stripeSessionId,
      stripePaymentIntentId,
      status: "completed",
      completedAt: new Date(),
    },
  });
}

/**
 * Get usage history for a user
 */
export async function getUsageHistory(
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ usage: TokenUsage[]; total: number }> {
  const userTokens = await prisma.userTokens.findUnique({
    where: { userId },
  });

  if (!userTokens) {
    return { usage: [], total: 0 };
  }

  const [usage, total] = await Promise.all([
    prisma.tokenUsage.findMany({
      where: { userTokensId: userTokens.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.tokenUsage.count({
      where: { userTokensId: userTokens.id },
    }),
  ]);

  return { usage, total };
}

/**
 * Get purchase history for a user
 */
export async function getPurchaseHistory(
  userId: string
): Promise<TokenPurchase[]> {
  const userTokens = await prisma.userTokens.findUnique({
    where: { userId },
  });

  if (!userTokens) {
    return [];
  }

  return prisma.tokenPurchase.findMany({
    where: { userTokensId: userTokens.id },
    orderBy: { createdAt: "desc" },
  });
}

