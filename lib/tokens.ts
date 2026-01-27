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
    // Create UserTokens and initial credit in a transaction
    userTokens = await prisma.$transaction(async (tx) => {
      const newUserTokens = await tx.userTokens.create({
        data: { userId },
      });

      // Grant initial credit
      await tx.tokenPurchase.create({
        data: {
          userTokensId: newUserTokens.id,
          packType: "initial_credit",
          tokensAmount: TOKEN_PACKS.initial_credit.tokens,
          amountPaid: 0,
          status: "completed",
          completedAt: new Date(),
        },
      });

      return newUserTokens;
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

/**
 * Grant initial credit to an existing user (for migration)
 */
export async function grantInitialCredit(userId: string): Promise<boolean> {
  const userTokens = await getOrCreateUserTokens(userId);

  // Check if user already has initial credit
  const existingCredit = await prisma.tokenPurchase.findFirst({
    where: {
      userTokensId: userTokens.id,
      packType: "initial_credit",
    },
  });

  if (existingCredit) {
    return false; // Already has initial credit
  }

  await prisma.tokenPurchase.create({
    data: {
      userTokensId: userTokens.id,
      packType: "initial_credit",
      tokensAmount: TOKEN_PACKS.initial_credit.tokens,
      amountPaid: 0,
      status: "completed",
      completedAt: new Date(),
    },
  });

  return true;
}
