import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}



export function LiveTimer({
  startTime,
  accumulated = 0,
}: {
  startTime: string
  accumulated?: number
}) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = dayjs.utc(startTime).valueOf()

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.floor((now - start) / 1000)
      setElapsed(diff)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  return <span>{formatDuration(elapsed + (accumulated || 0))}</span>
}
