import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

type Project = {
  id: string
  title: string
}

interface ProjectSelectorProps {
  fetchTasks: () => void
}

export const ProjectSelector = ({ fetchTasks }: ProjectSelectorProps) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, title')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch projects:', error)
    } else {
      setProjects(data)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(e.target.value)
    fetchTasks()
    // optional: you can store selectedProjectId in context/localStorage if needed
  }

  return (
    <div className="mb-6">
      <select
        value={selectedProjectId}
        onChange={handleSelect}
        className="p-2 rounded border bg-background text-foreground"
      >
        <option value="">Select a project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}
          </option>
        ))}
      </select>
      <button
        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={fetchTasks}
      >
        Start Task
      </button>
    </div>
  )
}
