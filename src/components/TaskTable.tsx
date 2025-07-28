import { useEffect, useState } from 'react'
import { TaskControls } from './TaskControls'
import { LiveTimer, formatDuration } from '@/components/LiveTimer'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

type Task = {
  id: string
  start_time: string
  end_time: string | null
  total_hours: number
  status: string
  project: {
    title: string
  } | null
  accumulated_seconds?: number
}

interface Props {
  tasks: Task[]
  fetchTasks: () => Promise<void>
}

export function TaskTable({ tasks, fetchTasks }: Props) {
  const [now, setNow] = useState(dayjs())

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatToLocalTime = (timestamp: string | null) => {
    if (!timestamp) return '—'
    return dayjs.utc(timestamp).tz('Asia/Manila').format('M/D/YYYY, h:mm:ss A')
  }

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
            <th className="text-left py-3 px-4">End</th>
            <th className="text-left py-3 px-4">Live</th>
            <th className="text-left py-3 px-4">Total Time</th>
            <th className="text-center py-3 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-400 dark:text-gray-600">
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
                <td className="py-2 px-4 text-red-500">
                  {formatToLocalTime(task.end_time)}
                </td>
                <td className="py-2 px-4 text-blue-400">
                  {task.status === 'running' ? (
                    <LiveTimer
                      startTime={task.start_time}
                      accumulated={task.accumulated_seconds ?? 0}
                    />
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-2 px-4 font-semibold text-blue-300">
                  {formatDuration(
                    task.accumulated_seconds ??
                      (task.end_time
                        ? Math.floor(
                            (new Date(task.end_time).getTime() - new Date(task.start_time).getTime()) /
                              1000
                          )
                        : 0)
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  <TaskControls
                    taskId={task.id}
                    status={task.status}
                    startTime={task.start_time}
                    totalHours={task.total_hours}
                    fetchTasks={fetchTasks}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
