// src/features/page/TasksAdmin.tsx

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

interface Task {
  id: string
  title: string
  description?: string
  project_id: string
  user_id: string
  created_at: string
}

export default function TasksAdmin() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')

      if (!error && data) setTasks(data)
      setLoading(false)
    }

    fetchTasks()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Tasks</h1>
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Project</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Created At</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td className="border p-2">{task.id}</td>
                <td className="border p-2">{task.title}</td>
                <td className="border p-2">{task.project_id}</td>
                <td className="border p-2">{task.user_id}</td>
                <td className="border p-2">{new Date(task.created_at).toLocaleString()}</td>
                <td className="border p-2">
                  <button className="text-blue-600 hover:underline">Edit</button>
                  <button className="ml-3 text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
