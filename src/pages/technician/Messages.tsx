import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores'
import { MessageSquare, Send } from 'lucide-react'

export default function TechnicianMessagesPage() {
  const { whatsappMessages } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">View and send messages to clients</p>
      </div>

      <div className="space-y-4">
        {whatsappMessages.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
            </CardContent>
          </Card>
        ) : (
          whatsappMessages.map((msg) => (
            <Card key={msg.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{msg.clientName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={
                    msg.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                    msg.status === 'read' ? 'bg-blue-500/10 text-blue-500' :
                    msg.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                    'bg-amber-500/10 text-amber-500'
                  }>
                    {msg.status}
                  </Badge>
                </div>
                <p className="text-sm">{msg.content}</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Send className="mr-2 h-4 w-4" /> Reply
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
