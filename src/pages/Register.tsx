import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertCircle, Wrench, UploadCloud, ChevronLeft, ChevronRight, Loader2, 
  CheckCircle2, Mail, Lock, User, Phone, Shield
} from 'lucide-react'
import { cognitoSignUp, cognitoConfirmSignUp, cognitoResendCode } from '@/services/authService'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'

const skillsList = ['Electrical', 'Plumbing', 'AC Repair', 'Appliance Repair', 'General', 'Installation']
const zonesList = ['North Mumbai', 'South Mumbai', 'Central Mumbai', 'West Mumbai', 'East Mumbai']

type Step = 'account' | 'profile' | 'verify' | 'success'

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if we arrived here from a login redirect needing verification
  const initialState = location.state as { email?: string; needsVerification?: boolean } | null

  const [step, setStep] = useState<Step>(initialState?.needsVerification ? 'verify' : 'account')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const [formData, setFormData] = useState({
    fullName: '',
    email: initialState?.email || '',
    password: '',
    confirmPassword: '',
    phone: '',
    skills: [] as string[],
    serviceZone: '',
    aadhaarFront: null as File | null,
    aadhaarBack: null as File | null,
    panCard: null as File | null,
  })

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const validateAccountStep = (): string | null => {
    if (!formData.email) return 'Email is required.'
    if (!formData.password) return 'Password is required.'
    if (formData.password.length < 8) return 'Password must be at least 8 characters.'
    if (!/[A-Z]/.test(formData.password)) return 'Password must include an uppercase letter.'
    if (!/[a-z]/.test(formData.password)) return 'Password must include a lowercase letter.'
    if (!/[0-9]/.test(formData.password)) return 'Password must include a number.'
    if (!/[^A-Za-z0-9]/.test(formData.password)) return 'Password must include a special character.'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.'
    if (!formData.fullName.trim()) return 'Full name is required.'
    return null
  }

  const handleAccountNext = () => {
    const validationError = validateAccountStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setStep('profile')
  }

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.phone || formData.skills.length === 0 || !formData.serviceZone) {
      setError('Please fill in all required fields.')
      return
    }

    if (!formData.aadhaarFront || !formData.aadhaarBack) {
      setError('Aadhaar card (both sides) is mandatory.')
      return
    }

    setIsLoading(true)

    try {
      // Sign up with Cognito
      const result = await cognitoSignUp(formData.email, formData.password, formData.fullName, 'technician')

      if (result.success) {
        // Save technician profile locally (will be synced to cloud later)
        useAppStore.getState().addTechnician({
          userId: `pending-${generateId()}`,
          fullName: formData.fullName,
          mobile: formData.phone,
          email: formData.email,
          skills: formData.skills,
          serviceZone: formData.serviceZone,
          status: 'pending_verification',
          rating: 0,
          documents: {
            verificationStatus: 'pending',
            aadhaarFront: formData.aadhaarFront?.name,
            aadhaarBack: formData.aadhaarBack?.name,
            pan: formData.panCard?.name,
          },
          stats: { totalTasks: 0, completedTasks: 0, avgCompletionTime: 0, onTimeRate: 0 },
        })

        if (result.needsConfirmation) {
          setStep('verify')
          setResendCooldown(60)
        } else {
          setStep('success')
        }
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await cognitoConfirmSignUp(formData.email, verificationCode)
      if (result.success) {
        setStep('success')
      } else {
        setError(result.message)
      }
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    const result = await cognitoResendCode(formData.email)
    if (result.success) {
      setResendCooldown(60)
      setError('')
    } else {
      setError(result.message)
    }
  }

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  // Progress indicator
  const steps: { key: Step; label: string }[] = [
    { key: 'account', label: 'Account' },
    { key: 'profile', label: 'Profile' },
    { key: 'verify', label: 'Verify' },
  ]
  const currentStepIndex = steps.findIndex(s => s.key === step)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0A0F1C] via-[#0F172A] to-[#1a1040] p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-emerald-500/8 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-blue-500/8 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Technician Registration</h1>
        </div>

        {/* Step Progress */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className={`flex items-center gap-1.5 ${i <= currentStepIndex ? 'text-blue-400' : 'text-slate-600'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 ${
                    i < currentStepIndex 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : i === currentStepIndex 
                        ? 'border-blue-500 text-blue-400' 
                        : 'border-slate-700 text-slate-600'
                  }`}>
                    {i < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 rounded ${i < currentStepIndex ? 'bg-blue-500' : 'bg-slate-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/20">
          <CardContent className="pt-6">
            {/* Error display */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm mb-4">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Account Details */}
            {step === 'account' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fullName" className="text-slate-300 text-sm">Full Name *</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="pl-10 h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-email" className="text-slate-300 text-sm">Email Address *</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pl-10 h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-password" className="text-slate-300 text-sm">Password *</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Min 8 chars with A-Z, a-z, 0-9, symbol"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="pl-10 h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 ml-1">Must include uppercase, lowercase, number, and symbol</p>
                  </div>

                  <div>
                    <Label htmlFor="reg-confirm" className="text-slate-300 text-sm">Confirm Password *</Label>
                    <div className="relative mt-1.5">
                      <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="reg-confirm"
                        type="password"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="pl-10 h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20"
                  onClick={handleAccountNext}
                  disabled={!formData.email || !formData.password || !formData.fullName}
                >
                  Continue <ChevronRight className="ml-1 h-4 w-4" />
                </Button>

                <div className="text-center text-sm text-slate-500 mt-4">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign in
                  </Link>
                </div>
              </div>
            )}

            {/* Step 2: Profile & Documents */}
            {step === 'profile' && (
              <form onSubmit={handleSubmitRegistration} className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone" className="text-slate-300 text-sm">Phone Number *</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="pl-10 h-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zone" className="text-slate-300 text-sm">Service Zone *</Label>
                    <Select onValueChange={(val) => setFormData({ ...formData, serviceZone: val })}>
                      <SelectTrigger id="zone" className="mt-1.5 h-10 bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zonesList.map(z => (
                          <SelectItem key={z} value={z}>{z}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">Skills *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {skillsList.map(skill => (
                      <div className="flex items-center space-x-2" key={skill}>
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={formData.skills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <label
                          htmlFor={`skill-${skill}`}
                          className="text-sm font-medium text-slate-400 cursor-pointer"
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
                  <p className="text-sm font-medium text-blue-400 flex items-center gap-1.5">
                    <UploadCloud className="h-4 w-4" /> Document Uploads
                  </p>
                  
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Aadhaar Card (Mandatory)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label htmlFor="aadhaar-f" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg py-4 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors">
                        <UploadCloud className="h-4 w-4 mr-1.5" />
                        {formData.aadhaarFront ? formData.aadhaarFront.name.substring(0, 12) + '...' : 'Front Side'}
                      </label>
                      <input id="aadhaar-f" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setFormData({ ...formData, aadhaarFront: e.target.files[0] })} />

                      <label htmlFor="aadhaar-b" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg py-4 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors">
                        <UploadCloud className="h-4 w-4 mr-1.5" />
                        {formData.aadhaarBack ? formData.aadhaarBack.name.substring(0, 12) + '...' : 'Back Side'}
                      </label>
                      <input id="aadhaar-b" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setFormData({ ...formData, aadhaarBack: e.target.files[0] })} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">PAN / DL (Optional)</p>
                    <label htmlFor="pan-card" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg py-4 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors">
                      <UploadCloud className="h-4 w-4 mr-1.5" />
                      {formData.panCard ? formData.panCard.name.substring(0, 15) + '...' : 'Upload Document'}
                    </label>
                    <input id="pan-card" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => e.target.files && setFormData({ ...formData, panCard: e.target.files[0] })} />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/3 h-10 border-slate-700/50 bg-transparent text-slate-300 hover:bg-slate-800"
                    onClick={() => { setStep('account'); setError('') }}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-2/3 h-10 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20"
                    disabled={isLoading || !formData.phone || formData.skills.length === 0 || !formData.serviceZone || !formData.aadhaarFront || !formData.aadhaarBack}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Registering...</span>
                    ) : (
                      'Submit Registration'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Email Verification */}
            {step === 'verify' && (
              <form onSubmit={handleVerify} className="space-y-5 animate-in fade-in duration-300">
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                    <Mail className="h-7 w-7 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Verify your email</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    We've sent a 6-digit code to<br />
                    <span className="text-white font-medium">{formData.email}</span>
                  </p>
                </div>

                <div>
                  <Input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="h-12 text-center text-lg tracking-[0.5em] font-semibold bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 placeholder:tracking-normal placeholder:text-sm"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20"
                  disabled={isLoading || verificationCode.length < 6}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</span>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0}
                    className="text-sm text-blue-400 hover:text-blue-300 disabled:text-slate-600 transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Registration Complete!</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Your account has been created and verified. Please wait for admin approval before you can start accepting tasks.
                  </p>
                </div>
                <Button
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                  onClick={() => navigate('/login')}
                >
                  Go to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} D-Technician FSM. All rights reserved.
        </p>
      </div>
    </div>
  )
}
