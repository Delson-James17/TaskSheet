import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ProjectSelector } from '@/components/ProjectSelector'
import { TaskTable } from '@/components/TaskTable'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/switch-toggle'

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
  const [role, setRole] = useState<string>('user')
  const [isNewUser, setIsNewUser] = useState(false)
  const navigate = useNavigate()

  const fetchTodayTasks = async () => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tasks')
      .select('id, start_time, end_time, total_hours, status, project:project_id(title)')
      .gte('start_time', `${today}T00:00:00`)
      .order('start_time', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      const transformed = data.map((task: any) => ({
        ...task,
        project: Array.isArray(task.project) ? task.project[0] : task.project ?? { title: 'Unknown' },
      }))
      setTasks(transformed as Task[])
    }
  }

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return navigate('/login')

      const authUser = session.session.user

      setUser({
        name: authUser.user_metadata?.full_name ?? 'Unknown',
        email: authUser.email ?? '',
        avatar: authUser.user_metadata?.avatar_url ?? '',
      })

      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .maybeSingle()

      if (profileError || !userProfile?.role) {
        console.warn('No role found; defaulting to "user".', profileError)
        setRole('user')
      } else {
        setRole(userProfile.role)
      }

      await fetchTodayTasks()

      if (localStorage.getItem('isNewUser') === 'true') {
        setIsNewUser(true)
        localStorage.removeItem('isNewUser')
      }
    }

    fetchUserAndTasks()
  }, [navigate])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-screen bg-background text-foreground">
        <SidebarProvider>
          <AppSidebar user={user} role={role} permissions={[]} />

          <main className="flex-1 px-6 py-10">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">My Task Sheet</h1>
              <ThemeToggle />
            </div>

            {isNewUser && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                🎉 Welcome to TaskSheet! Here are 3 things to get started:
                <ul className="list-disc ml-6 mt-2 text-sm">
                  <li>⏳ Start tracking your first task</li>
                  <li>📁 Switch projects using the dropdown</li>
                  <li>🧑‍💼 Update your profile anytime</li>
                </ul>
              </div>
            )}

            <ProjectSelector fetchTasks={fetchTodayTasks} />
            <TaskTable tasks={tasks} fetchTasks={fetchTodayTasks} />
          </main>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}
