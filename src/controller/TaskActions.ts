import { supabase } from '@/utils/supabaseClient'

export async function handlePause(
  taskId: string,
  startTime: string,
  totalHours: number | null,
  fetchTodayTasks: () => Promise<void>
) {
  const now = new Date()
  const start = new Date(startTime)
  const duration = (now.getTime() - start.getTime()) / 3600000

  const { error } = await supabase
    .from('tasks')
    .update({
      end_time: now.toISOString(),
      total_hours: (totalHours ?? 0) + duration,
      status: 'paused'
    })
    .eq('id', taskId)

  if (!error) await fetchTodayTasks()
}

export async function handleResume(
  projectId: string,
  fetchTodayTasks: () => Promise<void>
) {
  const { data: runningTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('status', 'running')

  if (runningTasks?.length) {
    for (const task of runningTasks) {
      await supabase.from('tasks').update({
        end_time: new Date().toISOString(),
        status: 'paused'
      }).eq('id', task.id)
    }
  }

  await supabase.from('tasks').insert({
    project_id: projectId,
    start_time: new Date().toISOString(),
    status: 'running'
  })

  await fetchTodayTasks()
}

export async function handleEnd(
  taskId: string,
  startTime: string,
  totalHours: number | null,
  fetchTodayTasks: () => Promise<void>
) {
  const now = new Date()
  const start = new Date(startTime)
  const duration = (now.getTime() - start.getTime()) / 3600000

  const { data: task } = await supabase
    .from('tasks')
    .update({
      end_time: now.toISOString(),
      total_hours: (totalHours ?? 0) + duration,
      status: 'ended'
    })
    .eq('id', taskId)
    .select()
    .single()

  if (task) {
    await supabase.from('task_bank').insert(task)
  }

  await fetchTodayTasks()
}
export async function handleStart(
  projectId: string,
  fetchTodayTasks: () => Promise<void>
) {
  // End all running tasks before starting a new one
  const { data: runningTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('status', 'running')

  if (runningTasks?.length) {
    for (const task of runningTasks) {
      await supabase.from('tasks').update({
        end_time: new Date().toISOString(),
        status: 'paused'
      }).eq('id', task.id)
    }
  }

  const { data: session } = await supabase.auth.getSession()
  const userId = session?.session?.user?.id
  if (!userId) throw new Error("Not authenticated")

  await supabase.from('tasks').insert({
    user_id: userId,
    project_id: projectId,
    start_time: new Date().toISOString(),
    status: 'running'
  })

  await fetchTodayTasks()
}

