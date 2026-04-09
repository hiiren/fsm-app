import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { useAppStore } from '@/stores'
import { cn, formatDate, getInitials } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ClipboardCheck,
  Clock,
  Star,
  Award,
  Download,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const monthlyData = [
  { month: 'Jan', tasks: 145, completed: 138, revenue: 245000 },
  { month: 'Feb', tasks: 162, completed: 155, revenue: 278000 },
  { month: 'Mar', tasks: 178, completed: 170, revenue: 312000 },
  { month: 'Apr', tasks: 195, completed: 188, revenue: 345000 },
  { month: 'May', tasks: 210, completed: 202, revenue: 378000 },
  { month: 'Jun', tasks: 225, completed: 218, revenue: 412000 },
]

const weeklyPerformance = [
  { day: 'Mon', completed: 12, pending: 3 },
  { day: 'Tue', completed: 15, pending: 2 },
  { day: 'Wed', completed: 18, pending: 4 },
  { day: 'Thu', completed: 14, pending: 3 },
  { day: 'Fri', completed: 20, pending: 2 },
  { day: 'Sat', completed: 10, pending: 1 },
  { day: 'Sun', completed: 5, pending: 0 },
]

const categoryData = [
  { name: 'Electrical', value: 35, color: '#3B82F6' },
  { name: 'Plumbing', value: 25, color: '#10B981' },
  { name: 'AC Repair', value: 20, color: '#F59E0B' },
  { name: 'Appliance', value: 15, color: '#8B5CF6' },
  { name: 'Other', value: 5, color: '#94A3B8' },
]

const ratingDistribution = [
  { rating: '5 Stars', count: 45, color: '#10B981' },
  { rating: '4 Stars', count: 32, color: '#3B82F6' },
  { rating: '3 Stars', count: 12, color: '#F59E0B' },
  { rating: '2 Stars', count: 5, color: '#F97316' },
  { rating: '1 Star', count: 3, color: '#EF4444' },
]

export default function AnalyticsPage() {
  const { tasks, technicians, feedbacks, materials } = useAppStore()
  const [dateRange, setDateRange] = useState('month')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')
  const [exportType, setExportType] = useState('full')

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length
  const completionRate = ((completedTasks / totalTasks) * 100).toFixed(1)
  const avgRating = (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length || 0).toFixed(1)
  const totalRevenue = materials.filter(m => m.status === 'approved').reduce((acc, m) => acc + m.estimatedCost, 0)
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length

  const topTechnicians = [...technicians]
    .filter(t => t.status === 'active')
    .sort((a, b) => {
      const aScore = a.rating * 0.4 + a.stats.onTimeRate * 0.3 + (a.stats.completedTasks / 100) * 0.3
      const bScore = b.rating * 0.4 + b.stats.onTimeRate * 0.3 + (b.stats.completedTasks / 100) * 0.3
      return bScore - aScore
    })

  const handleExport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      reportType: exportType,
      dateRange,
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        overdueTasks,
        completionRate,
        avgRating,
        totalRevenue,
      },
      technicians: topTechnicians.map(t => ({
        name: t.fullName,
        zone: t.serviceZone,
        rating: t.rating,
        completedTasks: t.stats.completedTasks,
        onTimeRate: t.stats.onTimeRate,
      })),
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        client: t.clientName,
        status: t.status,
        priority: t.priority,
        category: t.category,
        scheduledDate: t.scheduledDate,
        technician: technicians.find(tech => tech.id === t.assignedTechnicianId)?.fullName || 'Unassigned',
      })),
    }

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fsm-analytics-${exportType}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (exportFormat === 'csv') {
      const headers = ['ID', 'Title', 'Client', 'Status', 'Priority', 'Category', 'Date', 'Technician']
      const rows = reportData.tasks.map(t => [t.id, `"${t.title}"`, t.client, t.status, t.priority, t.category, t.scheduledDate, t.technician])
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fsm-analytics-${exportType}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>FSM Analytics Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
            h1 { color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #334155; margin-top: 30px; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .date { color: #64748b; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
            .stat-value { font-size: 2em; font-weight: bold; color: #3b82f6; }
            .stat-label { color: #64748b; font-size: 0.9em; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 40px; text-align: center; color: #64748b; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FSM Analytics Report</h1>
            <span class="date">Generated: ${new Date().toLocaleString()}</span>
          </div>
          
          <h2>Summary Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${reportData.summary.totalTasks}</div>
              <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${reportData.summary.completedTasks}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${reportData.summary.completionRate}%</div>
              <div class="stat-label">Completion Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${reportData.summary.avgRating}</div>
              <div class="stat-label">Avg Rating</div>
            </div>
          </div>
          
          <h2>Top Technicians</h2>
          <table>
            <tr><th>Name</th><th>Zone</th><th>Rating</th><th>Completed</th><th>On-Time Rate</th></tr>
            ${reportData.technicians.map(t => `<tr><td>${t.name}</td><td>${t.zone}</td><td>${t.rating} ★</td><td>${t.completedTasks}</td><td>${t.onTimeRate}%</td></tr>`).join('')}
          </table>
          
          <h2>All Tasks</h2>
          <table>
            <tr><th>ID</th><th>Title</th><th>Client</th><th>Status</th><th>Priority</th><th>Technician</th></tr>
            ${reportData.tasks.map(t => `<tr><td>${t.id.slice(0, 8)}</td><td>${t.title}</td><td>${t.client}</td><td>${t.status}</td><td>${t.priority}</td><td>${t.technician}</td></tr>`).join('')}
          </table>
          
          <div class="footer">
            <p>Generated by D-Technician FSM System</p>
          </div>
        </body>
        </html>
      `
      const blob = new Blob([reportHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fsm-analytics-${exportType}-${new Date().toISOString().split('T')[0]}.html`
      a.click()
      URL.revokeObjectURL(url)
    }
    setShowExportDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive performance insights and metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Analytics Report</DialogTitle>
                <DialogDescription>Choose what to include in your report and the export format</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Report</SelectItem>
                      <SelectItem value="summary">Summary Only</SelectItem>
                      <SelectItem value="technicians">Technician Performance</SelectItem>
                      <SelectItem value="tasks">Tasks Overview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Export Format</label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
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
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <p className="text-sm font-medium">Report includes:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Summary statistics and KPIs</li>
                    <li>• Top performing technicians</li>
                    <li>• All tasks with details</li>
                    <li>• Performance metrics</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
                <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="mt-1 text-3xl font-bold">{totalTasks}</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-emerald-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12% from last period</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="mt-1 text-3xl font-bold">{completionRate}%</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-emerald-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5% from last period</span>
                </div>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="mt-1 text-3xl font-bold">{avgRating} <span className="text-amber-500">★</span></p>
                <div className="mt-2 flex items-center gap-1 text-sm text-emerald-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>+0.3 from last period</span>
                </div>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Star className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Material Cost</p>
                <p className="mt-1 text-3xl font-bold">₹{(totalRevenue / 1000).toFixed(0)}K</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-red-500">
                  <TrendingDown className="h-4 w-4" />
                  <span>-3% from last period</span>
                </div>
              </div>
              <div className="rounded-full bg-purple-500/10 p-3">
                <DollarSign className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={monthlyData}>
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
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
            <div className="mt-4 space-y-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className="font-medium">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map((r) => (
                <div key={r.rating} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{r.rating}</span>
                    <span className="font-medium">{r.count}</span>
                  </div>
                  <Progress value={(r.count / 50) * 100} className="h-2" />
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-accent/50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-500">{avgRating}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyPerformance.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={weeklyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Technician Leaderboard</CardTitle>
          <Badge variant="outline">{topTechnicians.length} Active</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTechnicians.map((tech, index) => (
              <div key={tech.id} className="flex items-center gap-4 rounded-lg border p-4">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full font-bold',
                  index === 0 ? 'bg-amber-500/20 text-amber-500' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400' :
                  index === 2 ? 'bg-amber-700/20 text-amber-700' :
                  'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={tech.profilePhoto} />
                  <AvatarFallback>{getInitials(tech.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{tech.fullName}</p>
                  <p className="text-sm text-muted-foreground">{tech.serviceZone}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{tech.stats.completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{tech.stats.onTimeRate}%</p>
                  <p className="text-xs text-muted-foreground">On-time</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span className="text-lg font-bold">{tech.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SLA Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>On-time Completion</span>
              </div>
              <span className="font-bold">94%</span>
            </div>
            <Progress value={94} className="h-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span>Within 1 hour buffer</span>
              </div>
              <span className="font-bold">89%</span>
            </div>
            <Progress value={89} className="h-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-500" />
                <span>SLA Breach</span>
              </div>
              <span className="font-bold text-red-500">6%</span>
            </div>
            <Progress value={6} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Requests</span>
              <span className="font-bold">{materials.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Approved</span>
              <span className="font-bold text-emerald-500">{materials.filter(m => m.status === 'approved').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending</span>
              <span className="font-bold text-amber-500">{materials.filter(m => m.status === 'pending').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rejected</span>
              <span className="font-bold text-red-500">{materials.filter(m => m.status === 'rejected').length}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Cost</span>
                <span className="text-lg font-bold text-purple-500">₹{totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
