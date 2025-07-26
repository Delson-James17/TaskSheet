import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

export default function AddProfile() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return navigate('/login')
      setUserId(user.id)
      setEmail(user.email ?? '')
    }
    fetchUser()
  }, [navigate])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // ✅ 1. Get role_id for 'user'
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'user')
      .single()

    if (roleError || !roleData) {
      setError('Failed to get role for user')
      return
    }

    // ✅ 2. Insert profile with role_id
    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: userId,
        email,
        full_name: fullName,
        age: age === '' ? null : age,
        address: address || null,
        phone_number: phone || null,
        role_id: '106dcdf0-5560-499a-b55a-076ccf96f165'
      }
    ])

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess('Profile saved successfully!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add Profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label>Email</Label>
              <Input value={email} disabled />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" value={age} onChange={e => setAge(Number(e.target.value))} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Save</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
