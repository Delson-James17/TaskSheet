import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ProjectSelector } from '@/components/ProjectSelector'
import { TaskTable } from '@/components/TaskTable'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/switch-toggle'
import { fetchTodayTasks } from '@/controller/TaskActions'
import { TaskWithExtras } from '@/components/layout/types'

export default function Dashboard() {
  const [tasks, setTasks] = useState<TaskWithExtras[]>([])
  const [user, setUser] = useState({ id: '', name: '', email: '', avatar: '' }) // ✅ include id
  const [role, setRole] = useState<string>('user')
  const [isNewUser, setIsNewUser] = useState(false)
  const navigate = useNavigate()

  const loadTasks = async (userId: string) => {
    try {
      const todayTasks = await fetchTodayTasks(userId)
      setTasks(todayTasks)
    } catch (error) {
      console.error("Failed to load today's tasks:", error)
    }
  }

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return navigate('/login')

      const authUser = session.session.user

      // ✅ Save user ID so we can pass it to fetchTodayTasks
      setUser({
        id: authUser.id,
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

      await loadTasks(authUser.id)

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

            <ProjectSelector fetchTasks={() => loadTasks(user.id)} />
            <TaskTable tasks={tasks} fetchTasks={() => loadTasks(user.id)} />
          </main>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}
