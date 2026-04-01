import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/stores'
import { cn, getStatusColor, getPriorityColor, getPriorityBg, formatTime, formatDate, getRelativeTime, getInitials } from '@/lib/utils'
import type { TaskPriority } from '@/types'
import {
  Users,
  ClipboardCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar,
  ArrowRight,
  Activity,
  Download,
  Plus,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const taskStatusData = [
  { name: 'Pending', value: 12, color: '#F59E0B' },
  { name: 'In Progress', value: 8, color: '#8B5CF6' },
  { name: 'Completed', value: 45, color: '#10B981' },
  { name: 'Overdue', value: 3, color: '#EF4444' },
]

const weeklyData = [
  { day: 'Mon', tasks: 12, completed: 10 },
  { day: 'Tue', tasks: 15, completed: 13 },
  { day: 'Wed', tasks: 18, completed: 16 },
  { day: 'Thu', tasks: 14, completed: 12 },
  { day: 'Fri', tasks: 20, completed: 17 },
  { day: 'Sat', tasks: 8, completed: 7 },
  { day: 'Sun', tasks: 5, completed: 4 },
]

const zoneData = [
  { zone: 'North Mumbai', tasks: 28, color: '#3B82F6' },
  { zone: 'South Mumbai', tasks: 22, color: '#10B981' },
  { zone: 'Central', tasks: 18, color: '#F59E0B' },
  { zone: 'West', tasks: 15, color: '#8B5CF6' },
  { zone: 'East', tasks: 12, color: '#EF4444' },
]

const categories = ['Electrical', 'Plumbing', 'AC Repair', 'Appliance Repair', 'General', 'Installation']
const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  iconColor?: string
  onClick?: () => void
}

function StatCard({ title, value, change, icon: Icon, iconColor = 'text-primary', onClick }: StatCardProps) {
  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200' : 'hover:shadow-lg transition-shadow duration-200'} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            {change !== undefined && (
              <div className={cn('mt-2 flex items-center gap-1 text-sm', change >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(change)}% from last week</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-lg bg-primary/10 p-3', iconColor)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { tasks, technicians, requirements, notifications, addTask } = useAppStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState('pdf')
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

  const activeTechnicians = technicians.filter(t => t.status === 'active').length
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'accepted').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const completedToday = tasks.filter(t => t.status === 'completed').length
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length
  const newRequirements = requirements.filter(r => r.status === 'new').length

  const topTechnicians = [...technicians]
    .filter(t => t.status === 'active')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.clientName || !newTask.assignedTechnicianId) {
      alert('Please fill in all required fields')
      return
    }
    addTask({
      title: newTask.title,
      description: newTask.description,
      clientName: newTask.clientName,
      clientPhone: newTask.clientPhone,
      location: {
        address: newTask.address || 'Address not provided',
        lat: 19.076 + Math.random() * 0.1,
        lng: 72.877 + Math.random() * 0.1,
      },
      category: newTask.category || 'General',
      priority: newTask.priority,
      status: 'pending',
      scheduledDate: newTask.scheduledDate,
      scheduledTime: newTask.scheduledTime,
      estimatedDuration: 60,
      assignedTechnicianId: newTask.assignedTechnicianId,
    })
    setShowCreateDialog(false)
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
  }

  const handleDownloadReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalTasks: tasks.length,
        completed: completedToday,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        overdue: overdueTasks,
        activeTechnicians,
      },
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        client: t.clientName,
        status: t.status,
        priority: t.priority,
        technician: technicians.find(tech => tech.id === t.assignedTechnicianId)?.fullName || 'Unassigned',
      })),
    }

    if (downloadFormat === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fsm-report-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (downloadFormat === 'csv') {
      const headers = ['ID', 'Title', 'Client', 'Status', 'Priority', 'Technician']
      const rows = reportData.tasks.map(t => [t.id, t.title, t.client, t.status, t.priority, t.technician])
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fsm-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const reportHTML = `
        <html>
          <head>
            <title>FSM Report - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1e293b; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #3b82f6; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Field Service Management Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <h2>Summary</h2>
            <ul>
              <li>Total Tasks: ${reportData.summary.totalTasks}</li>
              <li>Completed: ${reportData.summary.completed}</li>
              <li>Pending: ${reportData.summary.pending}</li>
              <li>In Progress: ${reportData.summary.inProgress}</li>
              <li>Overdue: ${reportData.summary.overdue}</li>
              <li>Active Technicians: ${reportData.summary.activeTechnicians}</li>
            </ul>
            <h2>Task Details</h2>
            <table>
              <tr><th>ID</th><th>Title</th><th>Client</th><th>Status</th><th>Priority</th><th>Technician</th></tr>
              ${reportData.tasks.map(t => `<tr><td>${t.id.slice(0, 8)}</td><td>${t.title}</td><td>${t.client}</td><td>${t.status}</td><td>${t.priority}</td><td>${t.technician}</td></tr>`).join('')}
            </table>
          </body>
        </html>
      `
      const blob = new Blob([reportHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fsm-report-${new Date().toISOString().split('T')[0]}.html`
      a.click()
      URL.revokeObjectURL(url)
    }
    setShowDownloadDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => useAppStore.getState().simulateShopifyWebhook()}>
            Simulate Shopify Booking
          </Button>
          <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Download Report</DialogTitle>
                <DialogDescription>Select the format for your report download</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Format</label>
                  <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report (HTML)</SelectItem>
                      <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-2">Report includes:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Task summary statistics</li>
                    <li>• All tasks with status and priority</li>
                    <li>• Assigned technician information</li>
                    <li>• Client details</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDownloadDialog(false)}>Cancel</Button>
                <Button onClick={handleDownloadReport}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  <label className="text-sm font-medium">Task Title *</label>
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
                    <label className="text-sm font-medium">Client Name *</label>
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
                    <label className="text-sm font-medium">Technician *</label>
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
                <Button onClick={handleCreateTask}>Create & Assign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Technicians"
          value={activeTechnicians}
          change={12}
          icon={Users}
          iconColor="text-emerald-500"
          onClick={() => navigate('/admin/technicians')}
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          change={-5}
          icon={Clock}
          iconColor="text-amber-500"
          onClick={() => navigate('/admin/tasks')}
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks}
          icon={Activity}
          iconColor="text-purple-500"
          onClick={() => navigate('/admin/tasks')}
        />
        <StatCard
          title="Completed Today"
          value={completedToday}
          change={23}
          icon={CheckCircle2}
          iconColor="text-blue-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Task Overview</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer">Weekly</Badge>
              <Badge variant="outline" className="cursor-pointer">Monthly</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTasks)" />
                  <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">Total Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            {taskStatusData.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
            <div className="mt-4 space-y-2">
              {taskStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Performers</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/technicians')}>View All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {topTechnicians.map((tech, index) => (
              <div key={tech.id} className="flex items-center gap-4">
                <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={tech.profilePhoto} />
                  <AvatarFallback>{getInitials(tech.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{tech.fullName}</p>
                  <p className="text-xs text-muted-foreground">{tech.stats.completedTasks} tasks completed</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-amber-500">★</span>
                    <span className="font-medium">{tech.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tech.stats.onTimeRate}% on-time</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tasks by Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {zoneData.map((zone) => (
              <div key={zone.zone} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{zone.zone}</span>
                  <span className="font-medium">{zone.tasks}</span>
                </div>
                <Progress value={(zone.tasks / 30) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className="flex gap-3">
                <div className={cn(
                  'mt-1 h-2 w-2 shrink-0 rounded-full',
                  notif.type === 'alert' ? 'bg-red-500' :
                  notif.type === 'task' ? 'bg-blue-500' :
                  notif.type === 'material' ? 'bg-amber-500' : 'bg-emerald-500'
                )} />
                <div className="flex-1">
                  <p className="text-sm">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{getRelativeTime(notif.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Requirements</CardTitle>
            <Badge variant="warning">{newRequirements} pending</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {requirements.filter(r => r.status === 'new').slice(0, 3).map((req) => (
              <div key={req.id} className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50 cursor-pointer" onClick={() => navigate('/admin/requirements')}>
                <div className="rounded-lg bg-primary/10 p-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{req.clientName}</p>
                  <p className="text-sm text-muted-foreground">{req.serviceType}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(req.preferredDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(req.preferredTime)}
                    </span>
                  </div>
                </div>
                <Button size="sm">Review</Button>
              </div>
            ))}
            {requirements.filter(r => r.status === 'new').length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No pending requirements</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Tasks</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/tasks')}>View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.filter(t => t.status === 'in_progress' || t.status === 'accepted').slice(0, 3).map((task) => {
              const technician = technicians.find(t => t.id === task.assignedTechnicianId)
              return (
                <div key={task.id} className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50 cursor-pointer" onClick={() => navigate('/admin/tasks')}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={technician?.profilePhoto} />
                    <AvatarFallback>{technician ? getInitials(technician.fullName) : 'T'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{task.title}</p>
                      <Badge className={cn(getPriorityBg(task.priority), getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{technician?.fullName}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.location.address.split(',')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(task.scheduledTime)}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
