'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'superadmin'
  phone?: string
  isBlocked?: boolean
}

interface AdminAuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isSuperAdmin: boolean
  isAdmin: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing admin token on mount
    const token = localStorage.getItem('adminToken')
    if (token) {
      // Verify token and get admin info
      verifyAdminToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyAdminToken = async (token: string) => {
    try {
      // For now, we'll decode the JWT to get admin info
      // In a real app, you'd verify with the server
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      if (payload.exp < currentTime) {
        // Token expired
        localStorage.removeItem('adminToken')
        setIsLoading(false)
        return
      }

      setAdmin({
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role
      })
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('adminToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('adminToken', data.token)
        setAdmin(data.admin)
        return { success: true, message: 'Login successful' }
      } else {
        return { success: false, message: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setAdmin(null)
    // Redirect to homepage after logout
    window.location.href = '/'
  }

  const isSuperAdmin = admin?.role === 'superadmin'
  const isAdmin = admin?.role === 'admin' || admin?.role === 'superadmin'

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    login,
    logout,
    isSuperAdmin,
    isAdmin
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}
