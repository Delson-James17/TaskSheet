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

  try {
    // Upload avatar to Supabase Storage
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${userId}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: avatarFile.type,
        })

      if (uploadError) {
        setError('Failed to upload avatar')
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      avatar_url = publicUrlData.publicUrl
    }

    // Update existing profile instead of insert
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url,
        role: 'user', // optional, if you want to default every profile
      })
      .eq('id', userId)

    if (updateError) {
      setError('Failed to update profile: ' + updateError.message)
      return
    }

    // Optional: Notify admin (just for async logging/notification)
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
