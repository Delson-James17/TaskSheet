
import { supabase } from '@/utils/supabaseClient'

export async function attemptLogin(email: string, password: string) {
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('failed_attempts, is_locked')
    .eq('email', email)
    .single()

  if (userProfile?.is_locked) {
    return { error: 'Account is locked due to too many failed login attempts.' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    await supabase.rpc('increment_failed_attempts', { email_param: email })
    return { error: 'Invalid credentials' }
  }

  await supabase
    .from('profiles')
    .update({ failed_attempts: 0, is_locked: false })
    .eq('email', email)

  return { data }
}
