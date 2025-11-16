'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Loader2, UserPlus, Eye, EyeOff, Check, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminAddUserPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user'
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
  }, [user, router])

  const checkPasswordStrength = (password: string) => {
    let score = 0
    let feedback = ''

    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score === 0) feedback = 'Very weak'
    else if (score === 1) feedback = 'Weak'
    else if (score === 2) feedback = 'Fair'
    else if (score === 3) feedback = 'Good'
    else if (score === 4) feedback = 'Strong'
    else feedback = 'Very strong'

    setPasswordStrength({ score, feedback })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    setSaving(true)
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/users/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'User created successfully')
        router.push('/admin/users')
      } else {
        try {
          const errorData = await response.json()
          toast.error(errorData.error || 'Failed to create user')
        } catch (jsonError) {
          // If response is not JSON, show a generic error
          toast.error('Failed to create user')
        }
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    } finally {
      setSaving(false)
    }
  }



  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/admin/users"
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to User Management</span>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Add New User</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">Create a new user account with secure credentials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Information</h2>
                  <p className="text-slate-600 dark:text-slate-400">Enter the user's personal details</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="Enter the user's full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="user@example.com"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">This will be used for login and communications</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="Phone number (optional)"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone number is optional and can be added later</p>
                </div>

                {/* Hidden role field - always user */}
                <input type="hidden" name="role" value="user" />
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h2>
                  <p className="text-slate-600 dark:text-slate-400">Set up secure login credentials</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Password *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                      placeholder="Create a strong password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.score <= 1 ? 'bg-red-500 w-1/5' :
                              passwordStrength.score === 2 ? 'bg-yellow-500 w-2/5' :
                              passwordStrength.score === 3 ? 'bg-orange-500 w-3/5' :
                              passwordStrength.score === 4 ? 'bg-green-500 w-4/5' :
                              'bg-green-600 w-full'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score <= 1 ? 'text-red-600 dark:text-red-400' :
                          passwordStrength.score === 2 ? 'text-yellow-600 dark:text-yellow-400' :
                          passwordStrength.score === 3 ? 'text-orange-600 dark:text-orange-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {passwordStrength.feedback}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center space-x-1 ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                          {formData.password.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                          {/[A-Z]/.test(formData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                          {/[a-z]/.test(formData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                          {/[0-9]/.test(formData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>Number</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Confirm Password *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-lg bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword 
                          ? 'border-red-500 focus:border-red-500' 
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-500 focus:border-green-500'
                          : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                      }`}
                      placeholder="Confirm the password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {formData.confirmPassword && (
                    <div className={`flex items-center space-x-2 text-xs ${
                      formData.password === formData.confirmPassword 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formData.password === formData.confirmPassword ? 
                        <Check className="h-3 w-3" /> : 
                        <X className="h-3 w-3" />
                      }
                      <span>
                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
              <Link
                href="/admin/users"
                className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 text-center font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating User...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Create User Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
