import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/stores'
import { cn, getStatusColor, getInitials, formatDate } from '@/lib/utils'
import {
  Search,
  Plus,
  Filter,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  TrendingUp,
  Award,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const skills = ['Electrical', 'Plumbing', 'AC Repair', 'Appliance Repair', 'General']
const zones = ['North Mumbai', 'South Mumbai', 'Central Mumbai', 'West Mumbai', 'East Mumbai']

export default function TechniciansPage() {
  const { technicians, tasks, feedbacks, updateTechnician, addNotification } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [skillFilter, setSkillFilter] = useState<string>('all')
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTech, setNewTech] = useState({
    fullName: '',
    mobile: '',
    email: '',
    skills: [] as string[],
    serviceZone: '',
  })

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.mobile.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || tech.status === statusFilter
    const matchesSkill = skillFilter === 'all' || tech.skills.includes(skillFilter)
    return matchesSearch && matchesStatus && matchesSkill
  })

  const selectedTech = selectedTechnician ? technicians.find(t => t.id === selectedTechnician) : null
  const techTasks = selectedTech ? tasks.filter(t => t.assignedTechnicianId === selectedTech.id) : []
  const techFeedbacks = selectedTech ? feedbacks.filter(f => f.technicianId === selectedTech.id) : []

  const activeCount = technicians.filter(t => t.status === 'active').length
  const pendingCount = technicians.filter(t => t.status === 'pending_verification').length
  const avgRating = (technicians.reduce((acc, t) => acc + t.rating, 0) / technicians.filter(t => t.rating > 0).length || 0).toFixed(1)

  const handleVerifyDocuments = (techId: string) => {
    updateTechnician(techId, { 
      documents: { 
        ...technicians.find(t => t.id === techId)?.documents, 
        verificationStatus: 'verified' 
      },
      status: 'active'
    })
    const tech = technicians.find(t => t.id === techId)
    addNotification({
      type: 'document',
      title: 'Documents Verified',
      message: `${tech?.fullName}'s documents have been verified`,
    })
  }

  const handleRejectDocuments = (techId: string) => {
    updateTechnician(techId, { 
      documents: { 
        ...technicians.find(t => t.id === techId)?.documents, 
        verificationStatus: 'rejected' 
      },
      status: 'inactive'
    })
    const tech = technicians.find(t => t.id === techId)
    addNotification({
      type: 'document',
      title: 'Documents Rejected',
      message: `${tech?.fullName}'s documents have been rejected`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Technician Management</h1>
          <p className="text-muted-foreground">Manage and monitor your field service technicians</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Technician
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Technician</DialogTitle>
              <DialogDescription>Enter the technician's details to send an invitation</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Enter full name"
                  value={newTech.fullName}
                  onChange={(e) => setNewTech({ ...newTech, fullName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <Input
                  placeholder="+91 XXXXX XXXXX"
                  value={newTech.mobile}
                  onChange={(e) => setNewTech({ ...newTech, mobile: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newTech.email}
                  onChange={(e) => setNewTech({ ...newTech, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Service Zone</label>
                <Select onValueChange={(v: string) => setNewTech({ ...newTech, serviceZone: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={newTech.skills.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        if (newTech.skills.includes(skill)) {
                          setNewTech({ ...newTech, skills: newTech.skills.filter(s => s !== skill) })
                        } else {
                          setNewTech({ ...newTech, skills: [...newTech.skills, skill] })
                        }
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => setShowAddDialog(false)}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{technicians.length}</p>
              <p className="text-sm text-muted-foreground">Total Technicians</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Verification</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgRating}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>All Technicians</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="w-[200px] pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending_verification">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setSkillFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      {skills.map((skill) => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTechnicians.map((tech) => (
                  <div
                    key={tech.id}
                    className={cn(
                      'flex items-center gap-4 rounded-lg border p-4 transition-all cursor-pointer hover:bg-accent/50',
                      selectedTechnician === tech.id && 'border-primary bg-primary/5'
                    )}
                    onClick={() => setSelectedTechnician(tech.id)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tech.profilePhoto} />
                      <AvatarFallback>{getInitials(tech.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{tech.fullName}</p>
                        <Badge className={getStatusColor(tech.status)}>{tech.status.replace('_', ' ')}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {tech.mobile}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {tech.serviceZone}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tech.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      {tech.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="font-medium">{tech.rating}</span>
                        </div>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {tech.stats.completedTasks} tasks
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedTechnician(tech.id)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedTech && (
          <Card className="w-full lg:w-[400px]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedTech.profilePhoto} />
                  <AvatarFallback className="text-lg">{getInitials(selectedTech.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedTech.fullName}</CardTitle>
                  <Badge className={cn('mt-1', getStatusColor(selectedTech.status))}>
                    {selectedTech.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="documents">Docs</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTech.mobile}</span>
                    </div>
                    {selectedTech.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTech.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTech.serviceZone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {formatDate(selectedTech.createdAt)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Performance</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-accent/50 p-3 text-center">
                        <p className="text-2xl font-bold">{selectedTech.stats.completedTasks}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="rounded-lg bg-accent/50 p-3 text-center">
                        <p className="text-2xl font-bold">{selectedTech.stats.onTimeRate}%</p>
                        <p className="text-xs text-muted-foreground">On-time</p>
                      </div>
                      <div className="rounded-lg bg-accent/50 p-3 text-center">
                        <p className="text-2xl font-bold">{selectedTech.stats.avgCompletionTime}m</p>
                        <p className="text-xs text-muted-foreground">Avg Time</p>
                      </div>
                      <div className="rounded-lg bg-accent/50 p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                          <span className="text-2xl font-bold">{selectedTech.rating || '-'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTech.skills.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="mt-4">
                  <div className="space-y-3">
                    {techTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between">
                          <p className="font-medium">{task.title}</p>
                          <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{task.category}</p>
                      </div>
                    ))}
                    {techTasks.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-4">No tasks assigned</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2">
                          <Award className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Aadhaar Card</p>
                          <p className="text-xs text-muted-foreground">Front Side</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTech.documents.aadhaarFront ? (
                          <>
                            <Badge className={getStatusColor(selectedTech.documents.verificationStatus)}>
                              {selectedTech.documents.verificationStatus}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline">Not Uploaded</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2">
                          <Award className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Aadhaar Card</p>
                          <p className="text-xs text-muted-foreground">Back Side</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTech.documents.aadhaarBack ? (
                          <>
                            <Badge className={getStatusColor(selectedTech.documents.verificationStatus)}>
                              {selectedTech.documents.verificationStatus}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline">Not Uploaded</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-500/10 p-2">
                          <Award className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">PAN Card</p>
                          <p className="text-xs text-muted-foreground">Optional</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTech.documents.pan ? (
                          <>
                            <Badge className={getStatusColor(selectedTech.documents.verificationStatus)}>
                              {selectedTech.documents.verificationStatus}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline">Not Uploaded</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-500/10 p-2">
                          <Award className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Driving License</p>
                          <p className="text-xs text-muted-foreground">Optional</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTech.documents.drivingLicense ? (
                          <>
                            <Badge className={getStatusColor(selectedTech.documents.verificationStatus)}>
                              {selectedTech.documents.verificationStatus}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline">Not Uploaded</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedTech.status === 'pending_verification' && (
                    <div className="mt-4 flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleVerifyDocuments(selectedTech.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Verify Documents
                      </Button>
                      <Button variant="outline" className="flex-1 text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleRejectDocuments(selectedTech.id)}>
                        <AlertTriangle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Edit Profile</Button>
                <Button className="flex-1">View Schedule</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
