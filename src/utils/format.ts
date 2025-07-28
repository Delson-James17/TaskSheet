export function formatElapsedTime(
  startTime: string,
  accumulated: number,
  isRunning: boolean,
  now: Date
): string {
  let totalSeconds = accumulated

  if (isRunning && startTime) {
    const start = new Date(startTime)
    totalSeconds += Math.floor((now.getTime() - start.getTime()) / 1000)
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`
}
