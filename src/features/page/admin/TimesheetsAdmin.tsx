// src/features/page/TimesheetsAdmin.tsx

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

interface Timesheet {
  id: string
  task_id: string
  user_id: string
  start_time: string
  end_time: string
  total_hours: number
}

export default function TimesheetsAdmin() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimesheets = async () => {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')

      if (!error && data) setTimesheets(data)
      setLoading(false)
    }

    fetchTimesheets()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Timesheets</h1>
      {loading ? (
        <p>Loading timesheets...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Task</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Start Time</th>
              <th className="border p-2">End Time</th>
              <th className="border p-2">Total Hours</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map(entry => (
              <tr key={entry.id}>
                <td className="border p-2">{entry.id}</td>
                <td className="border p-2">{entry.task_id}</td>
                <td className="border p-2">{entry.user_id}</td>
                <td className="border p-2">{new Date(entry.start_time).toLocaleString()}</td>
                <td className="border p-2">{new Date(entry.end_time).toLocaleString()}</td>
                <td className="border p-2">{entry.total_hours.toFixed(2)}</td>
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
