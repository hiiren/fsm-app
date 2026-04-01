import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Info, Wrench, UploadCloud } from 'lucide-react'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'

const skillsList = ['Electrical', 'Plumbing', 'AC Repair', 'Appliance Repair', 'General', 'Installation']
const zonesList = ['North Mumbai', 'South Mumbai', 'Central Mumbai', 'West Mumbai', 'East Mumbai']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    skills: [] as string[],
    serviceZone: '',
    aadhaarFront: null as File | null,
    aadhaarBack: null as File | null,
    panCard: null as File | null,
  })

  // Basic mock auth registration
  const handleNext = () => setStep(2)
  const handleBack = () => setStep(1)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    
    // In a real app we'd upload files and create user + technician profile.
    useAppStore.getState().addTechnician({
      userId: `user-${generateId()}`,
      fullName: formData.fullName,
      mobile: formData.phone,
      email: formData.email,
      skills: formData.skills,
      serviceZone: formData.serviceZone,
      status: 'pending_verification',
      rating: 0,
      documents: {
        verificationStatus: 'pending',
        aadhaarFront: formData.aadhaarFront ? formData.aadhaarFront.name : undefined,
        aadhaarBack: formData.aadhaarBack ? formData.aadhaarBack.name : undefined,
        pan: formData.panCard ? formData.panCard.name : undefined,
      },
      stats: { totalTasks: 0, completedTasks: 0, avgCompletionTime: 0, onTimeRate: 0 },
    })

    // Auto-login or redirect to pending screen
    alert('Registration successful! Please wait for admin approval.')
    navigate('/login')
  }

  const handleGoogleAuth = () => {
    alert('Google OAuth flow is simulated here. Proceeding as if successful.')
    setFormData({ ...formData, email: 'google.user@example.com', fullName: 'Google User' })
    setStep(2) // proceed to profile part
  }

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 z-0 bg-grid-slate-800/[0.04] bg-[size:32px_32px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500/20 blur-[100px]" />
      
      <Card className="z-10 w-full max-w-[500px] border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <Wrench className="h-6 w-6 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Technician Signup</CardTitle>
          <CardDescription className="text-slate-400">
            {step === 1 ? 'Create an account to get started' : 'Complete your profile'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            {step === 1 ? (
              <div className="space-y-4">
                <Button type="button" variant="outline" className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" onClick={handleGoogleAuth}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </Button>
                
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="bg-slate-800 border-slate-700 text-white h-11" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="bg-slate-800 border-slate-700 text-white h-11" />
                    <p className="text-[11px] text-slate-500">Must be at least 8 characters long (OTP simulation omitted)</p>
                  </div>
                </div>

                <Button type="button" className="w-full h-11 mt-4" onClick={handleNext} disabled={!formData.email || !formData.password}>
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-300">Full Name *</Label>
                    <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">Phone *</Label>
                    <Input id="phone" placeholder="+91" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Skills *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {skillsList.map(skill => (
                      <div className="flex items-center space-x-2" key={skill}>
                        <Checkbox id={`skill-${skill}`} checked={formData.skills.includes(skill)} onCheckedChange={() => toggleSkill(skill)} />
                        <label htmlFor={`skill-${skill}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-400">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="zone" className="text-slate-300">Service Zone *</Label>
                  <Select onValueChange={(val) => setFormData({ ...formData, serviceZone: val })}>
                    <SelectTrigger id="zone" className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select primary service zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zonesList.map(z => (
                        <SelectItem key={z} value={z}>{z}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-400" />
                    <p className="text-sm font-medium text-blue-400">Document Uploads</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs text-muted-foreground uppercase tracking-wider">Aadhaar Card (Mandatory)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="aadhaar-f" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-slate-700 rounded-md py-4 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
                          <UploadCloud className="h-4 w-4 mr-2" />
                          {formData.aadhaarFront ? formData.aadhaarFront.name.substring(0, 10)+'...' : 'Front Side'}
                        </Label>
                        <input id="aadhaar-f" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setFormData({...formData, aadhaarFront: e.target.files[0]})} />
                      </div>
                      <div>
                        <Label htmlFor="aadhaar-b" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-slate-700 rounded-md py-4 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
                          <UploadCloud className="h-4 w-4 mr-2" />
                          {formData.aadhaarBack ? formData.aadhaarBack.name.substring(0, 10)+'...' : 'Back Side'}
                        </Label>
                        <input id="aadhaar-b" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setFormData({...formData, aadhaarBack: e.target.files[0]})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label className="text-slate-300 text-xs text-muted-foreground uppercase tracking-wider">PAN / DL (Optional)</Label>
                    <div>
                      <Label htmlFor="pan-card" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-slate-700 rounded-md py-4 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
                        <UploadCloud className="h-4 w-4 mr-2" />
                        {formData.panCard ? formData.panCard.name.substring(0, 10)+'...' : 'Upload Document'}
                      </Label>
                      <input id="pan-card" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => e.target.files && setFormData({...formData, panCard: e.target.files[0]})} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="w-1/3 bg-slate-800 border-slate-700 text-white hover:bg-slate-700" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" className="w-2/3 h-10" disabled={!formData.fullName || !formData.phone || formData.skills.length === 0 || !formData.serviceZone || !formData.aadhaarFront || !formData.aadhaarBack}>
                    Submit Registration
                  </Button>
                </div>
              </div>
            )}
            
            {step === 1 && (
              <div className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-500 hover:text-blue-400">
                  Login here
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
