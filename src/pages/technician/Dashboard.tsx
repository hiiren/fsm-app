import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore, useAuthStore } from '@/stores'
import { cn, formatTime, getStatusColor, getPriorityColor, getPriorityBg, getInitials } from '@/lib/utils'
import {
  Home,
  ClipboardList,
  Calendar,
  User,
  Bell,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'tasks', icon: ClipboardList, label: 'Tasks' },
  { id: 'schedule', icon: Calendar, label: 'Schedule' },
  { id: 'profile', icon: User, label: 'Profile' },
]

export default function TechnicianDashboard() {
  const { tasks, technicians, feedbacks, notifications, updateTaskStatus, addNotification } = useAppStore()
  const { user } = useAuthStore()
  const [activeNav, setActiveNav] = useState('home')
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const techId = 'tech-001'
  const myTasks = tasks.filter(t => t.assignedTechnicianId === techId)
  const todayTasks = myTasks.filter(t => t.scheduledDate === today)
  const completedToday = todayTasks.filter(t => t.status === 'completed').length
  const activeTask = todayTasks.find(t => t.status === 'in_progress' || t.status === 'accepted')
  const upcomingTasks = todayTasks.filter(t => t.status === 'pending' || t.status === 'accepted').slice(0, 3)

  const tech = technicians.find(t => t.id === techId)
  const myFeedbacks = feedbacks.filter(f => f.technicianId === techId)
  const avgRating = myFeedbacks.length > 0 ? (myFeedbacks.reduce((acc, f) => acc + f.rating, 0) / myFeedbacks.length).toFixed(1) : '0'

  const unreadCount = notifications.filter(n => !n.read).length

  const handleAcceptTask = (taskId: string) => {
    updateTaskStatus(taskId, 'accepted', 'Task accepted by technician')
    addNotification({
      type: 'task',
      title: 'Task Accepted',
      message: `You have accepted task ${taskId}`,
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
        message: `You have declined task ${selectedTaskId}`,
      })
      setDeclineDialogOpen(false)
      setSelectedTaskId(null)
      setDeclineReason('')
    }
  }

  const profilePhoto = user?.profilePhoto || tech?.profilePhoto

  return (
    <div className="min-h-screen bg-background pb-20">
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

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profilePhoto} />
              <AvatarFallback>{user ? getInitials(user.name) : (tech ? getInitials(tech.fullName) : 'T')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Hello, {user?.name?.split(' ')[0] || tech?.fullName?.split(' ')[0]}!</p>
              <p className="text-xs text-muted-foreground">
                {todayTasks.length} tasks today
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {activeNav === 'home' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-500">{completedToday}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-amber-500">{upcomingTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/20">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <p className="text-2xl font-bold">{avgRating}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </CardContent>
              </Card>
            </div>

            {activeTask && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <Badge variant="info" className="text-xs">In Progress</Badge>
                  </div>
                  <h3 className="font-semibold">{activeTask.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{activeTask.clientName}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {activeTask.location.address.split(',')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(activeTask.scheduledTime)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1" size="sm">
                      <Navigation className="mr-2 h-4 w-4" /> Navigate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-3">Upcoming Tasks</h2>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <Card key={task.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge className={cn(getPriorityBg(task.priority), getPriorityColor(task.priority), 'text-[10px]')}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{task.clientName}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(task.scheduledTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {task.location.address.split(',')[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {task.status === 'pending' && (
                            <>
                              <Button size="sm" className="h-8" onClick={() => handleAcceptTask(task.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-destructive" onClick={() => handleDeclineClick(task.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {task.status === 'accepted' && (
                            <Badge className={getStatusColor(task.status)}>
                              Accepted
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {activeNav === 'tasks' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">All Tasks</h2>
            {myTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={cn(getPriorityBg(task.priority), getPriorityColor(task.priority))}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.clientName}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{task.scheduledDate}</span>
                    <span>{formatTime(task.scheduledTime)}</span>
                  </div>
                  {task.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => handleAcceptTask(task.id)}>
                        <Check className="mr-1 h-4 w-4" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeclineClick(task.id)}>
                        <X className="mr-1 h-4 w-4" /> Decline
                      </Button>
                    </div>
                  )}
                  {task.status === 'accepted' && (
                    <Button size="sm" className="mt-3" onClick={() => updateTaskStatus(task.id, 'in_progress', 'Started working on task')}>
                      Start Task
                    </Button>
                  )}
                  {task.status === 'in_progress' && (
                    <Button size="sm" className="mt-3" onClick={() => updateTaskStatus(task.id, 'completed', 'Task completed')}>
                      Complete Task
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeNav === 'schedule' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Today's Schedule</h2>
            {todayTasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No tasks scheduled for today</p>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                {todayTasks.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)).map((task) => (
                  <div key={task.id} className="relative pl-10 pb-6">
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="bg-card rounded-lg border p-4">
                      <p className="text-sm font-medium text-primary">{formatTime(task.scheduledTime)}</p>
                      <h4 className="font-medium mt-1">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.clientName}</p>
                      <Badge className={cn('mt-2', getStatusColor(task.status))}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeNav === 'profile' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePhoto} />
                <AvatarFallback className="text-2xl">{user ? getInitials(user.name) : (tech ? getInitials(tech.fullName) : 'T')}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">{user?.name || tech?.fullName}</h2>
              <p className="text-muted-foreground">{user?.phone || tech?.mobile}</p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span className="text-lg font-bold">{tech?.rating}</span>
                <span className="text-muted-foreground">({myFeedbacks.length} reviews)</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{tech?.stats.completedTasks}</p>
                    <p className="text-xs text-muted-foreground">Tasks Done</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{tech?.stats.onTimeRate}%</p>
                    <p className="text-xs text-muted-foreground">On-time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{tech?.stats.avgCompletionTime}m</p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Skills</span>
                  <div className="flex gap-1">
                    {tech?.skills.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service Zone</span>
                  <span>{tech?.serviceZone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(tech?.status || 'active')}>
                    {tech?.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                activeNav === item.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
