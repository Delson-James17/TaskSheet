import {
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
  IconUserPlus,
  IconBriefcase,
  IconCalendarEvent,
  IconClock,
  IconDatabase,
  IconUserCheck,
  IconIdBadge,
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
  _role: string, // ignored for now
  _permissions: string[] // ignored for now
): SidebarData => {
  const isOnboarding = !user.name || user.name.toLowerCase() === 'unknown'

  const commonNav = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconLayoutDashboard,
    },
  ]

  const onboardingNav = isOnboarding
    ? [
        {
          title: 'Add Profile',
          url: '/add-profile',
          icon: IconUserPlus,
        },
      ]
    : []

  // Show all admin features regardless of role or permission
  const fullAdminNav = [
    { title: 'Manage Users', url: '/admin/users', icon: IconUsers },
    { title: 'Projects', url: '/admin/projects', icon: IconBriefcase },
    { title: 'Tasks', url: '/admin/tasks', icon: IconCalendarEvent },
    { title: 'Timesheets', url: '/admin/timesheets', icon: IconClock },
    { title: 'Timesheet Bank', url: '/admin/timesheet-bank', icon: IconDatabase },
    { title: 'User Roles', url: '/admin/user-roles', icon: IconUserCheck },
    { title: 'Roles', url: '/admin/roles', icon: IconIdBadge },
    { title: 'Settings', url: '/admin/settings', icon: IconSettings },
  ]

  const userNav = [
    { title: 'Projects', url: '/projects', icon: IconBriefcase },
    { title: 'Tasks', url: '/tasks', icon: IconCalendarEvent },
    { title: 'Timesheets', url: '/timesheets', icon: IconClock },
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
      { title: 'General', items: commonNav },
      ...(onboardingNav.length > 0
        ? [{ title: 'Onboarding', items: onboardingNav }]
        : []),
      { title: 'Admin', items: fullAdminNav },
      { title: 'User', items: userNav },
    ],
  }
}
