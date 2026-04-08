import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores'
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield, Wrench, ChevronRight, Loader2 } from 'lucide-react'
import { cognitoSignIn, fetchCurrentUser } from '@/services/authService'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'technician' | null>(null)
  const { setUser, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const user = useAuthStore.getState().user
      navigate(user?.role === 'technician' ? '/technician' : '/admin')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await cognitoSignIn(email, password)

      if (result.success) {
        // Fetch full user info from Cognito
        const userInfo = await fetchCurrentUser()
        if (userInfo) {
          setUser({
            id: userInfo.userId,
            email: userInfo.email,
            password: '', // never store password
            role: userInfo.role,
            name: userInfo.name,
            createdAt: new Date().toISOString(),
          })
          navigate(userInfo.role === 'technician' ? '/technician' : '/admin')
        } else {
          setError('Unable to fetch user profile. Please try again.')
        }
      } else if (result.needsConfirmation) {
        // Redirect to register with verification step
        navigate('/register', { state: { email, needsVerification: true } })
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0F1C] via-[#0F172A] to-[#1a1040] p-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-[80px]" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4 animate-float">
            <span className="text-2xl font-bold text-white">D</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">D-Technician</h1>
          <p className="text-slate-400 mt-1 text-sm">Field Service Management Platform</p>
        </div>

        {/* Role Selection Cards (onboarding feel) */}
        {!selectedRole && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-center text-sm text-slate-400 mb-4">Select your role to continue</p>
            
            <button
              onClick={() => setSelectedRole('admin')}
              className="group w-full flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-base">Admin Panel</p>
                <p className="text-xs text-slate-400 mt-0.5">Manage tasks, technicians & operations</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </button>

            <button
              onClick={() => setSelectedRole('technician')}
              className="group w-full flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <Wrench className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-base">Technician App</p>
                <p className="text-xs text-slate-400 mt-0.5">View tasks, track work & manage schedule</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        )}

        {/* Login Form */}
        {selectedRole && (
          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => { setSelectedRole(null); setError('') }}
                  className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-slate-800"
                >
                  ← Change role
                </button>
              </div>
              <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedRole === 'admin' 
                  ? 'bg-blue-500/10' 
                  : 'bg-emerald-500/10'
              }`}>
                {selectedRole === 'admin' 
                  ? <Shield className="h-5 w-5 text-blue-400" />
                  : <Wrench className="h-5 w-5 text-emerald-400" />
                }
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">
                  {selectedRole === 'admin' ? 'Admin Sign In' : 'Technician Sign In'}
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Enter your credentials to continue
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Email address"
                      className="pl-10 h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="pl-10 pr-10 h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className={`w-full h-11 font-medium transition-all duration-300 ${
                    selectedRole === 'admin'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {selectedRole === 'technician' && (
                <div className="mt-5 text-center">
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700/50" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 text-slate-500 bg-slate-900/60">New technician?</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-10 border-slate-700/50 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all"
                    onClick={() => navigate('/register')}
                  >
                    Create an account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} D-Technician FSM. All rights reserved.
        </p>
      </div>
    </div>
  )
}
