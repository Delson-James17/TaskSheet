import { useEffect, useState } from 'react'
import { fetchUsers, deleteUser, updateUserRole, toggleUserActive } from '@/controller/UserController'
import { UserTable } from '@/components/UserTable'

type User = {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])

  const loadUsers = async () => {
    const data = await fetchUsers()
    setUsers(data)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <UserTable
        users={users}
        onRefresh={loadUsers}
        onDelete={deleteUser}
        onToggleActive={toggleUserActive}
        onChangeRole={updateUserRole}
      />
    </div>
  )
}
