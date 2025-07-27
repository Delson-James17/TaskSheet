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
  role: string,
  permissions: string[]
): SidebarData => {
  const isAdmin = role === 'admin'
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

  const adminNav = [
    { title: 'Manage Users', url: '/admin/users', icon: IconUsers, perm: 'view.manage_users' },
    { title: 'Projects', url: '/admin/projects', icon: IconBriefcase, perm: 'view.projects' },
    { title: 'Tasks', url: '/admin/tasks', icon: IconCalendarEvent, perm: 'view.tasks' },
    { title: 'Timesheets', url: '/admin/timesheets', icon: IconClock, perm: 'view.timesheets' },
    { title: 'Timesheet Bank', url: '/admin/timesheet-bank', icon: IconDatabase, perm: 'view.timesheet_bank' },
    { title: 'User Roles', url: '/admin/user-roles', icon: IconUserCheck, perm: 'view.user_roles' },
    { title: 'Roles', url: '/admin/roles', icon: IconIdBadge, perm: 'view.roles' },
    { title: 'Settings', url: '/admin/settings', icon: IconSettings, perm: 'view.settings' },
  ]

  const filteredAdminNav = adminNav.filter(item => permissions.includes(item.perm))

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
      {
        title: isAdmin ? 'Admin' : 'User',
        items: isAdmin ? filteredAdminNav : userNav, 
      },
    ],
  }
}
