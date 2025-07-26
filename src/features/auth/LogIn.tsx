import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import {ThemeToggle} from "@/components/switch-toggle"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error , setError] = useState('');
  const navigate = useNavigate()
  const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://task-sheet-beta.vercel.app/'
    }
  })
  if (error) console.error('Google login error:', error.message)
}

  const handleLogIn = async (e: React.FormEvent) => {
  e.preventDefault();

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('is_locked')
    .eq('email', email)
    .maybeSingle()


  if (profileError) {
    setError("User not found.")
    return
  }

  if (profile?.is_locked) {
    setError("Your account is locked due to 5 failed attempts.")
    return
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    await supabase.rpc('increment_failed_attempts', { email_param: email })
    setError("Invalid email or password.")
  } else {
    await supabase
      .from('profiles')
      .update({ failed_attempts: 0, is_locked: false })
      .eq('email', email)

    navigate('/dashboard')
  }
}
  return (
   <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <div className="w-screen h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
    <ThemeToggle/>
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button className="bg-black text-white dark:bg-white dark:text-black"variant="link" onClick={()=>navigate('/signup')}>Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogIn}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
             <Button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black">
               Login
             </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button variant="outline" onClick={handleGoogleLogin} className="w-full bg-black text-white dark:bg-white dark:text-black">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
    </div>
    </div>
    </ThemeProvider>
  )
}
