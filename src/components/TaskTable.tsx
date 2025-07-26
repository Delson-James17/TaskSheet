// src/components/TaskTable.tsx
import { TaskControls } from './TaskControls'

type Task = {
  id: string
  start_time: string
  end_time: string
  total_hours: number
  status: string
  project: {
    title: string
  }
}

interface Props {
  tasks: Task[]
  fetchTasks: () => Promise<void>
}

export function TaskTable({ tasks, fetchTasks }: Props) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-blue-100">
          <tr>
            <th className="text-left py-3 px-4">Project</th>
            <th className="text-left py-3 px-4">Start</th>
            <th className="text-left py-3 px-4">End</th>
            <th className="text-left py-3 px-4">Total Hours</th>
            <th className="text-center py-3 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t">
              <td className="py-2 px-4">{task.project.title}</td>
              <td className="py-2 px-4 text-green-600">
                {task.start_time ? new Date(task.start_time).toLocaleString() : '—'}
              </td>
              <td className="py-2 px-4 text-red-500">
                {task.end_time ? new Date(task.end_time).toLocaleString() : '—'}
              </td>
              <td className="py-2 px-4 font-semibold">{task.total_hours ?? 0}</td>
              <td className="py-2 px-4 text-center">
                <TaskControls taskId={task.id} status={task.status} startTime={task.start_time} totalHours={task.total_hours}fetchTasks={fetchTasks} />
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                No tasks today
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
