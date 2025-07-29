import { useEffect, useState } from 'react'
import { TaskControls } from './TaskControls'
import { formatDuration } from '@/components/LiveTimer'
import { TaskWithExtras } from '@/components/layout/types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import duration from 'dayjs/plugin/duration'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)

type Task = TaskWithExtras

interface Props {
  tasks: Task[]
  fetchTasks: () => Promise<void>
}

export function TaskTable({ tasks, fetchTasks }: Props) {
  const [now, setNow] = useState(dayjs.utc())

useEffect(() => {
  const interval = setInterval(() => setNow(dayjs()), 1000); // local time
  return () => clearInterval(interval);
}, []);

const formatToLocalTime = (timestamp: string | null) => {
  if (!timestamp) return '—'
  return dayjs(timestamp).tz('Asia/Manila').format('M/D/YYYY, h:mm:ss A')
}

const calculateTotalSeconds = (task: Task) => {
  const baseSeconds =
    task.accumulated_seconds ??
    (task.total_hours ? task.total_hours * 3600 : 0);

  if (task.status === 'running' && task.resume_time) {
    const resume = dayjs(task.resume_time); // no utc()
    const liveSeconds = dayjs().diff(resume, 'second'); // local vs local
    return baseSeconds + liveSeconds;
  }

  return baseSeconds;
};



  return (
    <div className="bg-black text-white dark:bg-white dark:text-black rounded-lg shadow overflow-x-auto">
      <p className="text-right text-xs text-gray-400 mb-2">
        Now: {now.tz('Asia/Manila').format('h:mm:ss A')}
      </p>
      <table className="min-w-full text-sm">
        <thead className="bg-blue-100 text-black">
          <tr>
            <th className="text-left py-3 px-4">Project</th>
            <th className="text-left py-3 px-4">Start</th>
            <th className="text-left py-3 px-4">Pause Time</th>
            <th className="text-left py-3 px-4">End</th>
            <th className="text-left py-3 px-4">Live</th>
            <th className="text-left py-3 px-4">Total Time</th>
            <th className="text-center py-3 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-400 dark:text-gray-600">
                No tasks today
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id} className="border-t border-gray-600 dark:border-gray-300">
                <td className="py-2 px-4">{task.project?.title}</td>
                <td className="py-2 px-4 text-green-500">
                  {formatToLocalTime(task.start_time)}
                </td>
                <td className="py-2 px-4 text-yellow-400">
                  {formatToLocalTime(task.last_pause_time ?? null)}
                </td>
                <td className="py-2 px-4 text-red-500">
                  {formatToLocalTime(task.end_time)}
                </td>
                <td className="py-2 px-4">
                  {task.status === 'paused' && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full inline-flex items-center">
                      🟡 Paused
                    </span>
                  )}
                  {task.status === 'running' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full inline-flex items-center">
                      🟢 Running
                    </span>
                  )}
                  {task.status === 'ended' && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full inline-flex items-center">
                      🔴 Ended
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 font-semibold text-blue-300">
                  {formatDuration(calculateTotalSeconds(task))}
                </td>
                  <td className="py-2 px-4 text-center">
                    {task.status !== 'ended' ? (
                      <TaskControls
                        taskId={task.id}
                        status={task.status as 'running' | 'paused'| 'ended'}
                        fetchTasks={fetchTasks}
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
