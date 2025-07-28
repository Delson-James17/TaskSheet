import { supabase } from '@/utils/supabaseClient'

/**
 * Convert milliseconds to seconds (rounded down)
 */
const msToSeconds = (ms: number) => Math.floor(ms / 1000)

/**
 * Get today's tasks for a specific user
 */
export async function fetchTodayTasks(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('tasks')
    .select('id, start_time, end_time, status, total_hours, accumulated_seconds, project(title)')
    .eq('user_id', userId)
    .gte('start_time', today.toISOString())

  if (error) throw error
  return data
}

/**
 * Get total hours today via Supabase RPC
 */
export async function getTotalHoursToday(userId: string) {
  const { data, error } = await supabase
    .rpc('get_total_hours_today', { user_id: userId })

  if (error) throw error
  return data
}

/**
 * Pause the task — add time since last resume to accumulated_seconds
 */
export async function handlePause(
  taskId: string,
  _startTime: string, // unused, always fetch fresh
  _totalHours: number | null,
  fetchTodayTasks: () => Promise<void>
) {
  const now = new Date()

  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('start_time, accumulated_seconds')
    .eq('id', taskId)
    .single()

  if (fetchError) throw fetchError
  if (!task) throw new Error('Task not found')

  const start = new Date(task.start_time)
  const diffSeconds = msToSeconds(now.getTime() - start.getTime())
  const accumulated = (task.accumulated_seconds ?? 0) + diffSeconds

  const { error } = await supabase
    .from('tasks')
    .update({
      end_time: now.toISOString(),
      accumulated_seconds: accumulated,
      status: 'paused'
    })
    .eq('id', taskId)

  if (error) throw error
  await fetchTodayTasks()
}

/**
 * Resume a task — reset start_time, keep accumulated_seconds
 */
export async function handleResume(
  taskId: string,
  fetchTodayTasks: () => Promise<void>
) {
  const now = new Date().toISOString()

  // Pause other running tasks
  const { data: runningTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('status', 'running')

  if (runningTasks?.length) {
    for (const task of runningTasks) {
      await supabase
        .from('tasks')
        .update({
          end_time: now,
          status: 'paused'
        })
        .eq('id', task.id)
    }
  }

  // Resume selected task
  const { error } = await supabase
    .from('tasks')
    .update({
      start_time: now,
      end_time: null,
      status: 'running'
    })
    .eq('id', taskId)

  if (error) throw error
  await fetchTodayTasks()
}

/**
 * End task — finalize accumulated time and calculate total_hours
 */
export async function handleEnd(
  taskId: string,
  _startTime: string,
  _totalHours: number | null,
  fetchTodayTasks: () => Promise<void>
) {
  const now = new Date()

  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('start_time, accumulated_seconds')
    .eq('id', taskId)
    .single()

  if (fetchError) throw fetchError
  if (!task) throw new Error('Task not found')

  const start = new Date(task.start_time)
  const diffSeconds = msToSeconds(now.getTime() - start.getTime())

  const previous = task.accumulated_seconds ?? 0
  const totalSeconds = previous + diffSeconds
  const totalHours = +(totalSeconds / 3600).toFixed(6)

  console.log({
    start: task.start_time,
    end: now.toISOString(),
    diffSeconds,
    previous,
    totalSeconds,
    totalHours
  })

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      end_time: now.toISOString(),
      accumulated_seconds: totalSeconds,
      total_hours: totalHours,
      status: 'ended'
    })
    .eq('id', taskId)

  if (updateError) throw updateError
  await fetchTodayTasks()
}

/**
 * Start a new task — one running task per user per day per project
 */
export async function handleStart(
  projectId: string,
  fetchTodayTasks: () => Promise<void>
) {
  const { data: session } = await supabase.auth.getSession()
  const userId = session?.session?.user?.id
  if (!userId) throw new Error('Not authenticated')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: existing, error: checkError } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .gte('start_time', today.toISOString())

  if (checkError) throw checkError
  if (existing && existing.length > 0) {
    alert('This project is already in your task sheet today.')
    return
  }

  // Pause other running tasks
  const { data: runningTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('status', 'running')

  if (runningTasks?.length) {
    for (const task of runningTasks) {
      await supabase
        .from('tasks')
        .update({
          end_time: new Date().toISOString(),
          status: 'paused'
        })
        .eq('id', task.id)
    }
  }

  // Start new task
  const { error: insertError } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      project_id: projectId,
      start_time: new Date().toISOString(),
      accumulated_seconds: 0,
      total_hours: 0,
      status: 'running'
    })

  if (insertError) throw insertError
  await fetchTodayTasks()
}
