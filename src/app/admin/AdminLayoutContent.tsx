'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/contexts/PermissionsContext'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import { 
  Home,
  Shield,
  Users,
  User,
  Car,
  Settings,
  LogOut,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Crown,
  CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminLayoutContentProps {
  children: React.ReactNode
}

export default function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { canAccess } = usePermissions()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  const handleLogout = () => {
    try {
      logout()
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  // Super Admin gets access to ALL features
  const isSuperAdmin = user?.role === 'superadmin'
  
  const sidebarItems = useMemo(() => {
    const items: Array<{
      title: string
      href?: string
      icon: any
      active?: boolean
      children?: Array<{
        title: string
        href: string
        icon: any
      }>
    }> = [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: Home,
        active: pathname === '/admin'
      }
    ]

    // User Management (check permission)
    if (isSuperAdmin || canAccess('user_management')) {
      items.push({
        title: 'Users',
        icon: Users,
        children: [
          { title: 'All Users', href: '/admin/users', icon: Users },
          { title: 'Add User', href: '/admin/users/add', icon: Users },
          { title: 'User Analytics', href: '/admin/reports/users', icon: BarChart3 }
        ]
      })
    }

    // Vehicle Management (check permission)
    if (isSuperAdmin || canAccess('vehicle_management')) {
      items.push({
        title: 'Vehicles',
        icon: Car,
        children: [
          { title: 'All Vehicles', href: '/admin/vehicles', icon: Car },
          { title: 'Add Vehicle', href: '/admin/add-vehicle', icon: Car },
          { title: 'Vehicle Analytics', href: '/admin/analytics/vehicles', icon: BarChart3 }
        ]
      })
    }

    // Admin Management (super admin only)
    if (isSuperAdmin) {
      items.push({
        title: 'Admins',
        icon: Shield,
        children: [
          { title: 'Add Admin', href: '/admin/admins/add', icon: Users },
          { title: 'All Admins', href: '/admin/admins', icon: Users },
          { title: 'Permissions', href: '/admin/permissions', icon: Crown }
        ]
      })
    }

    // Payment Management (check permission)
    if (isSuperAdmin || canAccess('payment_management')) {
      items.push({
        title: 'Payment & Subscriptions',
        icon: CreditCard,
        children: [
          { title: 'Payments', href: '/admin/payments', icon: CreditCard },
          { title: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard }
        ]
      })
    }

    // Settings Management (check permission)
    if (isSuperAdmin || canAccess('settings_management')) {
      items.push({
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        active: pathname === '/admin/settings'
      })
    }


    return items
  }, [pathname, isSuperAdmin, canAccess])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out h-screen flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b h-[73px]">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedItems.has(item.title)
              const hasActiveChild = item.children.some(child => pathname === child.href)
              
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left
                      ${hasActiveChild ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`
                            flex items-center space-x-3 p-2 rounded-lg transition-colors
                            ${pathname === child.href 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-accent'
                            }
                          `}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <child.icon className="h-4 w-4" />
                          <span>{child.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            } else {
              return (
                <Link
                  key={item.href || item.title}
                  href={item.href || '#'}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg transition-colors
                    ${item.active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )
            }
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded hover:bg-accent"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* User Info for Mobile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <div className="flex items-center justify-end space-x-1">
                  {user?.role === 'superadmin' && (
                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full font-medium">Super Admin</span>
                  )}
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">Admin</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                {user?.role === 'superadmin' ? (
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                ) : user?.role === 'admin' ? (
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-yellow-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block border-b bg-card h-[73px]">
          <div className="flex items-center justify-end p-4 h-full">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                {user?.role === 'superadmin' && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">Super Admin</span>
                )}
                {user?.role === 'admin' && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">Admin</span>
                )}
                <div className="flex-shrink-0">
                  {user?.role === 'superadmin' ? (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                  ) : user?.role === 'admin' ? (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-yellow-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
