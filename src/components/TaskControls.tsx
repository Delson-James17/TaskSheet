import { handlePause, handleResume, handleEnd } from '@/controller/TaskActions'

interface Props {
  taskId: string
  status: 'running' | 'paused' | 'ended'
  fetchTasks: () => Promise<void>
}

export function TaskControls({ taskId, status, fetchTasks }: Props) {
  const handleTogglePauseResume = async () => {
    if (status === 'paused') {
      await handleResume(taskId, fetchTasks)
    } else if (status === 'running') {
      await handlePause(taskId, fetchTasks)
    }
  }

  const handleEndTask = async () => {
    await handleEnd(taskId, fetchTasks)
  }

  return (
    <div className="flex gap-2 justify-center">
      {status !== 'ended' && (
        <>
          <button
            className={`${status === 'paused' ? 'bg-green-600' : 'bg-yellow-500'} px-2 py-1 text-white rounded text-sm`}
            onClick={handleTogglePauseResume}
          >
            {status === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button
            className="bg-red-600 px-2 py-1 text-white rounded text-sm"
            onClick={handleEndTask}
          >
            End
          </button>
        </>
      )}
    </div>
  )
}
