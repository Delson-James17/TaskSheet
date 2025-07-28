import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { ThemeToggle } from '@/components/switch-toggle'
import { ThemeProvider } from '@/components/theme-provider'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'

type Project = {
  id: string
  title: string
  description: string
  created_at: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch projects:', error)
      } else {
        setProjects(data)
      }
    }

    fetchProjects()
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Projects</CardTitle>
            <ThemeToggle />
          </CardHeader>
          <CardContent className="mt-4">
            {projects.length === 0 ? (
              <p className="text-muted-foreground">No projects found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border border-border rounded">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="py-2 px-4 border">Title</th>
                      <th className="py-2 px-4 border">Description</th>
                      <th className="py-2 px-4 border">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-t hover:bg-muted/30">
                        <td className="py-2 px-4">{project.title}</td>
                        <td className="py-2 px-4">{project.description}</td>
                        <td className="py-2 px-4">
                          {new Date(project.created_at).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  )
}
