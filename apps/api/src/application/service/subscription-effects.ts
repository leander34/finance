import { prisma } from '@/infra/database/prisma'

export class SubscriptionEffectsService {
  async blockAllEntityWhenSubscriptionUpdatesToFree(
    organizationId: string,
  ): Promise<void> {
    const financialAccounts = await prisma.financialAccount.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    financialAccounts.shift()

    await prisma.financialAccount.updateMany({
      where: {
        id: {
          in: financialAccounts.map((acc) => acc.id),
        },
      },
      data: {
        blockedByExpiredSubscription: true,
      },
    })

    await prisma.category.updateMany({
      where: {
        organizationId,
        mainCategory: false,
      },
      data: {
        blockedByExpiredSubscription: true,
      },
    })

    await prisma.subcategory.updateMany({
      where: {
        organizationId,
        mainSubcategory: false,
      },
      data: {
        blockedByExpiredSubscription: true,
      },
    })
  }

  async unblockAllEntityWhenSubscriptionUpdatesToPremium(
    organizationId: string,
  ): Promise<void> {
    await prisma.financialAccount.updateMany({
      where: {
        organizationId,
        blockedByExpiredSubscription: true,
      },
      data: {
        blockedByExpiredSubscription: false,
      },
    })

    await prisma.category.updateMany({
      where: {
        organizationId,
        blockedByExpiredSubscription: true,
      },
      data: {
        blockedByExpiredSubscription: false,
      },
    })

    await prisma.subcategory.updateMany({
      where: {
        organizationId,
        blockedByExpiredSubscription: true,
      },
      data: {
        blockedByExpiredSubscription: false,
      },
    })
  }
}
