import React, { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore, useAppStore } from '@/stores'
import { 
  LayoutDashboard, 
  ClipboardList, 
  MapPin, 
  Package, 
  MessageSquare, 
  User,
  Settings,
  LogOut,
  Bell,
  X
} from 'lucide-react'

// Bottom tab items for mobile
const bottomTabs = [
  { icon: LayoutDashboard, label: 'Home', href: '/technician' },
  { icon: ClipboardList, label: 'Tasks', href: '/technician/tasks' },
  { icon: MapPin, label: 'Location', href: '/technician/location' },
  { icon: Package, label: 'Materials', href: '/technician/materials' },
  { icon: MessageSquare, label: 'Messages', href: '/technician/messages' },
]

// Full sidebar items (desktop)
const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/technician' },
  { icon: ClipboardList, label: 'My Tasks', href: '/technician/tasks' },
  { icon: MapPin, label: 'Location', href: '/technician/location' },
  { icon: Package, label: 'Materials', href: '/technician/materials' },
  { icon: MessageSquare, label: 'Messages', href: '/technician/messages' },
]

export function TechnicianLayout() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { notifications, markNotificationRead } = useAppStore()

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfile = () => {
    navigate('/technician/profile')
  }

  const handleSettings = () => {
    navigate('/technician/settings')
  }

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id)
    switch (notif.type) {
      case 'task':
        navigate('/technician/tasks')
        break
      case 'material':
        navigate('/technician/materials')
        break
      case 'alert':
        navigate('/technician/tasks')
        break
      default:
        break
    }
    setShowNotifications(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 z-20 h-screen w-64 border-r bg-card">
          <div className="flex h-16 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                D
              </div>
              <span className="font-semibold">D-Technician</span>
            </div>
          </div>

          <nav className="space-y-1 p-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleProfile}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSettings}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </aside>
      )}

      {/* Top Header */}
      <header
        className={cn(
          'fixed right-0 top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 transition-all duration-300',
          isMobile ? 'left-0' : 'left-64'
        )}
      >
        {/* Brand on mobile */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              D
            </div>
            <span className="font-semibold text-sm">D-Technician</span>
          </div>
        )}

        {!isMobile && <div className="flex-1" />}

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
            {showNotifications && (
              <div className={cn(
                "absolute top-12 rounded-lg border bg-background shadow-lg",
                isMobile ? "right-0 w-[calc(100vw-2rem)] max-w-80" : "right-0 w-80"
              )}>
                <div className="flex items-center justify-between border-b p-3">
                  <p className="font-semibold text-sm">Notifications</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNotifications(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'border-b p-3 cursor-pointer transition-colors hover:bg-accent',
                          !notif.read && 'bg-primary/5'
                        )}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{user?.name?.charAt(0) || 'T'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          isMobile ? 'pt-14 pb-20 px-3' : 'pt-16 pl-64 px-6'
        )}
      >
        <div className={cn(isMobile ? 'py-3' : 'py-6')}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-lg">
          <div className="flex items-center justify-around h-16 px-1">
            {bottomTabs.map((tab) => {
              const isActive = location.pathname === tab.href
              return (
                <button
                  key={tab.href}
                  onClick={() => navigate(tab.href)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 flex-1',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  )}
                >
                  <tab.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  <span className={cn(
                    'text-[10px] font-medium truncate',
                    isActive && 'text-primary'
                  )}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>
          {/* Safe area for devices with bottom notch */}
          <div className="h-safe-area-bottom bg-card" />
        </nav>
      )}
    </div>
  )
}
