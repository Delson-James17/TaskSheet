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
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return navigate('/login')

      const authUser = session.session.user
      const userId = authUser.id

      setUser({
        name: authUser.user_metadata?.full_name ?? 'Unknown',
        email: authUser.email ?? '',
        avatar: authUser.user_metadata?.avatar_url ?? '',
      })

    type RoleJoinResult = {
      roles: {
        name: string;
      };
    };

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)
      .maybeSingle() as { data: RoleJoinResult | null, error: any };
      
      const userRole = roleData?.roles?.name ?? 'user';
      setRole(userRole)
      if (roleError) {
        console.error('Error fetching role:', roleError)
      }
      if (userRole !== 'admin') {
        await fetchTodayTasks()
      }

      if (localStorage.getItem('isNewUser') === 'true') {
        setIsNewUser(true)
        localStorage.removeItem('isNewUser')
      }
    }

    fetchUserAndTasks()
  }, [navigate])

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarProvider>
        <AppSidebar user={user} role={role} />
        
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
