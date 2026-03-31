import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, Crosshair } from 'lucide-react'

export default function TechnicianLocationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Location</h1>
        <p className="text-muted-foreground">Track and manage your current location</p>
      </div>

      <Card className="h-[500px] flex items-center justify-center">
        <CardContent className="text-center">
          <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Map view</p>
          <p className="text-sm text-muted-foreground mt-2">
            Live location tracking enabled
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button className="flex-1">
          <Crosshair className="mr-2 h-4 w-4" /> Get Current Location
        </Button>
        <Button variant="outline">
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
