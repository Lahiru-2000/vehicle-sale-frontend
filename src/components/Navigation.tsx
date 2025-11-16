'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import GlobalSettingsDropdown from './GlobalSettingsDropdown'
import NotificationsPanel from './NotificationsPanel'
import { Search, Menu, X, User, LogOut, Car, Shield, Crown, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navigation() {
  const { user, isLoading, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0)
  const [hasNewNotification, setHasNewNotification] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  // Get the appropriate dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/dashboard'
    return user.role === 'admin' ? '/admin' : '/dashboard'
  }

  // Get the appropriate dashboard text based on user role
  const getDashboardText = () => {
    if (!user) return 'Dashboard'
    return user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'
  }

  // Notification functions
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('notifications?unreadOnly=true&limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const newCount = data.pagination.total
        
        // Check if there are new notifications
        if (newCount > previousUnreadCount && previousUnreadCount > 0) {
          setHasNewNotification(true)
          // Show toast notification
          toast.success(`You have ${newCount - previousUnreadCount} new notification${newCount - previousUnreadCount > 1 ? 's' : ''}!`, {
            duration: 4000,
            icon: '🔔',
          })
          // Clear the animation after 3 seconds
          setTimeout(() => setHasNewNotification(false), 3000)
        }
        
        setPreviousUnreadCount(newCount)
        setUnreadCount(newCount)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  // Auto-refresh notifications every 5 seconds for regular users
  useEffect(() => {
    if (!user || user.role === 'admin' || user.role === 'superadmin') return

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [user])

  // Fetch notifications on user login
  useEffect(() => {
    if (user && user.role === 'user') {
      fetchUnreadCount()
    }
  }, [user])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/drivedeal logo.png" 
              alt="DRIVEDEAL" 
              className="h-28 w-auto"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle size="md" />

            {/* Global Settings Dropdown - Only for Admins */}
            {user && (user.role === 'admin' || user.role === 'superadmin') && <GlobalSettingsDropdown />}

            {/* Notification Bell - Only for regular users */}
            {user && user.role === 'user' && (
              <button
                onClick={() => {
                  fetchUnreadCount() // Refresh notifications when opening
                  setShowNotifications(true)
                }}
                className={`relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors ${
                  hasNewNotification ? 'animate-pulse' : ''
                }`}
                title="Notifications"
              >
                <Bell className={`h-5 w-5 ${hasNewNotification ? 'text-blue-500' : ''}`} />
                {unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] ${
                    hasNewNotification ? 'bg-blue-500 animate-bounce' : 'bg-red-500'
                  }`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={getDashboardLink()}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  {user.role === 'superadmin' ? (
                    <Shield className="h-4 w-4 text-red-600" />
                  ) : user.role === 'admin' ? (
                    <Shield className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="font-medium">{user.name}</span>
                  {user.role === 'superadmin' && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">Super Admin</span>
                  )}
                  {user.role === 'admin' && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">Admin</span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-1">
            {/* Mobile Notification Bell - Only for regular users */}
            {user && user.role === 'user' && (
              <button
                onClick={() => {
                  fetchUnreadCount()
                  setShowNotifications(true)
                }}
                className={`relative p-2 rounded-lg hover:bg-accent transition-colors ${hasNewNotification ? 'animate-pulse' : ''}`}
                title="Notifications"
              >
                <Bell className={`h-6 w-6 ${hasNewNotification ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
                {unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-semibold ${
                    hasNewNotification ? 'bg-blue-500 animate-bounce' : 'bg-red-500'
                  }`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>


            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {/* Global Settings Dropdown - Mobile - Only for Admins */}
              {user && (user.role === 'admin' || user.role === 'superadmin') && (
                <div className="px-4 py-2">
                  <GlobalSettingsDropdown />
                </div>
              )}

              {user ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.role === 'superadmin' ? (
                      <Shield className="h-4 w-4 text-red-600" />
                    ) : user.role === 'admin' ? (
                      <Shield className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{getDashboardText()}</span>
                    </div>
                    {user.role === 'superadmin' && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">Super Admin</span>
                    )}
                    {user.role === 'admin' && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">Admin</span>
                    )}
                  </Link>
                  {user.role === 'user' && (
                    <Link
                      href="/subscription"
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Crown className="h-4 w-4 text-yellow-600" />
                      <span>Premium Subscription</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              
              {/* Theme Toggle Mobile */}
              <div className="px-4 py-2">
                <ThemeToggle size="sm" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {user && user.role === 'user' && (
        <NotificationsPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </nav>
  )
}
