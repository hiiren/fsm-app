import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/stores'
import { cn, getStatusColor, getInitials } from '@/lib/utils'
import {
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  Navigation,
  RefreshCw,
  Users,
  Activity,
  TrendingUp,
  Calendar,
  Filter,
} from 'lucide-react'

export default function MonitoringPage() {
  const { technicians, tasks } = useAppStore()
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLastUpdated(new Date())
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isLive])

  const activeTechnicians = technicians.filter(t => t.status === 'active')
  const selectedTechData = selectedTech ? technicians.find(t => t.id === selectedTech) : null
  const techTasks = selectedTechData ? tasks.filter(t => t.assignedTechnicianId === selectedTech) : []

  const MumbaiCoordinates = { lat: 19.076, lng: 72.877 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Technician Monitoring</h1>
          <p className="text-muted-foreground">Real-time location tracking and performance monitoring</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={cn('h-2 w-2 rounded-full', isLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500')} />
            <span>{isLive ? 'Live' : 'Paused'}</span>
          </div>
          <Button
            variant={isLive ? 'outline' : 'default'}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', isLive && 'animate-spin')} />
            {isLive ? 'Live Tracking' : 'Resume'}
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeTechnicians.length}</p>
              <p className="text-sm text-muted-foreground">Active Technicians</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p>
              <p className="text-sm text-muted-foreground">Currently Working</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-purple-500/10 p-3">
              <Navigation className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p>
              <p className="text-sm text-muted-foreground">On-Site</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'overdue').length}</p>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Live Map</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  Available
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Working
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="h-2 w-2 rounded-full bg-gray-500" />
                  Offline
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px] rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 400 400">
                  <path d="M0,100 Q100,80 200,120 T400,100" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                  <path d="M0,200 Q150,180 250,220 T400,200" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                  <path d="M0,300 Q120,280 220,320 T400,300" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                  <path d="M100,0 Q80,100 120,200 T100,400" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                  <path d="M200,0 Q180,150 220,250 T200,400" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                  <path d="M300,0 Q280,80 320,180 T300,400" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                </svg>
              </div>

              {activeTechnicians.map((tech, index) => {
                const angle = (index / activeTechnicians.length) * 2 * Math.PI
                const radius = 80 + Math.random() * 40
                const x = 200 + radius * Math.cos(angle)
                const y = 200 + radius * Math.sin(angle)
                const isSelected = selectedTech === tech.id
                const currentTask = tasks.find(t => t.assignedTechnicianId === tech.id && t.status === 'in_progress')

                return (
                  <div
                    key={tech.id}
                    className={cn(
                      'absolute transition-all duration-500 cursor-pointer',
                      isSelected && 'z-20'
                    )}
                    style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
                    onClick={() => setSelectedTech(tech.id)}
                  >
                    <div className={cn(
                      'relative',
                      isSelected && 'scale-125'
                    )}>
                      <Avatar className={cn(
                        'h-10 w-10 border-2 transition-all',
                        isSelected ? 'border-primary shadow-lg shadow-primary/50' : 'border-white',
                        currentTask ? 'ring-2 ring-blue-500' : ''
                      )}>
                        <AvatarImage src={tech.profilePhoto} />
                        <AvatarFallback>{getInitials(tech.fullName)}</AvatarFallback>
                      </Avatar>
                      {currentTask && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 animate-pulse border-2 border-white" />
                      )}
                      <div className={cn(
                        'absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-background border whitespace-nowrap',
                        isSelected ? 'border-primary' : 'border-white/50'
                      )}>
                        {tech.fullName.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-2">Mumbai Area</p>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span>{MumbaiCoordinates.lat.toFixed(3)}, {MumbaiCoordinates.lng.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTechnicians.map((tech) => {
              const currentTask = tasks.find(t => t.assignedTechnicianId === tech.id && t.status === 'in_progress')
              const todayTasks = techTasks.filter(t => t.assignedTechnicianId === tech.id)
              const completedToday = todayTasks.filter(t => t.status === 'completed').length

              return (
                <div
                  key={tech.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                    selectedTech === tech.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'
                  )}
                  onClick={() => setSelectedTech(tech.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={tech.profilePhoto} />
                    <AvatarFallback>{getInitials(tech.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{tech.fullName}</p>
                    <p className="text-xs text-muted-foreground">{tech.serviceZone}</p>
                    {currentTask && (
                      <p className="text-xs text-blue-500 mt-1">Working: {currentTask.title}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{tech.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{completedToday} done</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {selectedTechData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedTechData.profilePhoto} />
                  <AvatarFallback className="text-lg">{getInitials(selectedTechData.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedTechData.fullName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedTechData.serviceZone}</p>
                </div>
              </div>
              <Badge className={getStatusColor(selectedTechData.status)}>
                {selectedTechData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="route">Route</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTechData.mobile}</span>
                      </div>
                      {selectedTechData.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{selectedTechData.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTechData.serviceZone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Location</h4>
                    <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/20 p-2">
                          <Navigation className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {selectedTechData.currentLocation ? (
                              `${selectedTechData.currentLocation.lat.toFixed(4)}, ${selectedTechData.currentLocation.lng.toFixed(4)}`
                            ) : 'Location unavailable'}
                          </p>
                          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-accent/50 p-4 text-center">
                      <p className="text-2xl font-bold">{techTasks.filter(t => t.status === 'completed').length}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 p-4 text-center">
                      <p className="text-2xl font-bold">{techTasks.filter(t => t.status === 'in_progress').length}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-4 text-center">
                      <p className="text-2xl font-bold">{techTasks.filter(t => t.status === 'pending').length}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {techTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.clientName}</p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-lg border p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        <span className="text-2xl font-bold">{selectedTechData.rating}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold">{selectedTechData.stats.completedTasks}</p>
                      <p className="text-sm text-muted-foreground">Total Completed</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold">{selectedTechData.stats.onTimeRate}%</p>
                      <p className="text-sm text-muted-foreground">On-Time Rate</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-2xl font-bold">{selectedTechData.stats.avgCompletionTime}m</p>
                      <p className="text-sm text-muted-foreground">Avg Time</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Task Completion Rate</span>
                      <span className="font-medium">{((selectedTechData.stats.completedTasks / selectedTechData.stats.totalTasks) * 100 || 0).toFixed(0)}%</span>
                    </div>
                    <Progress value={(selectedTechData.stats.completedTasks / selectedTechData.stats.totalTasks) * 100 || 0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>On-Time Delivery</span>
                      <span className="font-medium">{selectedTechData.stats.onTimeRate}%</span>
                    </div>
                    <Progress value={selectedTechData.stats.onTimeRate} className="h-2" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="route" className="mt-4">
                <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-6 min-h-[300px]">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Route history for today</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {techTasks.filter(t => t.status === 'completed').length} stops completed
                      </p>
                      <div className="mt-4 flex justify-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-emerald-500" />
                          <span className="text-sm">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                          <span className="text-sm">Current</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-gray-500" />
                          <span className="text-sm">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
