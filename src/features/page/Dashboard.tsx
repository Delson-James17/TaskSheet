import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

type Task = {
  id: string
  start_time: string
  end_time: string
  total_hours: number
  project: {
    title: string
  }
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [user, setUser] = useState({ name: '', email: '', avatar: '' }) // ✅ Add this
  const [role, setRole] = useState('user') // ✅ Add this
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTasks = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return navigate('/login')

      const userId = session.session.user.id
      const { user: authUser } = session.session

      // ✅ Set user
      setUser({
        name: authUser.user_metadata?.name ?? 'Unknown',
        email: authUser.email ?? '',
        avatar: authUser.user_metadata?.avatar_url ?? '',
      })

      // ✅ Fetch role from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError || !profile) return

      setRole(profile.role)

      if (profile.role !== 'admin') {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('id, start_time, end_time, total_hours, project:title')
          .order('start_time', { ascending: false })

        if (error) console.error(error)
        else setTasks(tasks as Task[])
      }
    }

    fetchTasks()
  }, [])
  return (
    
    <div className="flex min-h-screen bg-background">
       <SidebarProvider>
     <AppSidebar user={user} role={role} />

      {/* Main content */}
      <div className="flex-1 ml-64 px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">My Task Sheet</h1>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-blue-100">
              <tr>
                <th className="text-left py-3 px-4">Project</th>
                <th className="text-left py-3 px-4">Start (Date & Time)</th>
                <th className="text-left py-3 px-4">End (Date & Time)</th>
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
                    <div className="flex gap-2 justify-center">
                      <button className="bg-yellow-500 px-2 py-1 text-white rounded text-sm">Pause</button>
                      <button className="bg-green-600 px-2 py-1 text-white rounded text-sm">Resume</button>
                      <button className="bg-red-600 px-2 py-1 text-white rounded text-sm">End</button>
                    </div>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">No tasks yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
       </SidebarProvider>
    </div>
  )
}
