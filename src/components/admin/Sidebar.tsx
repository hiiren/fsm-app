import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCheck,
  Package,
  BarChart3,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  ChevronLeft,
  LogOut,
  User,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import { useAuthStore, useAppStore } from '@/stores'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/logs', icon: AlertTriangle, label: 'Error Logs' },
  { to: '/admin/technicians', icon: Users, label: 'Technicians' },
  { to: '/admin/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/admin/requirements', icon: UserCheck, label: 'Requirements' },
  { to: '/admin/materials', icon: Package, label: 'Materials' },
  { to: '/admin/monitoring', icon: Activity, label: 'Monitoring' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { to: '/admin/feedback', icon: FileText, label: 'Feedback' },
  { to: '/admin/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/admin/profile', icon: User, label: 'Profile' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onNavClick?: () => void
  isMobile?: boolean
}

export function Sidebar({ collapsed, onToggle, onNavClick, isMobile }: SidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { notifications } = useAppStore()
  const unreadCount = notifications.filter(n => !n.read).length

  const handleNavClick = () => {
    if (onNavClick) onNavClick()
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen border-r bg-card transition-all duration-300',
        isMobile ? 'z-40 w-64' : (collapsed ? 'z-40 w-16' : 'z-40 w-64')
      )}
    >
      <div className="flex h-full flex-col">
        <div className={cn('flex h-16 items-center border-b px-4', collapsed && !isMobile ? 'justify-center' : 'justify-between')}>
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">D</span>
              </div>
              <span className="font-semibold gradient-text">FSM</span>
            </div>
          )}
          {collapsed && !isMobile && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">D</span>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to)

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    collapsed && !isMobile && 'justify-center px-2'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                  {(!collapsed || isMobile) && <span>{item.label}</span>}
                  {(!collapsed || isMobile) && item.to === '/admin' && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">{unreadCount}</Badge>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="border-t p-4">
          <button
            onClick={() => {
              logout()
              handleNavClick()
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              collapsed && !isMobile && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5" />
            {(!collapsed || isMobile) && <span>Logout</span>}
          </button>

          {(!collapsed || isMobile) && user && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-accent/50 p-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className={cn(
              'absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent',
              collapsed ? 'left-[52px]' : 'left-[236px]'
            )}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>
    </aside>
  )
}
