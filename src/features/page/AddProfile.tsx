import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AddProfile() {
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  const validate = () => {
    if (!fullName.trim()) return setError('Full name is required'), false
    if (!age.trim()) return setError('Age is required'), false
    if (!address.trim()) return setError('Address is required'), false
    if (!phoneNumber.trim()) return setError('Phone number is required'), false
    return true
  }

  const handleSubmit = async () => {
    setError('')
    if (!validate()) return

    try {
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            full_name: fullName,
            age: parseInt(age),
            address,
            phone_number: phoneNumber,
            role: 'user',
          }
        ])

      if (insertError) {
        setError('Failed to insert profile: ' + insertError.message)
        return
      }

      await fetch('/api/notify-admin', {
        method: 'POST',
        body: JSON.stringify({ userId, fullName }),
        headers: { 'Content-Type': 'application/json' },
      }).catch(console.warn)

      localStorage.setItem('isNewUser', 'true')
      navigate('/dashboard')

    } catch (err: any) {
      console.error(err)
      setError('An unexpected error occurred')
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-black p-6 shadow-md rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Complete Your Profile</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        {error && (
          <div className="text-red-500 mb-2">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Save & Continue
        </button>
      </div>
    </div>
  )
}
