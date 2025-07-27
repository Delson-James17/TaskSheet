import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function RolePermissionsAdmin() {
  const [roles, setRoles] = useState<string[]>([])
  const [permissions, setPermissions] = useState<string[]>([])
  const [rolePermissions, setRolePermissions] = useState<Record<string, Set<string>>>({})

  useEffect(() => {
    const fetchData = async () => {
      const { data: roleData } = await supabase.from('roles').select('name')
      const { data: permData } = await supabase.from('permissions').select('name')
      const { data: rpData } = await supabase.from('role_permissions').select('*')

      const roleMap: Record<string, Set<string>> = {}
      for (const r of roleData ?? []) roleMap[r.name] = new Set()
      for (const rp of rpData ?? []) roleMap[rp.role]?.add(rp.permission)

      setRoles(roleData?.map((r) => r.name) ?? [])
      setPermissions(permData?.map((p) => p.name) ?? [])
      setRolePermissions(roleMap)
    }

    fetchData()
  }, [])

  const togglePermission = async (role: string, permission: string) => {
    const has = rolePermissions[role]?.has(permission)

    if (has) {
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role)
        .eq('permission', permission)
    } else {
      await supabase.from('role_permissions').insert({ role, permission })
    }

    setRolePermissions((prev) => {
      const updated = new Set(prev[role])
      has ? updated.delete(permission) : updated.add(permission)
      return { ...prev, [role]: updated }
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Role Permissions</h2>
      <table className="table-auto border-collapse border border-gray-700 w-full">
        <thead>
          <tr>
            <th className="border border-gray-700 p-2">Permission</th>
            {roles.map((role) => (
              <th key={role} className="border border-gray-700 p-2">{role}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm}>
              <td className="border border-gray-700 p-2">{perm}</td>
              {roles.map((role) => (
                <td key={role} className="border border-gray-700 p-2 text-center">
                  <input
                    type="checkbox"
                    checked={rolePermissions[role]?.has(perm) ?? false}
                    onChange={() => togglePermission(role, perm)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
