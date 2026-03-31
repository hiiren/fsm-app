import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores'
import { cn, getRelativeTime, formatTime } from '@/lib/utils'
import {
  MessageSquare,
  Send,
  Check,
  CheckCheck,
  Clock,
  X,
  Search,
  Phone,
  FileText,
  Image,
  Megaphone,
  Users,
  Settings,
} from 'lucide-react'

const messageTemplates = [
  { id: 1, name: 'Service Confirmed', content: 'Your service request has been confirmed. Technician {{technician_name}} will visit on {{date}} at {{time}}.' },
  { id: 2, name: 'Technician En Route', content: 'Your technician {{technician_name}} is on the way. ETA: {{eta}} minutes.' },
  { id: 3, name: 'Task Started', content: 'Your technician has arrived and started the service. Reference: #{{task_id}}' },
  { id: 4, name: 'Task Completed', content: 'Your service has been completed. Thank you for choosing us! Please share your feedback.' },
  { id: 5, name: 'Task Delayed', content: 'We apologize for the delay. Your technician will arrive by {{new_time}}. We appreciate your patience.' },
  { id: 6, name: 'Feedback Request', content: 'How was your experience with our service? Please rate us: {{feedback_link}}' },
]

export default function WhatsAppPage() {
  const { whatsappMessages, tasks, sendWhatsAppMessage } = useAppStore()
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customMessage, setCustomMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const clients = [...new Set(whatsappMessages.map(m => m.clientId))].map(id => {
    const msg = whatsappMessages.find(m => m.clientId === id)
    return { id, name: msg?.clientName || 'Unknown' }
  })

  const clientMessages = selectedClient
    ? whatsappMessages.filter(m => m.clientId === selectedClient).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : []

  const filteredTemplates = messageTemplates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSend = () => {
    if (!selectedClient || (!selectedTemplate && !customMessage)) return
    const client = clients.find(c => c.id === selectedClient)
    sendWhatsAppMessage({
      clientId: selectedClient,
      clientName: client?.name || 'Unknown',
      content: selectedTemplate || customMessage,
      type: selectedTemplate ? 'template' : 'custom',
      templateName: selectedTemplate ? messageTemplates.find(t => t.content === selectedTemplate)?.name : undefined,
    })
    setShowComposeDialog(false)
    setSelectedTemplate('')
    setCustomMessage('')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-blue-500" />
      case 'read':
        return <CheckCheck className="h-4 w-4 text-emerald-500" />
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Communication</h1>
          <p className="text-muted-foreground">Manage client notifications and conversations</p>
        </div>
        <Button onClick={() => setShowComposeDialog(true)}>
          <Send className="mr-2 h-4 w-4" /> Compose Message
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <MessageSquare className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{whatsappMessages.length}</p>
              <p className="text-sm text-muted-foreground">Total Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-sm text-muted-foreground">Active Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <CheckCheck className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{whatsappMessages.filter(m => m.status === 'delivered' || m.status === 'read').length}</p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{whatsappMessages.filter(m => m.status === 'pending').length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search clients..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="max-h-[400px] overflow-auto">
              {clients.map((client) => {
                const lastMsg = whatsappMessages.filter(m => m.clientId === client.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
                return (
                  <div
                    key={client.id}
                    className={cn(
                      'flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b',
                      selectedClient === client.id && 'bg-primary/10'
                    )}
                    onClick={() => setSelectedClient(client.id)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-medium">
                      {client.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium">{client.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{lastMsg?.content}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{getRelativeTime(lastMsg?.timestamp || '')}</p>
                      {getStatusIcon(lastMsg?.status || 'sent')}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedClient ? clients.find(c => c.id === selectedClient)?.name : 'Select a conversation'}
              </CardTitle>
              {selectedClient && (
                <Button size="sm" onClick={() => setShowComposeDialog(true)}>
                  <Send className="mr-2 h-4 w-4" /> Reply
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedClient ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-sm text-muted-foreground">Choose a client from the list to view messages</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientMessages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.type === 'template' ? 'justify-start' : 'justify-end')}>
                    <div className={cn(
                      'max-w-[70%] rounded-lg p-3',
                      msg.type === 'template' ? 'bg-accent' : 'bg-primary text-primary-foreground'
                    )}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.type === 'custom' && getStatusIcon(msg.status)}
                      </div>
                      {msg.templateName && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          <FileText className="mr-1 h-3 w-3" /> {msg.templateName}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {messageTemplates.map((template) => (
              <div key={template.id} className="rounded-lg border p-4 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => { setSelectedTemplate(template.content); setShowComposeDialog(true); }}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">{template.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                <Button variant="ghost" size="sm" className="mt-2 w-full">
                  <Send className="mr-2 h-4 w-4" /> Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>Send a WhatsApp message to the client</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="templates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="templates" className="mt-4 space-y-4">
              <Input placeholder="Search templates..." />
              <div className="space-y-2 max-h-[200px] overflow-auto">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      'rounded-lg border p-3 cursor-pointer hover:border-primary/50',
                      selectedTemplate === template.content && 'border-primary bg-primary/10'
                    )}
                    onClick={() => setSelectedTemplate(template.content)}
                  >
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{template.content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="custom" className="mt-4">
              <Textarea
                placeholder="Type your custom message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Note: Free-form messages are only available within 24 hours of a customer's last message.
              </p>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={!selectedTemplate && !customMessage}>
              <Send className="mr-2 h-4 w-4" /> Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
