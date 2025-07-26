import {
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
  IconLock,
  IconUserPlus,
} from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

type UserWithAvatar = {
  name: string
  email: string
  avatar: string
}

export const getSidebarData = (
  user: UserWithAvatar,
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

  // Onboarding shown if user has no real name
  const isOnboarding = !user.name || user.name.toLowerCase() === 'unknown'

  const onboardingNav = isOnboarding
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
        items: commonNav,
      },
      ...(onboardingNav.length > 0
        ? [
            {
              title: 'Onboarding',
              items: onboardingNav,
            },
          ]
        : []),
      {
        title: role === 'admin' ? 'Admin' : 'User',
        items: role === 'admin' ? adminNav : userNav,
      },
    ],
  }
}
