import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/stores'
import { cn, getStatusColor, getPriorityColor, getPriorityBg, formatTime, formatDate, getRelativeTime, getInitials } from '@/lib/utils'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import {
  Search,
  Plus,
  Filter,
  MapPin,
  Phone,
  Clock,
  Calendar,
  MoreVertical,
  GripVertical,
  ChevronRight,
  ClipboardList,
  User,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  MessageSquare,
  FileText,
  Image,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const categories = ['Electrical', 'Plumbing', 'AC Repair', 'Appliance Repair', 'General', 'Installation']
const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
const statuses: TaskStatus[] = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'overdue']

const statusColumns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'text-amber-500' },
  { status: 'accepted', label: 'Accepted', color: 'text-blue-500' },
  { status: 'in_progress', label: 'In Progress', color: 'text-purple-500' },
  { status: 'completed', label: 'Completed', color: 'text-emerald-500' },
]

interface TaskCardProps {
  task: Task
  onClick: () => void
  onCancelTask: (taskId: string) => void
}

function TaskCard({ task, onClick, onCancelTask }: TaskCardProps) {
  const { technicians } = useAppStore()
  const technician = technicians.find(t => t.id === task.assignedTechnicianId)

  return (
    <div
      className="group cursor-pointer rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">#{task.id.slice(0, 8)}</span>
            <Badge className={cn(getPriorityBg(task.priority), getPriorityColor(task.priority), 'text-[10px] px-1.5 py-0')}>
              {task.priority}
            </Badge>
          </div>
          <h4 className="mt-1 font-medium leading-tight">{task.title}</h4>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>View Details</DropdownMenuItem>
            <DropdownMenuItem>Reassign</DropdownMenuItem>
            <DropdownMenuItem>Add Note</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onCancelTask(task.id)}>Cancel Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[100px]">{task.location.address.split(',')[0]}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {technician && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={technician.profilePhoto} />
              <AvatarFallback className="text-[10px]">{getInitials(technician.fullName)}</AvatarFallback>
            </Avatar>
          )}
          <span className="text-xs text-muted-foreground">{technician?.fullName.split(' ')[0] || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTime(task.scheduledTime)}</span>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { tasks, technicians, requirements, addTask, updateTaskStatus, addNotification } = useAppStore()
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [technicianFilter, setTechnicianFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    clientName: '',
    clientPhone: '',
    address: '',
    category: '',
    priority: 'medium' as TaskPriority,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    assignedTechnicianId: '',
  })

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.clientName || !newTask.assignedTechnicianId) return
    
    addTask({
      title: newTask.title,
      description: newTask.description,
      clientName: newTask.clientName,
      clientPhone: newTask.clientPhone,
      location: {
        address: newTask.address,
        lat: 19.076,
        lng: 72.877,
      },
      category: newTask.category || 'General',
      priority: newTask.priority,
      status: 'pending',
      scheduledDate: newTask.scheduledDate,
      scheduledTime: newTask.scheduledTime,
      estimatedDuration: 60,
      assignedTechnicianId: newTask.assignedTechnicianId,
    })
    
    const tech = technicians.find(t => t.id === newTask.assignedTechnicianId)
    addNotification({
      type: 'task',
      title: 'New Task Assigned',
      message: `${newTask.title} has been assigned to ${tech?.fullName || 'technician'}`,
    })
    
    setNewTask({
      title: '',
      description: '',
      clientName: '',
      clientPhone: '',
      address: '',
      category: '',
      priority: 'medium',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '10:00',
      assignedTechnicianId: '',
    })
    setShowCreateDialog(false)
  }

  const handleCancelTask = (taskId: string) => {
    updateTaskStatus(taskId, 'cancelled', 'Task cancelled by admin')
    addNotification({
      type: 'task',
      title: 'Task Cancelled',
      message: `Task has been cancelled`,
    })
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesTechnician = technicianFilter === 'all' || task.assignedTechnicianId === technicianFilter
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesDate = dateFilter === 'all' ? true : 
      dateFilter === 'today' ? task.scheduledDate === new Date().toISOString().split('T')[0] : true
    
    // Zone check: In this mock, zone is on technician instead of task location, but ideally we match task location. 
    // We'll skip deep zone check or assume matchesZone is always true if not checking tech zone.
    let matchesZone = true;
    if (zoneFilter !== 'all') {
      const tech = technicians.find(t => t.id === task.assignedTechnicianId);
      matchesZone = tech ? tech.serviceZone === zoneFilter : false;
    }

    return matchesSearch && matchesPriority && matchesTechnician && matchesStatus && matchesDate && matchesZone;
  })

  const selectedTaskData = selectedTask ? tasks.find(t => t.id === selectedTask) : null
  const selectedTech = selectedTaskData ? technicians.find(t => t.id === selectedTaskData.assignedTechnicianId) : null

  const getTasksByStatus = (status: TaskStatus) => filteredTasks.filter(t => t.status === status)

  const todayTasks = tasks.filter(t => t.scheduledDate === new Date().toISOString().split('T')[0])
  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const completedToday = tasks.filter(t => t.status === 'completed').length
  const overdueCount = tasks.filter(t => t.status === 'overdue').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Manage and track all field service tasks</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Fill in the details to assign a new service task</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe the task scope..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Client Name</label>
                  <Input
                    placeholder="Client name"
                    value={newTask.clientName}
                    onChange={(e) => setNewTask({ ...newTask, clientName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Client Phone</label>
                  <Input
                    placeholder="+91 XXXXX XXXXX"
                    value={newTask.clientPhone}
                    onChange={(e) => setNewTask({ ...newTask, clientPhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  placeholder="Full address"
                  value={newTask.address}
                  onChange={(e) => setNewTask({ ...newTask, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select onValueChange={(v: string) => setNewTask({ ...newTask, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select onValueChange={(v: string) => setNewTask({ ...newTask, priority: v as TaskPriority })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Technician</label>
                  <Select onValueChange={(v: string) => setNewTask({ ...newTask, assignedTechnicianId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.filter(t => t.status === 'active').map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>{tech.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Scheduled Date</label>
                  <Input
                    type="date"
                    value={newTask.scheduledDate}
                    onChange={(e) => setNewTask({ ...newTask, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Scheduled Time</label>
                  <Input
                    type="time"
                    value={newTask.scheduledTime}
                    onChange={(e) => setNewTask({ ...newTask, scheduledTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateTask} disabled={!newTask.title || !newTask.clientName || !newTask.assignedTechnicianId}>Create & Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setPriorityFilter('pending')}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setPriorityFilter('in_progress')}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Play className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setPriorityFilter('completed')}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedToday}</p>
              <p className="text-xs text-muted-foreground">Completed Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setPriorityFilter('overdue')}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-red-500/10 p-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayTasks.length}</p>
              <p className="text-xs text-muted-foreground">Today's Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="w-[250px] pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorities.map((p) => (
                <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</SelectItem>
              ))}
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setTechnicianFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>{tech.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {viewMode === 'kanban' ? (
          <div className="flex-1">
            <div className="grid gap-4 lg:grid-cols-4">
              {statusColumns.map((col) => (
                <div key={col.status} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', col.color.replace('text-', 'bg-'))} />
                      <h3 className="font-semibold">{col.label}</h3>
                    </div>
                    <Badge variant="secondary">{getTasksByStatus(col.status).length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {getTasksByStatus(col.status).map((task) => (
                      <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task.id)} onCancelTask={handleCancelTask} />
                    ))}
                    {getTasksByStatus(col.status).length === 0 && (
                      <div className="rounded-lg border border-dashed p-6 text-center">
                        <p className="text-sm text-muted-foreground">No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredTasks.map((task) => {
                    const tech = technicians.find(t => t.id === task.assignedTechnicianId)
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedTask(task.id)}
                      >
                        <div className={cn('h-3 w-3 rounded-full', task.status === 'completed' ? 'bg-emerald-500' : task.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500')} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{task.title}</p>
                            <Badge className={cn(getPriorityBg(task.priority), getPriorityColor(task.priority), 'text-[10px] px-1.5 py-0')}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.clientName}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(task.scheduledDate)}</p>
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={tech?.profilePhoto} />
                          <AvatarFallback>{tech ? getInitials(tech.fullName) : 'T'}</AvatarFallback>
                        </Avatar>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTaskData && (
          <Card className="w-full lg:w-[400px]">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className={cn(getPriorityBg(selectedTaskData.priority), getPriorityColor(selectedTaskData.priority))}>
                    {selectedTaskData.priority}
                  </Badge>
                  <CardTitle className="mt-2 text-lg">{selectedTaskData.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">#{selectedTaskData.id.slice(0, 8)}</p>
                </div>
                <Badge className={getStatusColor(selectedTaskData.status)}>{selectedTaskData.status.replace('_', ' ')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Client</p>
                      <p className="text-sm text-muted-foreground">{selectedTaskData.clientName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTaskData.clientPhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                      <span>{selectedTaskData.location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(selectedTaskData.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(selectedTaskData.scheduledTime)} ({selectedTaskData.estimatedDuration} min)</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedTaskData.description}</p>
                  </div>

                  {selectedTech ? (
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium mb-2">Assigned Technician</p>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={selectedTech.profilePhoto} />
                          <AvatarFallback>{getInitials(selectedTech.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedTech.fullName}</p>
                          <p className="text-xs text-muted-foreground">{selectedTech.serviceZone}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm font-medium text-amber-800 mb-2">Assign Technician</p>
                      <Select onValueChange={(techId) => useAppStore.getState().assignTechnician(selectedTaskData.id, techId)}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.filter(t => t.status === 'active').map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>{tech.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-4">
                    {selectedTaskData.timeline.map((entry, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn('h-3 w-3 rounded-full', entry.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500')} />
                          {i < selectedTaskData.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-sm capitalize">{entry.status.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">{getRelativeTime(entry.timestamp)}</p>
                          {entry.note && <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="mt-4">
                  <div className="space-y-3">
                    {selectedTaskData.materials.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">No material requests</p>
                    ) : (
                      selectedTaskData.materials.map((mat) => (
                        <div key={mat.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{mat.itemName}</p>
                            <Badge className={getStatusColor(mat.status)}>{mat.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{mat.quantity} {mat.unit} • ₹{mat.estimatedCost}</p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="mr-1 h-4 w-4" /> Message
                </Button>
                <Button size="sm" className="flex-1">
                  <FileText className="mr-1 h-4 w-4" /> Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
