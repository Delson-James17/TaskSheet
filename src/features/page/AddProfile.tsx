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

      // Fetch email and full_name from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single()

      if (profileError || !profileData) {
        setError('Failed to load profile information')
        return
      }

      setEmail(profileData.email ?? '')
      setFullName(profileData.full_name ?? '')
    }
    fetchUser()
  }, [navigate])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        age: age === '' ? null : age,
        address: address || null,
        phone_number: phone || null
      })
      .eq('id', userId)

    if (profileError) {
      setError(profileError.message)
      return
    }

    setSuccess('Profile updated successfully!')
    navigate('/dashboard')
  }

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label>Email</Label>
              <Input value={email} disabled />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input value={fullName} disabled />
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
