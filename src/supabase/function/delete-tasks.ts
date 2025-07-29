// // supabase/functions/delete-tasks.ts
// import { serve } from 'https://deno.land/std/http/server.ts'
// import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// serve(async (_req) => {
//   const supabase = createClient(
//     Deno.env.get(import.meta.env.VITE_SUPABASE_URL)!,
//     Deno.env.get(import.meta.env.VITE_SUPABASE_ROLE_KEY)!
//   )

//   await supabase.from('task_status').delete().neq('id', '')
//   await supabase.from('tasks').delete().neq('id', '')

//   return new Response('Tasks and statuses cleared', { status: 200 })
// })
