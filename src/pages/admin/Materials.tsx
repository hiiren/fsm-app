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
import { cn, formatDate, getRelativeTime, getInitials, formatTime } from '@/lib/utils'
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ClipboardList,
  User,
  DollarSign,
  FileText,
  Check,
  X,
  MessageSquare,
} from 'lucide-react'

export default function MaterialsPage() {
  const { materials, tasks, technicians, updateMaterialRequest } = useAppStore()
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [approvalQuantity, setApprovalQuantity] = useState<number>(0)
  const [rejectionReason, setRejectionReason] = useState('')
  const [procurementNotes, setProcurementNotes] = useState('')

  const pendingMaterials = materials.filter(m => m.status === 'pending')
  const processedMaterials = materials.filter(m => m.status !== 'pending')

  const selectedMat = selectedMaterial ? materials.find(m => m.id === selectedMaterial) : null
  const task = selectedMat ? tasks.find(t => t.id === selectedMat.taskId) : null
  const tech = selectedMat ? technicians.find(t => t.id === selectedMat.technicianId) : null

  const handleApprove = (id: string) => {
    updateMaterialRequest(id, { status: 'approved', approvedQuantity: approvalQuantity || undefined, procurementNotes })
    setShowApproveDialog(false)
    setApprovalQuantity(0)
    setProcurementNotes('')
  }

  const handleReject = (id: string) => {
    updateMaterialRequest(id, { status: 'rejected', rejectionReason })
    setShowRejectDialog(false)
    setRejectionReason('')
  }

  const totalPendingCost = pendingMaterials.reduce((acc, m) => acc + m.estimatedCost, 0)
  const totalApprovedCost = processedMaterials.filter(m => m.status === 'approved').reduce((acc, m) => acc + (m.approvedQuantity || m.quantity) * m.estimatedCost, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Approvals</h1>
          <p className="text-muted-foreground">Review and approve raw material requests</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingMaterials.length}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{processedMaterials.filter(m => m.status === 'approved').length}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-red-500/10 p-3">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{processedMaterials.filter(m => m.status === 'rejected').length}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{(totalApprovedCost).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Approved Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pending Requests ({pendingMaterials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingMaterials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">No pending material requests</p>
                </div>
              ) : (
                pendingMaterials.map((mat) => {
                  const matTask = tasks.find(t => t.id === mat.taskId)
                  const matTech = technicians.find(t => t.id === mat.technicianId)
                  return (
                    <div
                      key={mat.id}
                      className={cn(
                        'rounded-lg border p-4 transition-all cursor-pointer hover:border-primary/50',
                        selectedMaterial === mat.id && 'border-primary bg-primary/5'
                      )}
                      onClick={() => setSelectedMaterial(mat.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-amber-500/10 p-2">
                          <Package className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{mat.itemName}</h3>
                              <p className="text-sm text-muted-foreground">
                                Task: {matTask?.title || 'Unknown Task'}
                              </p>
                            </div>
                            <Badge variant="warning">Pending</Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Quantity</p>
                              <p className="font-medium">{mat.quantity} {mat.unit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Est. Cost</p>
                              <p className="font-medium">₹{mat.estimatedCost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Requested</p>
                              <p className="text-sm">{getRelativeTime(mat.createdAt)}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{mat.justification}</p>
                          <div className="mt-4 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={matTech?.profilePhoto} />
                              <AvatarFallback className="text-xs">{matTech ? getInitials(matTech.fullName) : 'T'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{matTech?.fullName}</span>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelectedMaterial(mat.id); setApprovalQuantity(mat.quantity); setShowApproveDialog(true); }}>
                              <Check className="mr-1 h-4 w-4" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedMaterial(mat.id); setShowRejectDialog(true); }}>
                              <X className="mr-1 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {selectedMat && (
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-amber-500/10 p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="font-medium">{selectedMat.itemName}</p>
                    <p className="text-sm text-muted-foreground">{selectedMat.quantity} {selectedMat.unit}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Task</p>
                  <p className="text-sm text-muted-foreground">{task?.title || 'Unknown'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={tech?.profilePhoto} />
                    <AvatarFallback>{tech ? getInitials(tech.fullName) : 'T'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{tech?.fullName || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{tech?.mobile}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-lg font-bold text-emerald-500">₹{selectedMat.estimatedCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Justification</p>
                  <p className="text-sm text-muted-foreground">{selectedMat.justification}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Requested</p>
                  <p className="text-sm text-muted-foreground">{getRelativeTime(selectedMat.createdAt)}</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <h4 className="text-sm font-medium">Actions</h4>
                <Button className="w-full" onClick={() => { setApprovalQuantity(selectedMat.quantity); setShowApproveDialog(true); }}>
                  <Check className="mr-2 h-4 w-4" /> Approve Request
                </Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={() => setShowRejectDialog(true)}>
                  <X className="mr-2 h-4 w-4" /> Reject Request
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Material Request</DialogTitle>
            <DialogDescription>Review and approve the material request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedMat && (
              <>
                <div className="rounded-lg bg-accent/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedMat.itemName}</span>
                    <span className="text-muted-foreground">₹{selectedMat.estimatedCost.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Requested: {selectedMat.quantity} {selectedMat.unit}</p>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Approve Quantity</label>
                  <Input
                    type="number"
                    value={approvalQuantity}
                    onChange={(e) => setApprovalQuantity(parseInt(e.target.value) || 0)}
                    max={selectedMat.quantity}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Procurement Notes (Optional)</label>
                  <Textarea
                    placeholder="Add notes for the procurement team..."
                    value={procurementNotes}
                    onChange={(e) => setProcurementNotes(e.target.value)}
                  />
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <p className="text-sm text-emerald-500 font-medium">Total Cost: ₹{(approvalQuantity * selectedMat.estimatedCost / selectedMat.quantity).toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button onClick={() => selectedMaterial && handleApprove(selectedMaterial)}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Material Request</DialogTitle>
            <DialogDescription>Please provide a reason for rejection</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedMaterial && handleReject(selectedMaterial)}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
