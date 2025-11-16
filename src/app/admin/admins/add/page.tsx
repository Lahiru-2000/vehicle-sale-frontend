'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Save, Loader2, Shield, UserPlus, Mail, Lock, User, Eye, EyeOff, Phone, Crown, Info, Check, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminAddAdminPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false
    }
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'admin' | 'superadmin',
    phone: ''
  })

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
  }, [user, router])

  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    }

    const score = Object.values(checks).filter(Boolean).length
    let feedback = ''

    if (score === 0) feedback = 'Very weak'
    else if (score === 1) feedback = 'Weak'
    else if (score === 2) feedback = 'Fair'
    else if (score === 3) feedback = 'Good'
    else if (score === 4) feedback = 'Strong'

    setPasswordStrength({ score, feedback, checks })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (passwordStrength.score < 3) {
      toast.error('Please choose a stronger password')
      return
    }
    
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/admins/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone
        })
      })

      if (response.ok) {
        toast.success('Admin user created successfully')
        router.push('/admin/admins')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to create admin user')
      }
    } catch (error) {
      console.error('Error creating admin user:', error)
      toast.error('Failed to create admin user')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Check password strength in real-time
    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  if (!user || user.role !== 'superadmin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/admin/admins"
              className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admin Management</span>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create New Administrator</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Add a new admin to your team with appropriate permissions</p>
            
            {/* Info Banner */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg text-amber-800 dark:text-amber-200">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Only Super Admins can create new administrator accounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Progress Indicator */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Basic Information</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <span className="font-medium text-gray-500 dark:text-gray-400">Security Settings</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Administrator Details</h2>
                  <p className="text-blue-100 text-sm">Enter the basic information for the new admin</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter administrator's full name"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This will be displayed as the admin's display name</p>
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="admin@example.com"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Used for login and notifications</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Shield className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Administrator Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="admin">Administrator</option>
                    <option value="superadmin">Super Administrator</option>
                  </select>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">Role Permissions:</p>
                        <p><strong>Administrator:</strong> Manage users and vehicles</p>
                        <p><strong>Super Administrator:</strong> Full system access including admin management</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional contact number</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Lock className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Security Settings</h2>
                  <p className="text-green-100 text-sm">Set up secure login credentials</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Create a strong password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Password Strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score === 0 ? 'text-red-600 dark:text-red-400' :
                        passwordStrength.score === 1 ? 'text-red-500 dark:text-red-400' :
                        passwordStrength.score === 2 ? 'text-yellow-500 dark:text-yellow-400' :
                        passwordStrength.score === 3 ? 'text-blue-500 dark:text-blue-400' :
                        'text-green-500 dark:text-green-400'
                      }`}>
                        {passwordStrength.feedback}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score === 0 ? 'bg-red-500' :
                          passwordStrength.score === 1 ? 'bg-red-400' :
                          passwordStrength.score === 2 ? 'bg-yellow-400' :
                          passwordStrength.score === 3 ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center space-x-2 text-xs ${passwordStrength.checks.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {passwordStrength.checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs ${passwordStrength.checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {passwordStrength.checks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs ${passwordStrength.checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {passwordStrength.checks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs ${passwordStrength.checks.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {passwordStrength.checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300 dark:border-red-500 focus:ring-red-500'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-300 dark:border-green-500 focus:ring-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className={`mt-2 flex items-center space-x-2 text-xs ${
                    formData.password === formData.confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formData.password === formData.confirmPassword ? 
                      <Check className="h-3 w-3" /> : 
                      <AlertCircle className="h-3 w-3" />
                    }
                    <span>
                      {formData.password === formData.confirmPassword ? 
                        'Passwords match' : 
                        'Passwords do not match'
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>By creating this admin account, you grant them access to the administrative features based on their assigned role.</p>
              </div>
              
              <div className="flex space-x-4">
                <Link
                  href="/admin/admins"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || passwordStrength.score < 3 || formData.password !== formData.confirmPassword}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Administrator...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Administrator
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
