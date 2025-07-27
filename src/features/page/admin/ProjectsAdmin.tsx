import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Project = {
  id: string
  title: string
  description: string
  created_at: string
  created_by: string
}

export default function ProjectsAdmin() {
  // ✅ Use the type in useState
  const [projects, setProjects] = useState<Project[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*')
    if (error) console.error(error)
    else setProjects(data as Project[]) // Optional type assertion
  }

  const addProject = async () => {
    const { error } = await supabase.from('projects').insert({
      title,
      description,
      created_at: new Date(),
    })
    if (error) console.error(error)
    else {
      setTitle('')
      setDescription('')
      fetchProjects()
    }
  }

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id)
    fetchProjects()
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Project Management</h1>
      <div className="space-y-2">
        <Input placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Button onClick={addProject}>Add Project</Button>
      </div>
      <div className="mt-6 space-y-4">
        {projects.map((p) => (
          <div key={p.id} className="flex justify-between items-center bg-gray-800 p-3 rounded">
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-gray-400">{p.description}</p>
            </div>
            <Button onClick={() => deleteProject(p.id)} variant="destructive">Delete</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
