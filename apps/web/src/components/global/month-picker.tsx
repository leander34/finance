'use client'
import { PopoverClose } from '@radix-ui/react-popover'
import { dayjs } from '@saas/core'
import { ArrowDown, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
interface MonthPickerProps {
  currentSelectedDate: string
  handleChangeCurrentDate: (date: string) => void
}
export function MonthPicker({
  currentSelectedDate,
  handleChangeCurrentDate,
}: MonthPickerProps) {
  const currentFormatedViewerDate =
    dayjs(currentSelectedDate).format('MMMM [de] YYYY')
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="font-semibold text-primary hover:text-primary"
        >
          {currentFormatedViewerDate
            .slice(0, 1)
            .toUpperCase()
            .concat(currentFormatedViewerDate.slice(1))}
          <ChevronDown className="ml-2 size-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 overflow-hidden p-0">
        <div className="flex items-center justify-between bg-primary px-4 py-2">
          <Button
            type="button"
            onClick={() => {
              handleChangeCurrentDate(
                dayjs(currentSelectedDate)
                  .subtract(1, 'year')
                  .startOf('month')
                  .format('YYYY-MM-DD'),
              )
            }}
            variant="ghost"
            className="text-primary-foreground hover:bg-transparent hover:text-primary-foreground"
          >
            <ChevronLeft />
          </Button>
          <span className="text-lg text-primary-foreground">
            {dayjs(currentSelectedDate).format('YYYY')}
          </span>
          <Button
            type="button"
            onClick={() =>
              handleChangeCurrentDate(
                dayjs(currentSelectedDate)
                  .add(1, 'year')
                  .startOf('month')
                  .format('YYYY-MM-DD'),
              )
            }
            variant="ghost"
            className="text-primary-foreground hover:bg-transparent hover:text-primary-foreground"
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="px-4 py-5">
          <table className="w-full">
            <tbody className="text-center text-sm font-medium text-muted-foreground">
              <tr className="">
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 0}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 0)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    JAN
                  </button>
                </td>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 1}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 1)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    FEV
                  </button>
                </td>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 2}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 2)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    MAR
                  </button>
                </td>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 3}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 3)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    ABR
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 4}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 4)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    MAI
                  </button>
                </td>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 5}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 5)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    JUN
                  </button>
                </td>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 6}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 6)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    JUL
                  </button>
                </td>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 7}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 7)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    AGO
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 8}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 8)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    SET
                  </button>
                </td>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 9}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 9)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    OUT
                  </button>
                </td>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 10}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 10)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    NOV
                  </button>
                </td>
                <td>
                  <button
                    data-active={dayjs(currentSelectedDate).month() === 11}
                    className={cn(
                      'h-[42px] w-full cursor-pointer transition-colors duration-300 hover:text-foreground data-[active=true]:text-primary data-[active=true]:hover:text-primary',
                    )}
                    onClick={() =>
                      handleChangeCurrentDate(
                        dayjs(currentSelectedDate)
                          .set('month', 11)
                          .startOf('month')
                          .format('YYYY-MM-DD'),
                      )
                    }
                    type="button"
                  >
                    DEZ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-2">
          <PopoverClose asChild>
            <Button variant="ghost" className="text-primary hover:text-primary">
              Cancelar
            </Button>
          </PopoverClose>
          <Button
            type="button"
            onClick={() =>
              handleChangeCurrentDate(
                dayjs().startOf('month').format('YYYY-MM-DD'),
              )
            }
            variant="ghost"
            className="text-primary hover:text-primary"
          >
            Este mês
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
