import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import {ThemeToggle} from "@/components/switch-toggle"
// import {ModeToggle} from "@/components/mode-toggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

 const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault()

  if (password !== confirmPassword) {
    setError('Passwords do not match')
    return
  }

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.code === "weak_password") {
      const reasons = (error as any).weak_password?.reasons || []
      if (reasons.includes("length")) {
        setError("Password must be at least 6 characters.")
      } else {
        setError(error.message)
      }
    } else {
      setError(error.message)
    }
    return
  }

  const session = await supabase.auth.getSession()
  const user = session.data.session?.user

  if (user) {
    await supabase.from('user_profiles').insert({
      id: user.id,
      email,
      full_name: '',
      avatar_url: '',
      role: 'user',
      is_active: true,
      is_locked: false,
      failed_attempts: 0
  })
  }

  alert('Check your email for a confirmation link.')
  navigate('/add-profile')
}
    const validateEmail = (value: string) => {
    const regex = /^\S+@\S+\.\S+$/
    if (!regex.test(value)) {
      setEmailError('Please enter a valid email.')
    } else {
      setEmailError('')
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
     <div className="w-screen h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
    <ThemeToggle/>
    <Card className="w-full max-w-sm">
        
      <CardHeader>
        <CardTitle>Sign Up to your account</CardTitle>
        <CardDescription>Enter your email below to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                const value =e.target.value 
                setEmail(value)
                validateEmail(value)
              }}
              placeholder="m@example.com"
              required
            />
            {emailError &&<p className="text-sm text-red-500">{emailError}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>{
                const value = e.target.value
                setPassword(value)
                    if (value.length < 6) {
                     setPasswordError("Password must be at least 6 characters.");
                     } else {
                     setPasswordError("");
                    }
            }} 
              placeholder="Your password"
              required
            />
             {passwordError &&( <p className="text-sm text-red-500">{passwordError}</p>)}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black">
            Sign Up
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full bg-black text-white dark:bg-white dark:text-black" 
         onClick={async () => {
               const { error } = await supabase.auth.signInWithOAuth({
                 provider: 'google',
               })
               if (error) console.error('Google sign-up error:', error.message)
             }}>
          Sign Up with Google
        </Button>
      </CardFooter>
    </Card>
    </div>
    </div>
    </ThemeProvider>
  );
}

