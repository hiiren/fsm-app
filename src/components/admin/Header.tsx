import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
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
import { useAppStore, useAuthStore } from '@/stores'
import { cn, getRelativeTime } from '@/lib/utils'
import { Search, Bell, Check, User, Settings, LogOut, Menu } from 'lucide-react'

interface HeaderProps {
  sidebarCollapsed: boolean
  onMenuToggle?: () => void
  isMobile?: boolean
}

export function Header({ sidebarCollapsed, onMenuToggle, isMobile }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore()
  const { user, logout } = useAuthStore()
  const unreadCount = notifications.filter(n => !n.read).length

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
    navigate('/admin/profile')
  }

  const handleSettings = () => {
    navigate('/admin/settings')
  }

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id)
    switch (notif.type) {
      case 'task':
        navigate('/admin/tasks')
        break
      case 'material':
        navigate('/admin/materials')
        break
      case 'requirement':
        navigate('/admin/requirements')
        break
      case 'alert':
        navigate('/admin/tasks')
        break
      case 'document':
        navigate('/admin/technicians')
        break
      default:
        break
    }
    setShowNotifications(false)
  }

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 transition-all duration-300',
        isMobile ? 'left-0' : (sidebarCollapsed ? 'left-16' : 'left-64')
      )}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger menu — mobile only */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search — full on desktop, toggle on mobile */}
        {!isMobile && (
          <div className="relative w-64 lg:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="header-search"
              placeholder="Search tasks, technicians, clients..."
              className="pl-10 bg-muted/50"
            />
          </div>
        )}

        {isMobile && !showSearch && (
          <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Mobile search bar */}
      {isMobile && showSearch && (
        <div className="absolute inset-x-0 top-0 z-50 flex h-16 items-center gap-2 bg-background px-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-muted/50"
              autoFocus
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSearch(false)}>
            Cancel
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className={cn(
              "absolute top-full mt-2 rounded-lg border bg-popover shadow-lg",
              isMobile ? "right-0 left-auto w-[calc(100vw-2rem)] max-w-80" : "right-0 w-80"
            )}>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
                    <Check className="mr-1 h-3 w-3" /> Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-80 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'flex gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/50 cursor-pointer',
                        !notif.read && 'bg-primary/5'
                      )}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        !notif.read ? 'bg-primary' : 'bg-muted-foreground/30'
                      )} />
                      <div className="flex-1 overflow-hidden">
                        <p className={cn('text-sm', !notif.read && 'font-medium')}>{notif.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{notif.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{getRelativeTime(notif.createdAt)}</p>
                      </div>
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
              <Avatar className="h-9 w-9">
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
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
  )
}
