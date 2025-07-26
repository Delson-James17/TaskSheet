import {
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
  IconLock,
  IconUserPlus,
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
      url: '/dashboard',
      icon: IconLayoutDashboard,
    },
  ]

  const adminNav = [
    {
      title: 'Manage Users',
      url: '/admin/users',
      icon: IconUsers,
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: IconSettings,
    },
  ]

  const userNav = [
    {
      title: 'Profile',
      url: '/profile',
      icon: IconLock,
    },
  ]

  const onboardingNav =
    user.name === 'Unknown'
      ? [
          {
            title: 'Add Profile',
            url: '/add-profile',
            icon: IconUserPlus,
          },
        ]
      : []

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
        items: [...commonNav, ...onboardingNav],
      },
      {
        title: role === 'admin' ? 'Admin' : 'User',
        items: role === 'admin' ? adminNav : userNav,
      },
    ],
  }
}
