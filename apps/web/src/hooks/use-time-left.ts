import { useEffect, useState } from 'react'

export const useTimeLeft = (desiredTime: number) => {
  const [timeLeft, setTimeLeft] = useState(0)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0 && timer) {
      clearInterval(timer)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [timeLeft])

  function handleStarCooldown() {
    setTimeLeft(desiredTime)
  }

  function display() {
    const min = Math.floor(timeLeft / 60)
    const seg = timeLeft % 60
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
  }

  return {
    display: display(),
    timeLeft,
    handleStarCooldown,
    isWaitingTimeLeft: timeLeft > 0,
  }
}
