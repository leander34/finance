import { PrismaClient } from '@prisma/client'
import { banks } from '@saas/core'

const prisma = new PrismaClient()
async function main() {
  await prisma.bank.deleteMany()
  const bankPromises = banks.map((bank) =>
    prisma.bank.create({
      data: {
        name: bank.name,
        imageUrl: bank.imageUrl,
        main: bank.main,
      },
    }),
  )

  await Promise.all(bankPromises)
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
