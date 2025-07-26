// src/components/TaskControls.tsx
import { handlePause, handleResume, handleEnd } from '@/controller/TaskActions'

interface Props {
  taskId: string
  status: string
  startTime: string
  totalHours: number | null
  fetchTasks: () => Promise<void>
}


export function TaskControls({ taskId, status, startTime, totalHours, fetchTasks }: Props) {
  return (
    <div className="flex gap-2 justify-center">
      <button
  className="bg-yellow-500 px-2 py-1 text-white rounded text-sm"
  onClick={() => handlePause(taskId, startTime, totalHours, fetchTasks)}
  disabled={status !== 'running'}>Pause</button>

<button
  className="bg-green-600 px-2 py-1 text-white rounded text-sm"
  onClick={() => handleResume(taskId, fetchTasks)}
  disabled={status !== 'paused'}>Resume</button>

<button
  className="bg-red-600 px-2 py-1 text-white rounded text-sm"
  onClick={() => handleEnd(taskId, startTime, totalHours, fetchTasks)}
  disabled={status === 'ended'}>End</button>
    </div>
  )
}
