import fs from 'node:fs'

import { dayjs } from '@saas/core'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
const { createLogger, format } = winston
const { combine, timestamp, printf } = format
let transport = new DailyRotateFile({
  dirname: 'logs/' + getDirName(),
  filename: 'log-%DATE%',
  datePattern: 'YYYY-MM-DD', // rotates every day
})

function getDirName() {
  // returns current YYYY-MM
  // const curDate = new Date()
  // const curMonth = ('0' + (curDate.getMonth() + 1)).slice(-2)
  // const curYYYYMM = curDate.getFullYear() + '-' + curMonth
  return dayjs().format('YYYY-MM')
}

transport.on('rotate', function () {
  // Each time there is a file rotation (= every day with this date pattern), if there is not yet
  // a folder with the current name = if the month changed, then create a new transport and
  // set its directory to the new month:
  if (!fs.existsSync('logs/' + getDirName() + '/')) {
    transport = new winston.transports.DailyRotateFile({
      dirname: 'logs/' + getDirName(),
      filename: 'log-%DATE%',
      datePattern: 'YYYY-MM-DD',
    })
  }
})

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

// const combinedLogTransport: DailyRotateFile = new DailyRotateFile({
//   filename: 'logs/%Y/%m/combined-%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   zippedArchive: true,
//   maxSize: '20m',
//   maxFiles: '14d',
// })

// combinedLogTransport.on('drain', () => {
//   console.log('oi')
// })

// combinedLogTransport.on('new', () => {
//   console.log('new')
// })

// combinedLogTransport.on('rotate', () => {
//   console.log('rotate')
// })
export const logger = createLogger({
  format: combine(timestamp(), logFormat),
  transports: [transport],
})
