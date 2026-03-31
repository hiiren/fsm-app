import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores'
import { Save, Upload, Phone, MapPin, CreditCard, Shield, User, Check } from 'lucide-react'

interface UploadedFile {
  name: string
  url: string
  type: string
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    aadhaarNumber: user?.aadhaarNumber || '',
    panNumber: user?.panNumber || '',
    drivingLicense: user?.drivingLicense || '',
  })

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({
    profilePhoto: user?.profilePhoto ? { name: 'Profile Photo', url: user.profilePhoto, type: 'image' } : { name: '', url: '', type: '' },
    aadhaarFront: { name: '', url: '', type: '' },
    aadhaarBack: { name: '', url: '', type: '' },
    panCard: { name: '', url: '', type: '' },
  })

  const profileInputRef = useRef<HTMLInputElement>(null)
  const aadhaarFrontInputRef = useRef<HTMLInputElement>(null)
  const aadhaarBackInputRef = useRef<HTMLInputElement>(null)
  const panCardInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (field: string, file: File | null, inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setUploadedFiles(prev => ({
        ...prev,
        [field]: {
          name: file.name,
          url: objectUrl,
          type: file.type
        }
      }))
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload('profilePhoto', file, profileInputRef)
      if (user) {
        const objectUrl = URL.createObjectURL(file)
        setUser({ ...user, profilePhoto: objectUrl })
      }
    }
  }

  const handleSave = () => {
    if (user) {
      setUser({ ...user, ...formData })
    }
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and documents</p>
      </div>

      <input
        type="file"
        ref={profileInputRef}
        onChange={handleProfilePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={uploadedFiles.profilePhoto.url || user?.profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"} />
                <AvatarFallback className="text-3xl">AD</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={() => profileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{user?.name}</h3>
              <p className="text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
              <Badge variant="outline" className="mt-2">Active</Badge>
            </div>
            {isEditing ? (
              <Button variant="outline" className="w-full" onClick={() => profileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload New Photo
              </Button>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                <Upload className="mr-2 h-4 w-4" /> Change Photo
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" /> Full Name
                </label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Address
                </label>
                <Textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ID Proof Details</CardTitle>
            <CardDescription>Verify your identity with government-issued documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Aadhaar Card Number
                </label>
                <Input 
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  disabled={!isEditing}
                  placeholder="XXXX XXXX XXXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> PAN Card Number
                </label>
                <Input 
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  disabled={!isEditing}
                  placeholder="ABCDE1234F"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Driving License
                </label>
                <Input 
                  value={formData.drivingLicense}
                  onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.value })}
                  disabled={!isEditing}
                  placeholder="DL Number"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <input
                type="file"
                ref={aadhaarFrontInputRef}
                onChange={(e) => handleFileUpload('aadhaarFront', e.target.files?.[0] || null, aadhaarFrontInputRef)}
                accept="image/*,.pdf"
                className="hidden"
              />
              <div 
                className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors ${uploadedFiles.aadhaarFront.url ? 'border-green-500 bg-green-500/5' : ''}`}
                onClick={() => isEditing && aadhaarFrontInputRef.current?.click()}
              >
                {uploadedFiles.aadhaarFront.url ? (
                  <>
                    <Check className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm text-green-500 font-medium">{uploadedFiles.aadhaarFront.name}</p>
                    <p className="text-xs text-muted-foreground">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload Aadhaar Front</p>
                  </>
                )}
              </div>

              <input
                type="file"
                ref={aadhaarBackInputRef}
                onChange={(e) => handleFileUpload('aadhaarBack', e.target.files?.[0] || null, aadhaarBackInputRef)}
                accept="image/*,.pdf"
                className="hidden"
              />
              <div 
                className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors ${uploadedFiles.aadhaarBack.url ? 'border-green-500 bg-green-500/5' : ''}`}
                onClick={() => isEditing && aadhaarBackInputRef.current?.click()}
              >
                {uploadedFiles.aadhaarBack.url ? (
                  <>
                    <Check className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm text-green-500 font-medium">{uploadedFiles.aadhaarBack.name}</p>
                    <p className="text-xs text-muted-foreground">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload Aadhaar Back</p>
                  </>
                )}
              </div>

              <input
                type="file"
                ref={panCardInputRef}
                onChange={(e) => handleFileUpload('panCard', e.target.files?.[0] || null, panCardInputRef)}
                accept="image/*,.pdf"
                className="hidden"
              />
              <div 
                className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors ${uploadedFiles.panCard.url ? 'border-green-500 bg-green-500/5' : ''}`}
                onClick={() => isEditing && panCardInputRef.current?.click()}
              >
                {uploadedFiles.panCard.url ? (
                  <>
                    <Check className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm text-green-500 font-medium">{uploadedFiles.panCard.name}</p>
                    <p className="text-xs text-muted-foreground">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload PAN Card</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="flex justify-end gap-4 pt-6">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
