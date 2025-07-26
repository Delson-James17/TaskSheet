import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { handleStart } from '@/controller/TaskActions'

interface Project {
  id: string
  title: string
}

interface Props {
  fetchTasks: () => Promise<void>
}

export function ProjectSelector({ fetchTasks }: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*')
      if (error) console.error('Error fetching projects:', error)
      if (data) setProjects(data)
    }
    fetchProjects()
  }, [])

  const handleStartClick = async () => {
    if (!selected) return
    await handleStart(selected, fetchTasks)
    setSelected('')
  }

  return (
    <div className="flex gap-4 mb-6">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border rounded px-3 py-2 w-64"
      >
        <option value="">Select a project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}
          </option>
        ))}
      </select>
      <button
        onClick={handleStartClick}
        disabled={!selected}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start Task
      </button>
    </div>
  )
}
