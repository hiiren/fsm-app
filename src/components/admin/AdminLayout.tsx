import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const handleOverlayClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileMenuOpen && isMobile && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar — always visible on desktop, drawer on mobile */}
      <div className={cn(
        'lg:block',
        isMobile && !mobileMenuOpen && 'hidden',
        isMobile && mobileMenuOpen && 'block'
      )}>
        <Sidebar 
          collapsed={isMobile ? false : sidebarCollapsed} 
          onToggle={handleToggle}
          onNavClick={() => isMobile && setMobileMenuOpen(false)}
          isMobile={isMobile}
        />
      </div>
      
      <Header 
        sidebarCollapsed={isMobile ? true : sidebarCollapsed} 
        onMenuToggle={handleToggle}
        isMobile={isMobile}
      />
      
      <main
        className={cn(
          'min-h-screen pt-16 transition-all duration-300',
          isMobile ? 'pl-0' : (sidebarCollapsed ? 'pl-16' : 'pl-64')
        )}
      >
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
