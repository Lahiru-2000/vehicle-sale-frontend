'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/contexts/PermissionsContext'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Car,
  Edit,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  Eye,
  Phone,
  MapPin
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface UserDetails {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'superadmin'
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
  vehicleCount?: number
  vehicles?: Array<{
    id: string
    title: string
    brand: string
    model: string
    year: number
    price: number
    status: string
    createdAt: Date
  }>
}

export default function AdminUserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { canAccess, canEdit, canDelete } = usePermissions()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/dashboard')
      toast.error('Access denied. Admin privileges required.')
      return
    }

    if (params.id) {
      fetchUserDetails(params.id as string)
    }
  }, [user, router, params.id])

  const fetchUserDetails = async (userId: string) => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/users/${userId}`)

      if (response.ok) {
        const data = await response.json()
        setUserDetails(data.user || data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to load user details')
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('Failed to load user details')
      router.push('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async () => {
    if (!userDetails) return
    
    setActionLoading('block')
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/users/${userDetails.id}/toggle-block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userDetails.id, 
          block: !userDetails.isBlocked 
        })
      })

      if (response.ok) {
        toast.success(`User ${userDetails.isBlocked ? 'activated' : 'blocked'} successfully`)
        fetchUserDetails(userDetails.id)
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!userDetails) return

    if (!confirm(`Are you sure you want to delete user "${userDetails.name}"? This action cannot be undone.`)) {
      return
    }

    setActionLoading('delete')
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userDetails.id })
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        router.push('/admin/users')
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditUser = () => {
    if (userDetails) {
      router.push(`/admin/users/${userDetails.id}/edit`)
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading user details...</span>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">User not found</h3>
        <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin/users"
            className="flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to User Management</span>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">User Details</h1>
              <p className="text-muted-foreground">View and manage user information</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {/* Edit Button - only if can edit */}
            {canEdit('user_management') && (
              <button
                onClick={handleEditUser}
                className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Edit User"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            {/* Block/Activate Button - only if can edit */}
            {canEdit('user_management') && (
              <button
                onClick={handleToggleBlock}
                disabled={actionLoading === 'block'}
                className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                  userDetails.isBlocked 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50`}
                title={userDetails.isBlocked ? 'Activate User' : 'Block User'}
              >
                {actionLoading === 'block' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : userDetails.isBlocked ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  <UserX className="h-4 w-4" />
                )}
              </button>
            )}
            
            {/* Delete Button - only if can delete */}
            {canDelete('user_management') && (
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading === 'delete'}
                className="flex items-center justify-center p-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
                title="Delete User"
              >
                {actionLoading === 'delete' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Basic Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                <p className="text-lg font-medium">{userDetails.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                <p className="text-lg flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{userDetails.email}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Role</label>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  Regular User
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  userDetails.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {userDetails.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <span>Vehicle Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Total Vehicles</label>
                <p className="text-2xl font-bold text-primary">{userDetails.vehicleCount || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Active Listings</label>
                <p className="text-2xl font-bold text-green-600">
                  {userDetails.vehicles?.filter(v => v.status === 'active').length || 0}
                </p>
              </div>
            </div>
            
            {userDetails.vehicles && userDetails.vehicles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Recent Vehicles</h3>
                <div className="space-y-2">
                  {userDetails.vehicles.slice(0, 3).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(vehicle.price)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                  ))}
                </div>
                {userDetails.vehicles.length > 3 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    And {userDetails.vehicles.length - 3} more vehicles...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Dates */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Account Timeline</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Member Since</label>
                <p className="font-medium">{new Date(userDetails.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Last Updated</label>
                <p className="font-medium">{new Date(userDetails.updatedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              {/* Edit Action - only if can edit */}
              {canEdit('user_management') && (
                <button
                  onClick={handleEditUser}
                  className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Edit User Details"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              
              {/* Block/Activate Action - only if can edit */}
              {canEdit('user_management') && (
                <button
                  onClick={handleToggleBlock}
                  disabled={actionLoading === 'block'}
                  className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                    userDetails.isBlocked 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50`}
                  title={userDetails.isBlocked ? 'Activate User' : 'Block User'}
                >
                  {actionLoading === 'block' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : userDetails.isBlocked ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                </button>
              )}
              
              {/* View User's Vehicles - only if can access vehicle management */}
              {canAccess('vehicle_management') && (
                <button
                  onClick={() => router.push(`/admin/vehicles?userId=${userDetails.id}`)}
                  className="flex items-center justify-center p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  title="View User's Vehicles"
                >
                  <Car className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
