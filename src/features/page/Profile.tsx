import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    age: '',
    address: '',
    phone_number: ''
  })
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfileAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate('/login')

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setForm({
          full_name: profileData.full_name || '',
          age: profileData.age?.toString() || '',
          address: profileData.address || '',
          phone_number: profileData.phone_number || ''
        })
      }

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setError('Failed to load profile')
      }

      // Get user role from joined table
      const { data: roleData, error: roleError } = await supabase
        .from('User_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .single()

      const userRole = roleData?.[0]?.roles?.name ?? 'user'
      setRole(userRole)

      if (roleError) {
        console.error('Error fetching role:', roleError)
      }
    }

    fetchProfileAndRole()
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleUpdate = async () => {
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: form.full_name,
        age: parseInt(form.age),
        address: form.address,
        phone_number: form.phone_number,
      })
      .eq('id', user.id)

    if (error) {
      setError('Failed to update profile.')
    } else {
      setProfile({ ...profile, ...form })
      setIsEditing(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-6">
      <div className="bg-black p-6 rounded shadow-md w-full max-w-md text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Profile</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} title="Edit Profile">
              <Pencil className="text-white w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {['full_name', 'age', 'address', 'phone_number'].map((field) => (
            <div key={field}>
              <label className="block capitalize">{field.replace('_', ' ')}</label>
              {isEditing ? (
                <input
                  name={field}
                  value={(form as any)[field]}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-black"
                />
              ) : (
                <p className="border p-2 rounded">{profile?.[field]}</p>
              )}
            </div>
          ))}

          {/* Role field - read only */}
          <div>
            <label className="block">Role</label>
            <p className="border p-2 rounded capitalize">{role}</p>
          </div>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {isEditing && (
          <button
            onClick={handleUpdate}
            className="mt-4 bg-blue-600 w-full py-2 rounded text-white"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  )
}
