import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ProjectSelector } from '@/components/ProjectSelector'
import { TaskTable } from '@/components/TaskTable'
import { jwtDecode } from 'jwt-decode'

type DecodedToken = {
  user_role?: string
}

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
  const [permissions, setPermissions] = useState<string[]>([])
  const [isNewUser, setIsNewUser] = useState(false)
  const navigate = useNavigate()

  const fetchTodayTasks = async () => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tasks')
      .select('id, start_time, end_time, total_hours, status, projects(title)')
      .gte('start_time', `${today}T00:00:00`)
      .order('start_time', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      const transformed = data.map((task) => ({
        ...task,
        project: task.projects?.[0] || { title: 'Unknown' },
      }))
      setTasks(transformed as Task[])
    }
  }

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session) return navigate('/login')

      const authUser = session.user

      // Set user display info
      setUser({
        name: authUser.user_metadata?.full_name ?? 'Unknown',
        email: authUser.email ?? '',
        avatar: authUser.user_metadata?.avatar_url ?? '',
      })

      console.log('👉 Supabase Auth ID:', authUser.id)

      // ✅ Decode JWT to extract user_role
      const decoded = jwtDecode<DecodedToken>(session.access_token)
      const jwtRole = decoded.user_role
      console.log('🎭 Role from JWT:', jwtRole)

      if (jwtRole) {
        setRole(jwtRole)

        const { data: rolePerms, error: permError } = await supabase
          .rpc('get_permissions_by_role', { role_input: jwtRole })

        if (permError) {
          console.error('❌ Fetch Permissions Error:', permError)
        } else {
          const perms = rolePerms?.map((r: any) => r.name) ?? []
          console.log('✅ Permissions:', perms)
          setPermissions(perms)
        }
      } else {
        // 🔄 Fallback: fetch from profile table
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle()

        console.log('🧾 Fallback UserProfile:', userProfile)

        if (profileError || !userProfile?.role) {
          setRole('user')
          console.warn('⚠️ No role found, defaulting to "user"')
        } else {
          const fallbackRole = userProfile.role
          setRole(fallbackRole)

          const { data: fallbackPerms, error: fallbackPermsError } =
            await supabase.rpc('get_permissions_by_role', {
              role_input: fallbackRole,
            })

          if (fallbackPermsError) {
            console.error('❌ Permissions fallback error:', fallbackPermsError)
          } else {
            const perms = fallbackPerms?.map((r: any) => r.name) ?? []
            setPermissions(perms)
          }
        }
      }

      await fetchTodayTasks()

      if (localStorage.getItem('isNewUser') === 'true') {
        setIsNewUser(true)
        localStorage.removeItem('isNewUser')
      }
    }

    fetchUserAndTasks()
  }, [navigate])

  if (!permissions.includes('dashboard.view')) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        ❌ You do not have permission to view the Dashboard.
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarProvider>
        <AppSidebar user={user} role={role} permissions={permissions} />

        <div className="flex-1 ml-64 px-6 py-10">
          {isNewUser && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 ml-64 mt-4 mr-6">
              🎉 Welcome to TaskSheet! Here are 3 things to get started:
              <ul className="list-disc ml-6 mt-2 text-sm">
                <li>⏳ Start tracking your first task</li>
                <li>📁 Switch projects using the dropdown</li>
                <li>🧑‍💼 Update your profile anytime</li>
              </ul>
            </div>
          )}

          <h1 className="text-3xl font-bold mb-6">My Task Sheet</h1>

          <ProjectSelector fetchTasks={fetchTodayTasks} />
          <TaskTable tasks={tasks} fetchTasks={fetchTodayTasks} />
        </div>
      </SidebarProvider>
    </div>
  )
}
