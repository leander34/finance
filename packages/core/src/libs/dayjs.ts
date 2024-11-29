import 'dayjs/locale/pt-br'

import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
dayjs.locale('pt-br')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isBetween)
dayjs.extend(isSameOrAfter)

dayjs.tz.setDefault('America/Sao_Paulo')

export { dayjs }
