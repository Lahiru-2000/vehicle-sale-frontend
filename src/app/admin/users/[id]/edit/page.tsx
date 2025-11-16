'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Save, Loader2, Users, Edit, User, Mail, Shield, Info, UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UserDetails {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'superadmin'
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
}

export default function AdminEditUserPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    isBlocked: false
  })

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
        const user = data.user || data
        setUserDetails(user)
        setFormData({
          name: user.name,
          email: user.email,
          isBlocked: user.isBlocked
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userDetails) return
    
    setSaving(true)
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/users/${userDetails.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          isBlocked: formData.isBlocked
        })
      })

      if (response.ok) {
        toast.success('User updated successfully')
        router.push(`/admin/users/${userDetails.id}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
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
        <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">User not found</h3>
        <p className="text-muted-foreground mb-4">The user you're trying to edit doesn't exist.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href={`/admin/users/${userDetails.id}`}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to User Details</span>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                <Edit className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit User</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">Update user information and account settings</p>
              </div>
            </div>
            
            {/* Info Banner */}
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">User Account Management</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Make sure to verify email changes and user consent before updating sensitive information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Information</h2>
                  <p className="text-slate-600 dark:text-slate-400">Update the user's personal details</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="Enter the user's full name"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">The display name for the user account</p>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="Enter the user's email address"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Used for login and communication</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Account Role</span>
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                    Regular User
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    User role cannot be changed from this page. Admin accounts are managed separately.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Account Status</h2>
                  <p className="text-slate-600 dark:text-slate-400">Manage user access and account state</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <input
                    type="checkbox"
                    id="isBlocked"
                    name="isBlocked"
                    checked={formData.isBlocked}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-red-600 bg-white dark:bg-slate-600 border-2 border-slate-300 dark:border-slate-500 rounded focus:ring-red-500 focus:ring-2 mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="isBlocked" className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      {formData.isBlocked ? (
                        <UserX className="h-4 w-4 text-red-500" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-500" />
                      )}
                      <span>Block User Account</span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Blocked users cannot log in or access their account. Use this carefully as it immediately restricts access.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Info className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Account Information</h2>
                  <p className="text-slate-600 dark:text-slate-400">Read-only account details and timestamps</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">User ID</label>
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                    <p className="font-mono text-sm text-slate-900 dark:text-white">{userDetails.id}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Status</label>
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      userDetails.isBlocked ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {userDetails.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Member Since</label>
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                    <p className="text-sm text-slate-900 dark:text-white">{new Date(userDetails.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Updated</label>
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                    <p className="text-sm text-slate-900 dark:text-white">{new Date(userDetails.updatedAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ready to Save Changes?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Review the information above and click save to update the user account.
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <Link
                    href={`/admin/users/${userDetails.id}`}
                    className="px-6 py-3 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl transition-all duration-200 font-medium"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                  >
                    
                    <span>{saving ? 'Updating User...' : 'Update User'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
