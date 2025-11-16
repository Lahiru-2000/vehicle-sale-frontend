'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Shield, 
  ArrowLeft, 
  Save, 
  Loader2, 
  Check, 
  X,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Permission {
  id: number
  adminId: string
  feature: string
  canAccess: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  adminName: string
  adminEmail: string
  adminRole: string
}

interface AvailableFeature {
  name: string
  label: string
  description: string
}

export default function AdminPermissionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const availableFeatures: AvailableFeature[] = [
    { name: 'user_management', label: 'User Management', description: 'Manage users and their accounts' },
    { name: 'vehicle_management', label: 'Vehicle Management', description: 'Manage vehicle listings and approvals' },
    { name: 'settings_management', label: 'Settings Management', description: 'Manage website settings' },
    { name: 'payment_management', label: 'Payment Management', description: 'Manage payments and subscriptions' }
  ]

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'superadmin') {
      router.push('/admin')
      toast.error('Access denied. Super admin privileges required.')
      return
    }

    fetchPermissions()
  }, [user, router])

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions || [])
      } else {
        toast.error('Failed to load permissions')
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = async (adminId: string, feature: string, permissionType: string, value: boolean) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
   
      const existingPermission = permissions.find(p => p.adminId === adminId && p.feature === feature)
      

      const permissionData = {
        canAccess: existingPermission?.canAccess || false,
        canCreate: existingPermission?.canCreate || false,
        canEdit: existingPermission?.canEdit || false,
        canDelete: existingPermission?.canDelete || false
      }
      
  
      if (permissionType === 'canAccess') {
        permissionData.canAccess = value
    
        if (!value) {
          permissionData.canCreate = false
          permissionData.canEdit = false
          permissionData.canDelete = false
        }
      } else {
        permissionData[permissionType as keyof typeof permissionData] = value
      }
      
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminId,
          feature,
          permissions: permissionData
        })
      })

      if (response.ok) {
        toast.success('Permission updated successfully')
        fetchPermissions()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update permission')
      }
    } catch (error) {
      console.error('Error updating permission:', error)
      toast.error('Failed to update permission')
    } finally {
      setSaving(false)
    }
  }

  if (!user || user.role !== 'superadmin') {
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin"
            className="flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Permissions</h1>
            <p className="text-muted-foreground">Manage access permissions for administrators</p>
            <div className="flex items-center space-x-1 mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium w-fit">
              <Shield className="h-3 w-3" />
              <span>Super Admin Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading permissions...</span>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Admin</th>
                  {availableFeatures.map((feature) => (
                    <th key={feature.name} className="text-left p-4 font-medium">
                      <div>
                        <div className="font-medium">{feature.label}</div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Group permissions by admin - only show regular admins */}
                {Object.entries(
                  permissions.reduce((acc: Record<string, Permission[]>, permission) => {
                    if (!acc[permission.adminId]) {
                      acc[permission.adminId] = []
                    }
                    acc[permission.adminId].push(permission)
                    return acc
                  }, {})
                ).filter(([adminId, adminPermissions]) => {
                  const adminInfo = adminPermissions[0]
                  return adminInfo.adminRole === 'admin' // Only show regular admins, not superadmins
                }).map(([adminId, adminPermissions]) => {
                  const adminInfo = adminPermissions[0] // Get admin info from first permission
                  
                  return (
                    <tr key={adminId} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{adminInfo.adminName}</div>
                          <div className="text-sm text-muted-foreground">{adminInfo.adminEmail}</div>
                          <div className="text-xs text-muted-foreground capitalize">{adminInfo.adminRole}</div>
                        </div>
                      </td>
                      {availableFeatures.map((feature) => {
                        const featurePermission = adminPermissions.find(p => p.feature === feature.name)
                        
                        // Only user_management and vehicle_management show all 4 permissions
                        // Others only show access permission
                        const showAllPermissions = feature.name === 'user_management' || feature.name === 'vehicle_management'
                        
                        return (
                          <td key={feature.name} className="p-4">
                            <div className="space-y-2">
                              {/* Access Permission - Always shown */}
                              <div className="flex items-center space-x-2">
                                <Eye className="h-3 w-3 text-muted-foreground" />
                                <button
                                  onClick={() => handlePermissionChange(
                                    adminId, 
                                    feature.name, 
                                    'canAccess', 
                                    !featurePermission?.canAccess
                                  )}
                                  disabled={saving}
                                  className={`
                                    px-2 py-1 text-xs rounded transition-colors
                                    ${featurePermission?.canAccess 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }
                                    ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                  `}
                                >
                                  {featurePermission?.canAccess ? '✓' : '✗'}
                                </button>
                              </div>

                              {/* Create Permission - Only for user_management and vehicle_management */}
                              {showAllPermissions && (
                                <div className="flex items-center space-x-2">
                                  <Plus className="h-3 w-3 text-muted-foreground" />
                                  <button
                                    onClick={() => handlePermissionChange(
                                      adminId, 
                                      feature.name, 
                                      'canCreate', 
                                      !featurePermission?.canCreate
                                    )}
                                    disabled={saving || !featurePermission?.canAccess}
                                    className={`
                                      px-2 py-1 text-xs rounded transition-colors
                                      ${featurePermission?.canCreate 
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                      }
                                      ${saving || !featurePermission?.canAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                  >
                                    {featurePermission?.canCreate ? '✓' : '✗'}
                                  </button>
                                </div>
                              )}

                              {/* Edit Permission - Only for user_management and vehicle_management */}
                              {showAllPermissions && (
                                <div className="flex items-center space-x-2">
                                  <Edit className="h-3 w-3 text-muted-foreground" />
                                  <button
                                    onClick={() => handlePermissionChange(
                                      adminId, 
                                      feature.name, 
                                      'canEdit', 
                                      !featurePermission?.canEdit
                                    )}
                                    disabled={saving || !featurePermission?.canAccess}
                                    className={`
                                      px-2 py-1 text-xs rounded transition-colors
                                      ${featurePermission?.canEdit 
                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                      }
                                      ${saving || !featurePermission?.canAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                  >
                                    {featurePermission?.canEdit ? '✓' : '✗'}
                                  </button>
                                </div>
                              )}

                              {/* Delete Permission - Only for user_management and vehicle_management */}
                              {showAllPermissions && (
                                <div className="flex items-center space-x-2">
                                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                                  <button
                                    onClick={() => handlePermissionChange(
                                      adminId, 
                                      feature.name, 
                                      'canDelete', 
                                      !featurePermission?.canDelete
                                    )}
                                    disabled={saving || !featurePermission?.canAccess}
                                    className={`
                                      px-2 py-1 text-xs rounded transition-colors
                                      ${featurePermission?.canDelete 
                                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                      }
                                      ${saving || !featurePermission?.canAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                  >
                                    {featurePermission?.canDelete ? '✓' : '✗'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">How Permissions Work</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Access:</strong> Basic access to view the feature</li>
          <li>• <strong>Create:</strong> Ability to create new items</li>
          <li>• <strong>Edit:</strong> Ability to modify existing items</li>
          <li>• <strong>Delete:</strong> Ability to remove items</li>
          <li>• Super admins have all permissions by default and cannot be modified</li>
        </ul>
      </div>
    </div>
  )
}
