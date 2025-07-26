export function UserTable({ users, onRefresh, onDelete, onToggleActive, onChangeRole }) {
  return (
    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-t">
            <td>{user.email}</td>
            <td>
              <select
                value={user.role}
                onChange={(e) => onChangeRole(user.id, e.target.value).then(onRefresh)}
                className="border rounded px-2 py-1"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>{user.is_active ? 'Active' : 'Inactive'}</td>
            <td className="flex gap-2">
              <button onClick={() => onDelete(user.id).then(onRefresh)} className="text-red-500">Delete</button>
              <button onClick={() => onToggleActive(user.id, !user.is_active).then(onRefresh)} className="text-blue-500">
                {user.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
