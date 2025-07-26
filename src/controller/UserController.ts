import { supabase } from '@/utils/supabaseClient'

export const fetchUsers = async () => {
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) console.error('Fetch users error', error)
  return data || []
}

export const deleteUser = async (id: string) => {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) console.error('Delete user error', error)
}

export const updateUserRole = async (id: string, role: string) => {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) console.error('Update role error', error)
}

export const toggleUserActive = async (id: string, isActive: boolean) => {
  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', id)
  if (error) console.error('Toggle active error', error)
}
