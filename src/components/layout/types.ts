export interface User {
  name: string
  email: string
  avatar: string
}

export interface Team {
  name: string
  logo: React.ElementType
  plan: string
}

export interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
  perm?: string
}

export type NavLink = BaseNavItem & {
  url: string
  items?: never
}

export type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string })[]
  url?: never
}

export type NavItem = NavCollapsible | NavLink

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface SidebarData {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

// --- Task System Types ---

export interface Task {
  id: string
  user_id: string
  project_id: string
  start_time: string
  pause_time: string | null
  end_time: string | null
  total_hours: number | null
  task_date: string
  created_at: string
  project?: {
    title: string
  }
}

export interface TaskWithExtras extends Task {
  accumulated_seconds?: number
  status: 'running' | 'paused' | 'ended'
  last_pause_time?: string | null;
  resume_time?: string | null
}

export interface TaskStatus {
  id: string
  task_id: string
  user_id: string
  project_id: string
  pause_time: string | null
  resume_time: string | null
  total_hours: number | null
  status: 'start' | 'pause' | 'resume' | 'end'
  task_date: string
  created_at: string
}
