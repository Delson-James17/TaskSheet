import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/switch-toggle"
import { useNavigate } from 'react-router-dom'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  const validateEmail = (value: string) => {
    const regex = /^\S+@\S+\.\S+$/
    if (!regex.test(value)) {
      setEmailError('Please enter a valid email.')
    } else {
      setEmailError('')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // Show confirmation message instead of alert
    setSuccessMessage("Signup successful. Please check your email to confirm your account.")

    // Optional: store intent to redirect post-confirmation
    localStorage.setItem('awaitingConfirmation', 'true')
  }

  // Automatically navigate once user is confirmed and logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const confirmed = session?.user?.email_confirmed_at

      if (session && confirmed && localStorage.getItem('awaitingConfirmation')) {
        localStorage.removeItem('awaitingConfirmation')
        navigate('/dashboard')
      }
    }

    checkSession()
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
          <ThemeToggle />
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Fill the form to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      validateEmail(e.target.value)
                    }}
                    required
                  />
                  {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value
                      setPassword(val)
                      if (val.length < 6) {
                        setPasswordError('Password must be at least 6 characters.')
                      } else {
                        setPasswordError('')
                      }
                    }}
                    required
                  />
                  {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
                <Button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black">
                  Sign Up
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
                  if (error) console.error('Google sign-up error:', error.message)
                }}
                className="w-full bg-black text-white dark:bg-white dark:text-black"
              >
                Sign Up with Google
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  )
}
