'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Cog, 
  Save, 
  Loader2, 
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SiteSettings {
  // Removed unnecessary fields - only keeping essential ones if needed
}

interface FeatureSettings {
  userRegistration: boolean
  pricePrediction: boolean
  proPlanActivation: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SiteSettings>({})
  const [features, setFeatures] = useState<FeatureSettings>({
    userRegistration: true,
    pricePrediction: true,
    proPlanActivation: true,
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back later.'
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/dashboard')
      return
    }

    fetchSettings()
  }, [user, router])

  const fetchSettings = async () => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/settings')

      if (response.ok) {
        const data = await response.json()
        setFeatures(data.features || features)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          features: features
        })
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }


  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFeatures(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Cog className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Feature Settings</h1>
            <p className="text-muted-foreground">Control platform features and functionality</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Feature Toggles */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Feature Controls</span>
          </h2>
          
          <div className="space-y-6">
            {/* User Registration Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-medium">User Registration</h3>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register on the platform
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="userRegistration"
                  checked={features.userRegistration}
                  onChange={handleFeatureChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Price Prediction Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-medium">Price Prediction</h3>
                <p className="text-sm text-muted-foreground">
                  Enable AI-powered price prediction for vehicles
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="pricePrediction"
                  checked={features.pricePrediction}
                  onChange={handleFeatureChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Pro Plan Activation Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-medium">Pro Plan Activation</h3>
                <p className="text-sm text-muted-foreground">
                  Allow users to activate premium subscription plans
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="proPlanActivation"
                  checked={features.proPlanActivation}
                  onChange={handleFeatureChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Maintenance Mode Toggle - Only for Super Admins */}
            {user?.role === 'superadmin' && (
              <div className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100">Maintenance Mode</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Temporarily disable website access for all users except administrators
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={features.maintenanceMode}
                    onChange={handleFeatureChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-orange-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-orange-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            )}

            {/* Maintenance Message - Only show when maintenance mode is enabled */}
            {features.maintenanceMode && user?.role === 'superadmin' && (
              <div className="p-4 border rounded-lg border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <label className="block text-sm font-medium mb-2 text-orange-900 dark:text-orange-100">
                  Maintenance Message
                </label>
                <textarea
                  name="maintenanceMessage"
                  value={features.maintenanceMessage}
                  onChange={handleFeatureChange}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Enter the message to display during maintenance mode"
                />
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  This message will be displayed to users when maintenance mode is active
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
