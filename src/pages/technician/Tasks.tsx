import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore, useAuthStore } from '@/stores'
import { cn, formatTime } from '@/lib/utils'
import { Clock, MapPin, Check, X, Phone, Navigation, Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function TechnicianTasksPage() {
  const { tasks, updateTaskStatus, addNotification } = useAppStore()
  const { user } = useAuthStore()
  const techId = 'tech-001'
  const myTasks = tasks.filter(t => t.assignedTechnicianId === techId)
  
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')

  const handleAcceptTask = (taskId: string) => {
    updateTaskStatus(taskId, 'accepted', 'Task accepted by technician')
    addNotification({
      type: 'task',
      title: 'Task Accepted',
      message: `You have accepted the task`,
    })
  }

  const handleDeclineClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setDeclineReason('')
    setDeclineDialogOpen(true)
  }

  const handleConfirmDecline = () => {
    if (selectedTaskId && declineReason.trim()) {
      updateTaskStatus(selectedTaskId, 'cancelled', declineReason)
      addNotification({
        type: 'task',
        title: 'Task Declined',
        message: `You have declined the task`,
      })
      setDeclineDialogOpen(false)
      setSelectedTaskId(null)
      setDeclineReason('')
    }
  }

  const handleStartTask = (taskId: string) => {
    updateTaskStatus(taskId, 'in_progress', 'Work started on task')
    addNotification({
      type: 'task',
      title: 'Task Started',
      message: `You started working on the task`,
    })
  }

  const handleCompleteClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setCompletionNotes('')
    setCompleteDialogOpen(true)
  }

  const handleConfirmComplete = () => {
    if (selectedTaskId) {
      updateTaskStatus(selectedTaskId, 'completed', completionNotes || 'Task completed successfully')
      addNotification({
        type: 'task',
        title: 'Task Completed',
        message: `Task marked as completed`,
      })
      setCompleteDialogOpen(false)
      setSelectedTaskId(null)
      setCompletionNotes('')
    }
  }

  return (
    <div className="space-y-6">
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Task</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this task.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter reason for declining..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDecline}
              disabled={!declineReason.trim()}
            >
              Decline Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Add completion notes (optional).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add notes about the completed work..."
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmComplete}>
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">View and manage your assigned tasks</p>
      </div>

      <div className="space-y-4">
        {myTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tasks assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          myTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    <Badge className={cn(
                      task.priority === 'urgent' && 'bg-red-500',
                      task.priority === 'high' && 'bg-orange-500',
                      task.priority === 'medium' && 'bg-blue-500',
                      task.priority === 'low' && 'bg-gray-500'
                    )}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{task.category}</span>
                </div>
                
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <p className="text-muted-foreground mt-1">{task.description}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Client:</span>
                    <span>{task.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{task.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{task.scheduledDate} at {formatTime(task.scheduledTime)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {task.status === 'pending' && (
                    <>
                      <Button className="flex-1" onClick={() => handleAcceptTask(task.id)}>
                        <Check className="mr-2 h-4 w-4" /> Accept
                      </Button>
                      <Button variant="outline" className="text-destructive" onClick={() => handleDeclineClick(task.id)}>
                        <X className="mr-2 h-4 w-4" /> Decline
                      </Button>
                    </>
                  )}
                  {task.status === 'accepted' && (
                    <>
                      <Button className="flex-1" onClick={() => handleStartTask(task.id)}>
                        <Play className="mr-2 h-4 w-4" /> Start Task
                      </Button>
                      <Button variant="outline">
                        <Navigation className="mr-2 h-4 w-4" /> Navigate
                      </Button>
                      <Button variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {task.status === 'in_progress' && (
                    <Button className="flex-1" onClick={() => handleCompleteClick(task.id)}>
                      <Check className="mr-2 h-4 w-4" /> Complete Task
                    </Button>
                  )}
                  {task.status === 'completed' && (
                    <Button variant="outline" className="w-full" disabled>
                      <Check className="mr-2 h-4 w-4" /> Task Completed
                    </Button>
                  )}
                  {task.status === 'cancelled' && (
                    <Button variant="outline" className="w-full" disabled>
                      Task Cancelled
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
