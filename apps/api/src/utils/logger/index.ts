import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
const { createLogger, format } = winston
const { combine, timestamp, printf } = format

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} ${level}: ${message} (${JSON.stringify(meta)})`
})

const infoLogTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/info-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
})

const errorsLogTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
})

const warnLogTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/warn-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
})

export const logger = createLogger({
  format: combine(timestamp(), logFormat),
  transports: [
    // new transports.Console({
    //   format: combine(colorize(), logFormat),
    // }),
    // new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new transports.File({ filename: 'logs/combined.log' }),
    infoLogTransport,
    warnLogTransport,
    errorsLogTransport,
  ],
})
