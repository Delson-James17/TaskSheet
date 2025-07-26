import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AddProfile() {
  const [fullName, setFullName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
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
    if (!fullName.trim()) {
      setError('Full name is required')
      return false
    }
    return true
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!validate()) return

    let avatar_url = ''

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${userId}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        setError('Failed to upload avatar')
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      avatar_url = data.publicUrl
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      full_name: fullName,
      avatar_url,
      role: 'user',
    })

    if (insertError) {
      setError('Failed to save profile: ' + insertError.message)
      return
    }

    // Optional: Send notification email to admin (implement via Supabase function or backend API)
    await fetch('/api/notify-admin', {
      method: 'POST',
      body: JSON.stringify({ userId, fullName }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(console.warn)

    localStorage.setItem('isNewUser', 'true')
    navigate('/dashboard')
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-6 shadow-md rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="mb-4"
        />

        {avatarPreview && (
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
        )}

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
