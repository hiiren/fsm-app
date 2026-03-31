import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores'
import { cn, formatDate, formatTime, getRelativeTime, getInitials } from '@/lib/utils'
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  Phone,
  FileText,
  Check,
  X,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function RequirementsPage() {
  const { requirements, technicians, addTask, updateRequirement, addNotification } = useAppStore()
  const [selectedReq, setSelectedReq] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false)
  const [selectedTechForTask, setSelectedTechForTask] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const newRequirements = requirements.filter(r => r.status === 'new')
  const processedRequirements = requirements.filter(r => r.status !== 'new')

  const selectedRequirement = selectedReq ? requirements.find(r => r.id === selectedReq) : null

  const handleAccept = (reqId: string) => {
    const req = requirements.find(r => r.id === reqId)
    if (req) {
      setSelectedReq(reqId)
      setShowCreateTaskDialog(true)
    }
  }

  const handleCreateTaskFromRequirement = () => {
    if (!selectedReq || !selectedTechForTask) return
    
    const req = requirements.find(r => r.id === selectedReq)
    if (!req) return

    addTask({
      title: `${req.serviceType} - ${req.clientName}`,
      description: req.description,
      clientName: req.clientName,
      clientPhone: req.clientPhone,
      location: {
        address: 'Address to be confirmed',
        lat: 19.076,
        lng: 72.877,
      },
      category: req.serviceType,
      priority: 'medium',
      status: 'pending',
      scheduledDate: req.preferredDate,
      scheduledTime: req.preferredTime,
      estimatedDuration: 60,
      assignedTechnicianId: selectedTechForTask,
    })
    
    updateRequirement(selectedReq, { status: 'accepted' })
    
    const tech = technicians.find(t => t.id === selectedTechForTask)
    addNotification({
      type: 'task',
      title: 'Task Created from Requirement',
      message: `New task created for ${req.clientName} and assigned to ${tech?.fullName}`,
    })
    
    setShowCreateTaskDialog(false)
    setSelectedTechForTask('')
  }

  const handleReject = (reqId: string) => {
    updateRequirement(reqId, { status: 'rejected', rejectionReason: rejectReason })
    setShowRejectDialog(false)
    setRejectReason('')
  }

  const handleRequestInfo = (reqId: string) => {
    updateRequirement(reqId, { status: 'info_requested' })
    setShowInfoDialog(false)
    setInfoMessage('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Requirements</h1>
          <p className="text-muted-foreground">Review and process incoming service requests</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Inbox className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{newRequirements.length}</p>
              <p className="text-sm text-muted-foreground">New Requirements</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requirements.filter(r => r.status === 'accepted').length}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requirements.filter(r => r.status === 'info_requested').length}</p>
              <p className="text-sm text-muted-foreground">Info Requested</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inbox ({newRequirements.length} pending)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newRequirements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">No pending requirements to review</p>
                </div>
              ) : (
                newRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={cn(
                      'rounded-lg border p-4 transition-all cursor-pointer hover:border-primary/50',
                      selectedReq === req.id && 'border-primary bg-primary/5'
                    )}
                    onClick={() => setSelectedReq(req.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{req.clientName}</h3>
                            <p className="text-sm text-muted-foreground">{req.serviceType}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="info">New</Badge>
                            <p className="mt-1 text-xs text-muted-foreground">{getRelativeTime(req.createdAt)}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{req.description}</p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(req.preferredDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(req.preferredTime)}
                          </span>
                          {req.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {req.attachments.length} attachment(s)
                            </span>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAccept(req.id); }}>
                            <Check className="mr-1 h-4 w-4" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedReq(req.id); setShowInfoDialog(true); }}>
                            <MessageSquare className="mr-1 h-4 w-4" /> Request Info
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedReq(req.id); setShowRejectDialog(true); }}>
                            <X className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {processedRequirements.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Processed Requirements</h3>
                <div className="space-y-3">
                  {processedRequirements.slice(0, 5).map((req) => (
                    <div key={req.id} className="flex items-center gap-4 rounded-lg border p-3">
                      <Badge className={cn(
                        req.status === 'accepted' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                        req.status === 'rejected' && 'bg-red-500/20 text-red-400 border-red-500/30',
                        req.status === 'info_requested' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                      )}>
                        {req.status === 'accepted' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {req.status === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                        {req.status === 'info_requested' && <MessageSquare className="mr-1 h-3 w-3" />}
                        {req.status.replace('_', ' ')}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{req.clientName}</p>
                        <p className="text-xs text-muted-foreground">{req.serviceType}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedRequirement && (
          <Card>
            <CardHeader>
              <CardTitle>Requirement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Client Name</p>
                <p className="text-sm text-muted-foreground">{selectedRequirement.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Contact</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {selectedRequirement.clientPhone}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Service Type</p>
                <Badge variant="outline">{selectedRequirement.serviceType}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Preferred Schedule</p>
                <p className="text-sm text-muted-foreground">{formatDate(selectedRequirement.preferredDate)} at {formatTime(selectedRequirement.preferredTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{selectedRequirement.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Submitted</p>
                <p className="text-sm text-muted-foreground">{getRelativeTime(selectedRequirement.createdAt)}</p>
              </div>

              {selectedRequirement.status === 'new' && (
                <div className="pt-4 border-t space-y-2">
                  <h4 className="text-sm font-medium">Quick Actions</h4>
                  <Button className="w-full" onClick={() => handleAccept(selectedRequirement.id)}>
                    <Check className="mr-2 h-4 w-4" /> Accept & Create Task
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowRejectDialog(true)}>
                    <X className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Requirement</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this requirement</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedReq && handleReject(selectedReq)}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Information</DialogTitle>
            <DialogDescription>Send a message to the client requesting additional details</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="What information do you need?"
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInfoDialog(false)}>Cancel</Button>
            <Button onClick={() => selectedReq && handleRequestInfo(selectedReq)}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task from Requirement</DialogTitle>
            <DialogDescription>Assign a technician to create a task</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedRequirement && (
              <div className="rounded-lg bg-accent/50 p-3">
                <p className="font-medium">{selectedRequirement.clientName}</p>
                <p className="text-sm text-muted-foreground">{selectedRequirement.serviceType}</p>
                <p className="text-sm text-muted-foreground">{selectedRequirement.preferredDate} at {selectedRequirement.preferredTime}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Technician</label>
              <Select value={selectedTechForTask} onValueChange={setSelectedTechForTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.filter(t => t.status === 'active').map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>{tech.fullName} - {tech.serviceZone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTaskDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTaskFromRequirement} disabled={!selectedTechForTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
