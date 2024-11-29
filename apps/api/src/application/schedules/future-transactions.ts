import { dayjs } from '@saas/core'
import { CronJob } from 'cron'

import { prisma } from '@/infra/database/prisma'
const job = new CronJob(
  '0 0 0 * * *', // cronTime
  async function () {
    await prisma.transaction.updateMany({
      where: {
        futureTransaction: true,
        recurrenceId: {
          not: null,
        },
        realizationDate: dayjs('2024-12-09').format('YYYY-MM-DD'),
      },
      data: {
        futureTransaction: false,
      },
    })
  }, // onTick
  null, // onComplete
  true, // start
  'America/Sao_Paulo', // timeZone
)

export default job
