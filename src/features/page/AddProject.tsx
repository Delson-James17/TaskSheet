import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function AddProject() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

  const handleAddProject = async () => {
    const { error } = await supabase.from('projects').insert([{ title, description }])
    if (error) return setMessage(`Error: ${error.message}`)
    setMessage('Project added successfully!')
    setTitle('')
    setDescription('')
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <Label>Title</Label>
      <Input value={title} onChange={e => setTitle(e.target.value)} />
      <Label>Description</Label>
      <Input value={description} onChange={e => setDescription(e.target.value)} />
      <Button className="mt-2" onClick={handleAddProject}>Save Project</Button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  )
}
