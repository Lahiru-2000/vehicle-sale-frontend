'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthContextType } from '@/types'
import { apiFetch } from '@/lib/api-client'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app load
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await apiFetch('auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          // Ensure the user object has the correct structure
          const userData = data.user || data
          setUser(userData)
        } else {
          localStorage.removeItem('token')
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // Try admin-login first if we're on admin login page, otherwise use regular login
      const isAdminLoginPage = window.location.pathname.includes('/admin/login')
      const endpoint = isAdminLoginPage ? 'auth/admin-login' : 'auth/login'
      
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      // Handle both response formats: {user, token} and {admin, token}
      const userData = data.user || data.admin || data
      const token = data.token
      
      localStorage.setItem('token', token)
      setUser(userData)
      
      // Redirect admin and superadmin users to admin dashboard, regular users to regular dashboard
      if (userData.role === 'admin' || userData.role === 'superadmin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      }
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await apiFetch('auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Registration failed')
      }

      const { user: userData, token } = await response.json()
      localStorage.setItem('token', token)
      setUser(userData)
      
      // Redirect admin and superadmin users to admin dashboard, regular users to regular dashboard
      if (userData.role === 'admin' || userData.role === 'superadmin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
      
      return userData
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    // Redirect to homepage after logout
    window.location.href = '/'
  }

  const updateUser = (updatedUserData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUserData })
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

