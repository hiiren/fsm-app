import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/stores'
import { getRelativeTime, cn } from '@/lib/utils'
import { getPageLogs, getErrorLogs, clearLogs, exportLogs, downloadLogs, type LogEntry } from '@/lib/logger'
import {
  AlertTriangle,
  Search,
  Trash2,
  FileText,
  Download,
  AlertCircle,
  Info,
  CircleDot,
} from 'lucide-react'

const levelIcons: Record<string, React.ElementType> = {
  error: AlertCircle,
  warn: AlertTriangle,
  info: Info,
  debug: CircleDot,
}

const levelColors: Record<string, string> = {
  error: 'text-red-500',
  warn: 'text-amber-500',
  info: 'text-blue-500',
  debug: 'text-muted-foreground',
}

export default function LogsPage() {
  const { errorLogs, clearErrorLogs } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [panelFilter, setPanelFilter] = useState<'all' | 'admin' | 'technician' | 'login'>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all')
  const [selectedLog, setSelectedLog] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'structured' | 'store'>('structured')

  const structuredLogs = useMemo(() => {
    let logs = getPageLogs()
    
    if (panelFilter !== 'all') {
      logs = logs.filter(log => log.panel === panelFilter)
    }
    
    if (levelFilter !== 'all') {
      logs = logs.filter(log => log.level === levelFilter)
    }
    
    if (searchTerm) {
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return logs
  }, [searchTerm, panelFilter, levelFilter])

  const filteredStoreLogs = errorLogs.filter(log => {
    const matchesSearch = log.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter
    return matchesSearch && matchesSource
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Logs</h1>
          <p className="text-muted-foreground">Review and analyze application errors</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => downloadLogs()}>
            <Download className="mr-2 h-4 w-4" /> Export Logs
          </Button>
          <Button variant="outline" onClick={() => clearLogs()}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear Logs
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by error message, page, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={panelFilter} onValueChange={(v: 'all' | 'admin' | 'technician' | 'login') => setPanelFilter(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Panel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Panels</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="technician">Technician</SelectItem>
            <SelectItem value="login">Login</SelectItem>
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={(v: 'all' | 'error' | 'warn' | 'info') => setLevelFilter(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{structuredLogs.filter(l => l.level === 'error').length}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{structuredLogs.filter(l => l.level === 'warn').length}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{structuredLogs.filter(l => l.level === 'info').length}</p>
                <p className="text-sm text-muted-foreground">Info</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{structuredLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {structuredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>No logs found</p>
              {searchTerm && (
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {structuredLogs.slice(0, 50).map((log, idx) => {
                const LevelIcon = levelIcons[log.level] || Info
                return (
                  <div
                    key={log.timestamp + idx}
                    className="rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer"
                    onClick={() => setSelectedLog(selectedLog === log.message ? null : log.message)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{log.panel}</Badge>
                          <Badge variant="secondary">{log.page}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {getRelativeTime(log.timestamp)}
                          </span>
                          <LevelIcon className={cn('h-4 w-4', levelColors[log.level])} />
                        </div>
                        <p className="text-sm font-medium">{log.message}</p>
                        {log.details && Object.keys(log.details).length > 0 && selectedLog === log.message && (
                          <div className="mt-2 rounded bg-muted p-2">
                            <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
