import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom'
import { supabase } from '@/utils/supabaseClient'
import LogIn from './features/auth/LogIn.tsx'
import SignUp from './features/auth/SignUp.tsx'
import Dashboard from './features/page/Dashboard.tsx'
import Profile from './features/page/Profile.tsx'
import './index.css'

async function prepareAndRenderApp() {
  const hash = window.location.hash
  if (hash.includes('access_token')) {
    const params = new URLSearchParams(hash.slice(1))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token })
      window.history.replaceState(null, '', '/dashboard')
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>,
  )
}

prepareAndRenderApp()
