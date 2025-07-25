import { supabase } from '@/utils/supabaseClient'

export async function startTask(projectId: string) {
  const user = (await supabase.auth.getUser()).data.user
  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    user_id: user?.id,
    start_time: new Date(),
    status: 'started'
  })
  if (error) throw error
}

export async function pauseTask(taskId: string) {
  const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).single()
  const now = new Date()
  const seconds = Math.floor((now.getTime() - new Date(task.start_time).getTime()) / 1000)
  const newAccumulated = (task.accumulated_seconds || 0) + seconds

  const { error } = await supabase.from('tasks').update({
    pause_time: now,
    accumulated_seconds: newAccumulated,
    status: 'paused'
  }).eq('id', taskId)
  if (error) throw error
}

export async function resumeTask(taskId: string) {
  const { error } = await supabase.from('tasks').update({
    resume_time: new Date(),
    status: 'resumed'
  }).eq('id', taskId)
  if (error) throw error
}

export async function endTask(taskId: string) {
  const now = new Date()
  const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).single()

  let totalSeconds = task.accumulated_seconds || 0
  if (task.resume_time) {
    totalSeconds += Math.floor((now.getTime() - new Date(task.resume_time).getTime()) / 1000)
  }

  const totalHours = (totalSeconds / 3600).toFixed(2)

  const { error } = await supabase.from('tasks').update({
    end_time: now,
    total_hours: parseFloat(totalHours),
    status: 'ended'
  }).eq('id', taskId)

  if (error) throw error
}
