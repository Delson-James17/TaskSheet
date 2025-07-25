import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom'
import {LogIn} from './features/auth/LogIn.tsx'
import SignUp from './features/auth/SignUp.tsx'
import Dashboard from './features/page/Dashboard.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Navigate to ="/login"/>}/>

    <Route path="/login" element={<LogIn/>}></Route>
    <Route path='/signup' element={<SignUp/>}></Route>
    <Route path='/dashboard' element={<Dashboard/>}></Route>

    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
