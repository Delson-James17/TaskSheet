import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/switch-toggle'

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table'

type Project = {
  id: string
  title: string
  description: string
  created_at: string
  created_by: string
}

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const [user, setUser] = useState({ name: '', email: '', avatar: '' })
  const [role, setRole] = useState('user')

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*')
    if (error) console.error(error)
    else setProjects(data as Project[])
  }

  const addProject = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ Failed to fetch user', userError)
      return
    }

    const { error } = await supabase.from('projects').insert({
      title,
      description,
      created_at: new Date(),
      created_by: user.id,
    })

    if (error) console.error(error)
    else {
      setTitle('')
      setDescription('')
      fetchProjects()
      setShowForm(false)
    }
  }

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id)
    fetchProjects()
  }

  const startEdit = (project: Project) => {
    setEditId(project.id)
    setEditTitle(project.title)
    setEditDescription(project.description)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditTitle('')
    setEditDescription('')
  }

  const saveEdit = async () => {
    if (!editId) return

    const { error } = await supabase
      .from('projects')
      .update({
        title: editTitle,
        description: editDescription,
      })
      .eq('id', editId)

    if (error) console.error(error)
    else {
      cancelEdit()
      fetchProjects()
    }
  }

  useEffect(() => {
    fetchProjects()

    const getUser = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const authUser = session.session.user
      setUser({
        name: authUser.user_metadata?.full_name ?? 'Unknown',
        email: authUser.email ?? '',
        avatar: authUser.user_metadata?.avatar_url ?? '',
      })
      setRole('admin')
    }

    getUser()
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <SidebarProvider>
          <AppSidebar user={user} role={role} permissions={[]} />

          <main className="flex-1 px-6 py-10">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Project Management</h1>
              <ThemeToggle />
            </div>

            <Button onClick={() => setShowForm(!showForm)} className="mb-4">
              {showForm ? 'Cancel' : 'Add New Project'}
            </Button>

            {showForm && (
              <div className="space-y-2 mb-6">
                <Input placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} />
                <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <Button onClick={addProject}>Submit</Button>
              </div>
            )}

            <div className="rounded-md border border-muted shadow-sm overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p, index) => (
                    <TableRow key={p.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {editId === p.id ? (
                          <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                        ) : (
                          p.title
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === p.id ? (
                          <Input value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                        ) : (
                          p.description
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {editId === p.id ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEdit}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => startEdit(p)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteProject(p.id)}>Delete</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </main>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  )
}
