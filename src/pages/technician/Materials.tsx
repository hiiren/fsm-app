import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, useAuthStore } from '@/stores'
import { Package, Plus } from 'lucide-react'

export default function TechnicianMaterialsPage() {
  const { materials, tasks, addMaterialRequest, addNotification } = useAppStore()
  const { user } = useAuthStore()
  const techId = 'tech-001'
  const myMaterials = materials.filter(m => m.technicianId === techId)
  const myTasks = tasks.filter(t => t.assignedTechnicianId === techId && t.status !== 'completed' && t.status !== 'cancelled')
  
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('piece')
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [justification, setJustification] = useState('')

  const handleSubmitRequest = () => {
    if (!selectedTaskId || !itemName || !justification) return
    
    addMaterialRequest({
      taskId: selectedTaskId,
      technicianId: techId,
      itemName,
      quantity,
      unit,
      estimatedCost,
      justification,
      status: 'pending',
    })
    
    addNotification({
      type: 'material',
      title: 'Material Requested',
      message: `Request for ${itemName} has been submitted`,
    })
    
    setShowRequestDialog(false)
    setSelectedTaskId('')
    setItemName('')
    setQuantity(1)
    setUnit('piece')
    setEstimatedCost(0)
    setJustification('')
  }

  return (
    <div className="space-y-6">
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Material</DialogTitle>
            <DialogDescription>
              Submit a material request for your task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Task</label>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {myTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name</label>
              <Input
                placeholder="Enter item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Cost (₹)</label>
              <Input
                type="number"
                min={0}
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Justification</label>
              <Textarea
                placeholder="Why do you need this material?"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitRequest} disabled={!selectedTaskId || !itemName || !justification}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Materials</h1>
          <p className="text-muted-foreground">Request and manage materials</p>
        </div>
        <Button onClick={() => setShowRequestDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Request Material
        </Button>
      </div>

      <div className="space-y-4">
        {myMaterials.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No material requests</p>
            </CardContent>
          </Card>
        ) : (
          myMaterials.map((material) => {
            const task = tasks.find(t => t.id === material.taskId)
            return (
              <Card key={material.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{material.itemName}</h3>
                    <Badge className={
                      material.status === 'approved' ? 'bg-green-500' :
                      material.status === 'rejected' ? 'bg-red-500' :
                      'bg-amber-500'
                    }>
                      {material.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Task:</span>
                      <span>{task?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span>{material.quantity} {material.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Cost:</span>
                      <span>₹{material.estimatedCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Justification:</span>
                      <span>{material.justification}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
