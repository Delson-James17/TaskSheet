import {
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
  IconLock,
} from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const getSidebarData = (
  user: { name: string; email: string; avatar: string },
  role: string
): SidebarData => {
  const commonNav = [
    {
      title: 'Dashboard',
      url: '/',
      icon: IconLayoutDashboard,
    },
  ]

  const adminNav = [
    { title: 'Manage Users', url: '/admin/users', icon: IconUsers },
    { title: 'Settings', url: '/admin/settings', icon: IconSettings },
  ]

  const userNav = [
    { title: 'Profile', url: '/profile', icon: IconLock },
  ]

  return {
    user,
    teams: [
      {
        name: 'My Team',
        logo: Command,
        plan: 'Pro',
      },
    ],
    navGroups: [
      {
        title: 'General',
        items: commonNav,
      },
      {
        title: role === 'admin' ? 'Admin' : 'User',
        items: role === 'admin' ? adminNav : userNav,
      },
    ],
  }
}
