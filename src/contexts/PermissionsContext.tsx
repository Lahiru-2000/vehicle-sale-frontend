'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

interface Permission {
  id: number
  adminId: string
  feature: string
  canAccess: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

interface PermissionsContextType {
  permissions: Permission[]
  hasPermission: (feature: string, action?: 'access' | 'create' | 'edit' | 'delete') => boolean
  canAccess: (feature: string) => boolean
  canCreate: (feature: string) => boolean
  canEdit: (feature: string) => boolean
  canDelete: (feature: string) => boolean
  loading: boolean
  refreshPermissions: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPermissions = async () => {
    if (!user || user.role === 'superadmin') {
      // Super admins have all permissions
      setPermissions([])
      setLoading(false)
      return
    }

    if (user.role !== 'admin') {
      // Regular users don't have admin permissions
      setPermissions([])
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/permissions/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions || [])
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [user])

  const hasPermission = (feature: string, action: 'access' | 'create' | 'edit' | 'delete' = 'access'): boolean => {
    // Super admins have all permissions
    if (user?.role === 'superadmin') {
      return true
    }

    // Regular users have no admin permissions
    if (user?.role !== 'admin') {
      return false
    }

    // Find the permission for this feature
    const permission = permissions.find(p => p.feature === feature)
    if (!permission) {
      return false
    }

    switch (action) {
      case 'access':
        return permission.canAccess
      case 'create':
        return permission.canCreate && permission.canAccess
      case 'edit':
        return permission.canEdit && permission.canAccess
      case 'delete':
        return permission.canDelete && permission.canAccess
      default:
        return false
    }
  }

  const canAccess = (feature: string) => hasPermission(feature, 'access')
  const canCreate = (feature: string) => hasPermission(feature, 'create')
  const canEdit = (feature: string) => hasPermission(feature, 'edit')
  const canDelete = (feature: string) => hasPermission(feature, 'delete')

  const refreshPermissions = async () => {
    setLoading(true)
    await fetchPermissions()
  }

  return (
    <PermissionsContext.Provider value={{
      permissions,
      hasPermission,
      canAccess,
      canCreate,
      canEdit,
      canDelete,
      loading,
      refreshPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
