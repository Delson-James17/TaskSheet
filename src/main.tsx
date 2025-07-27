import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom'
import { supabase } from '@/utils/supabaseClient'
import LogIn from './features/auth/LogIn.tsx'
import SignUp from './features/auth/SignUp.tsx'
import Dashboard from './features/page/Dashboard.tsx'
import Profile from './features/page/Profile.tsx'
import AddProfile from './features/page/AddProfile.tsx'

// ✅ Admin Pages
import ManageUsers from './features/page/admin/ManageUsers.tsx'
import ProjectsAdmin from './features/page/admin/ProjectsAdmin.tsx'
import Roles from './features/page/admin/Roles.tsx'
import Settings from './features/page/admin/Settings.tsx'
import TasksAdmin from './features/page/admin/TasksAdmin.tsx'
import TimesheetBank from './features/page/admin/TimesheetBank.tsx'
import TimesheetsAdmin from './features/page/admin/TimesheetsAdmin.tsx'
import UserRoles from './features/page/admin/UserRoles.tsx'

// ✅ User Pages
import UserProjects from './features/page/users/Projects.tsx'
import UserTasks from './features/page/users/Tasks.tsx'
import UserTimesheets from './features/page/users/Timesheets.tsx'

import './index.css'

async function prepareAndRenderApp() {
  const hash = window.location.hash
  if (hash.includes('access_token')) {
    const params = new URLSearchParams(hash.slice(1))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token })
      window.history.replaceState(null, '', '/add-profile')
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Profile Setup */}
          <Route path="/add-profile" element={<AddProfile />} />
          <Route path="/profile" element={<Profile />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/projects" element={<ProjectsAdmin />} />
          <Route path="/admin/roles" element={<Roles />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/tasks" element={<TasksAdmin />} />
          <Route path="/admin/timesheet-bank" element={<TimesheetBank />} />
          <Route path="/admin/timesheets" element={<TimesheetsAdmin />} />
          <Route path="/admin/user-roles" element={<UserRoles />} />

          {/* User Routes */}
          <Route path="/projects" element={<UserProjects />} />
          <Route path="/tasks" element={<UserTasks />} />
          <Route path="/timesheets" element={<UserTimesheets />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  )
}

prepareAndRenderApp()
