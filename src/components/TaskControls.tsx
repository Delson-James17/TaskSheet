import { handlePause, handleResume, handleEnd } from '@/controller/TaskActions'

interface Props {
  taskId: string
  status: string
  startTime: string
  totalHours: number | null
  fetchTasks: () => Promise<void>
}

export function TaskControls({ taskId, status, startTime, totalHours, fetchTasks }: Props) {
  const isPaused = status === 'paused'
  const isRunning = status === 'running'

  const handleTogglePauseResume = async () => {
    if (isPaused) {
      await handleResume(taskId, fetchTasks)
    } else if (isRunning) {
      await handlePause(taskId, startTime, totalHours, fetchTasks)
    }
  }

  const handleEndTask = async () => {
    await handleEnd(taskId, startTime, totalHours, fetchTasks)
  }

  return (
    <div className="flex gap-2 justify-center">
      {(isPaused || isRunning) && (
        <button
          className={`${isPaused ? 'bg-green-600' : 'bg-yellow-500'} px-2 py-1 text-white rounded text-sm`}
          onClick={handleTogglePauseResume}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      )}

      {status !== 'ended' && (
        <button
          className="bg-red-600 px-2 py-1 text-white rounded text-sm"
          onClick={handleEndTask}
        >
          End
        </button>
      )}
    </div>
  )
}
