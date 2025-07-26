import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ProjectSelector } from '@/components/ProjectSelector'
import { TaskTable } from '@/components/TaskTable'

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

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [user, setUser] = useState({ name: '', email: '', avatar: '' })
  const [role, setRole] = useState('user')
  const navigate = useNavigate()

  const fetchTodayTasks = async () => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tasks')
      .select('id, start_time, end_time, total_hours, status, project:title')
      .gte('start_time', `${today}T00:00:00`)
      .order('start_time', { ascending: false })

    if (error) console.error(error)
    else setTasks(data as Task[])
  }

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return navigate('/login')

      const userId = session.session.user.id
      const { user: authUser } = session.session

      setUser({
        name: authUser.user_metadata?.name ?? 'Unknown',
        email: authUser.email ?? '',
        avatar: authUser.user_metadata?.avatar_url ?? '',
      })

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError || !profile) return

      setRole(profile.role)

      if (profile.role !== 'admin') {
        await fetchTodayTasks()
      }
    }

    fetchUserAndTasks()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarProvider>
        <AppSidebar user={user} role={role} />

        <div className="flex-1 ml-64 px-6 py-10">
          <h1 className="text-3xl font-bold mb-6">My Task Sheet</h1>

          <ProjectSelector fetchTasks={fetchTodayTasks} />

          <TaskTable tasks={tasks} fetchTasks={fetchTodayTasks} />
        </div>
      </SidebarProvider>
    </div>
  )
}
