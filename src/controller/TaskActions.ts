import { supabase } from '@/utils/supabaseClient'
import { TaskWithExtras } from '@/components/layout/types'
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
const msToSeconds = (ms: number) => Math.floor(ms / 1000)



dayjs.extend(duration);

export async function fetchTodayTasks(userId: string): Promise<TaskWithExtras[]> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
      user_id,
      project_id,
      start_time,
      pause_time,
      end_time,
      total_hours,
      task_date,
      created_at,
      status,
      project:projects(title)
    `)
    .eq('user_id', userId)
    .eq('task_date', todayStr);

  if (error) throw error;

  const result: TaskWithExtras[] = [];

  for (const task of tasks ?? []) {
    const { data: statusLogs, error: logErr } = await supabase
      .from('task_status')
      .select('status, pause_time, resume_time, created_at')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true });

    if (logErr) throw logErr;

let accumulatedSeconds = 0;

if (task.end_time && task.total_hours) {
  accumulatedSeconds += task.total_hours * 3600; 
}

    for (const log of statusLogs ?? []) {
      if (log.resume_time && log.pause_time) {
        const resume = dayjs(log.resume_time);
        const pause = dayjs(log.pause_time);
        const diff = pause.diff(resume, 'second');
        accumulatedSeconds += diff;
      }
    }

    const lastLog = statusLogs?.[statusLogs.length - 1];

    let taskStatus: 'running' | 'paused' | 'ended' = 'running';

    if (task.end_time || task.status === 'ended') {
      taskStatus = 'ended';
    } else if (lastLog?.status === 'pause') {
      taskStatus = 'paused';
    } else if (lastLog?.status === 'start' || lastLog?.status === 'resume') {
      taskStatus = 'running';
      const lastResume = lastLog?.resume_time;
      if (lastResume) {
        const now = dayjs();
        const liveDiff = now.diff(dayjs(lastResume), 'second');
        accumulatedSeconds += liveDiff;
      }
    }

    const lastPause = statusLogs?.filter(log => log.status === 'pause')?.pop()?.pause_time ?? null;
    const lastResume = statusLogs?.filter(log => log.status === 'resume' || log.status === 'start')?.pop()?.resume_time ?? null;

    result.push({
      ...task,
      project: Array.isArray(task.project) ? task.project[0] : task.project,
      accumulated_seconds: accumulatedSeconds,
      status: taskStatus,
      last_pause_time: lastPause,
      resume_time: lastResume,
    });
  }

  return result;
}

export async function getTotalHoursToday(userId: string) {
  const { data, error } = await supabase.rpc('get_total_hours_today', { user_id: userId })
  if (error) throw error
  return data
}

export async function handlePause(taskId: string, fetchTodayTasks: () => Promise<void>) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const pauseTime = dayjs().tz('Asia/Manila').format();

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', taskId)
    .single();

  if (taskError || !task?.project_id) {
    throw new Error('Unable to retrieve project_id for task');
  }

  const { data: lastStatus, error: statusError } = await supabase
    .from('task_status')
    .select('resume_time')
    .eq('task_id', taskId)
    .in('status', ['start', 'resume'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (statusError || !lastStatus?.resume_time) {
    throw new Error('No resume time found for pause');
  }

  const resumeTime = new Date(lastStatus.resume_time);
  const now = new Date(pauseTime);
  const totalSeconds = Math.floor((now.getTime() - resumeTime.getTime()) / 1000);
  const totalHours = totalSeconds / 3600;

  await supabase.from('task_status').insert({
    task_id: taskId,
    user_id: userId,
    project_id: task.project_id,
    resume_time: lastStatus.resume_time,
    pause_time: pauseTime,
    total_hours: totalHours,
    status: 'pause',
    task_date: new Date().toISOString().split('T')[0],
  });

  await supabase.from('tasks')
    .update({ pause_time: pauseTime })
    .eq('id', taskId);

  await fetchTodayTasks();
}

export async function handleResume(taskId: string, fetchTasks: () => Promise<void>) {
  const now = new Date();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) throw new Error('User not authenticated');

  type TaskData = {
    project_id: string;
    end_time: string | null;
    status: string | null;
  };

  const { data: task, error: taskErr } = await supabase
    .from('tasks')
    .select('project_id, end_time, status')
    .eq('id', taskId)
    .single<TaskData>();

  if (taskErr || !task) {
    console.warn('Task not found or error fetching it');
    return;
  }

  if (task.end_time || task.status === 'ended') {
    console.warn('Trying to resume an ended task.');
    return;
  }

  const { error } = await supabase.from('task_status').insert({
    task_id: taskId,
    user_id: userId,
    project_id: task.project_id,
    resume_time: now.toISOString(),
    status: 'resume',
    task_date: new Date().toISOString().split('T')[0],
  });

  if (error) throw error;
  await fetchTasks();
}


export async function handleEnd(taskId: string, fetchTasks: () => Promise<void>) {
  const now = new Date()

  const { data: lastResume, error: fetchErr } = await supabase
    .from('task_status')
    .select('*')
    .eq('task_id', taskId)
    .in('status', ['start', 'resume']) 
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchErr) {
    console.error('Error fetching last resume:', fetchErr.message)
    return
  }

  if (!lastResume) {
    console.warn('No resume entry found, skipping total time calculation.')
    return
  }

  const resumeTime = new Date(lastResume.resume_time)
  const totalSeconds = msToSeconds(now.getTime() - resumeTime.getTime())
  if (isNaN(totalSeconds) || totalSeconds <= 0) {
  console.warn("Invalid totalSeconds calculation", { resumeTime, now })
  return
}
  const totalHours = +(totalSeconds / 3600).toFixed(6)

  const { error: insertErr } = await supabase.from('task_status').insert({
    task_id: taskId,
    user_id: lastResume.user_id,
    project_id: lastResume.project_id,
    pause_time: now.toISOString(),
    total_hours: totalHours,
    status: 'end',
    task_date: new Date().toISOString().split('T')[0],
  })

  if (insertErr) throw insertErr

  const { data: statusLogs, error: fetchLogsErr } = await supabase
    .from('task_status')
    .select('total_hours')
    .eq('task_id', taskId)

  if (fetchLogsErr) throw fetchLogsErr

  const totalHoursSum = statusLogs?.reduce((sum, log) => sum + (log.total_hours ?? 0), 0)
  const safeTotalHours = isNaN(totalHoursSum) ? 0 : +(totalHoursSum).toFixed(6)

  const { error: updateErr } = await supabase
    .from('tasks')
    .update({
      end_time: now.toISOString(),
      total_hours: safeTotalHours,
      status: 'ended',
    })
    .eq('id', taskId)

  if (updateErr) throw updateErr

  await fetchTasks()
}

export async function handleStart(projectId: string, fetchTodayTasks: () => Promise<void>) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const todayStr = dayjs().format('YYYY-MM-DD');

  const { data: runningTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('task_date', todayStr)
    .is('end_time', null)
    .is('pause_time', null); 

  for (const t of runningTasks ?? []) {
    await handlePause(t.id, fetchTodayTasks);
  }

  const startTime = dayjs().tz('Asia/Manila').format();

  const { data: inserted, error: insertError } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      project_id: projectId,
      start_time: startTime,
      task_date: todayStr,
      status: 'running',
    })
    .select('id')
    .single();

  if (insertError) throw insertError;

  await supabase.from('task_status').insert({
    task_id: inserted.id,
    user_id: userId,
    project_id: projectId,
    resume_time: startTime,
    status: 'start',
    task_date: todayStr,
  });

  await fetchTodayTasks();
}
