'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureSettings } from '@/hooks/useFeatureSettings'
import { 
  Settings, 
  ChevronDown, 
  Users, 
  BarChart3, 
  Crown, 
  Wrench, 
  Loader2,
  Check,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FeatureSettings {
  userRegistration: boolean
  pricePrediction: boolean
  proPlanActivation: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
}

export default function GlobalSettingsDropdown() {
  const { user } = useAuth()
  const { features, loading, refetch } = useFeatureSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  // Don't show for non-admin users
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return null

  const handleToggleFeature = async (featureName: keyof FeatureSettings, currentValue: boolean) => {
    if (updating) return

    // Check if user is trying to modify maintenance mode
    if (featureName === 'maintenanceMode' && user?.role !== 'superadmin') {
      toast.error('Only superadmins can modify maintenance mode')
      return
    }

    setUpdating(featureName)
    
    try {
      const token = localStorage.getItem('token')
      const updatedFeatures = {
        ...features,
        [featureName]: !currentValue
      }

      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          features: updatedFeatures
        })
      })

      if (response.ok) {
        toast.success(`${featureName === 'userRegistration' ? 'User Registration' : 
                      featureName === 'pricePrediction' ? 'Price Prediction' :
                      featureName === 'proPlanActivation' ? 'Pro Plan Activation' :
                      'Maintenance Mode'} ${!currentValue ? 'enabled' : 'disabled'}`)
        refetch()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update setting')
      }
    } catch (error) {
      console.error('Error updating feature:', error)
      toast.error('Failed to update setting')
    } finally {
      setUpdating(null)
    }
  }

  const getFeatureIcon = (featureName: keyof FeatureSettings) => {
    switch (featureName) {
      case 'userRegistration':
        return <Users className="h-4 w-4" />
      case 'pricePrediction':
        return <BarChart3 className="h-4 w-4" />
      case 'proPlanActivation':
        return <Crown className="h-4 w-4" />
      case 'maintenanceMode':
        return <Wrench className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getFeatureLabel = (featureName: keyof FeatureSettings) => {
    switch (featureName) {
      case 'userRegistration':
        return 'User Registration'
      case 'pricePrediction':
        return 'Price Prediction'
      case 'proPlanActivation':
        return 'Pro Plan Activation'
      case 'maintenanceMode':
        return 'Maintenance Mode'
      default:
        return featureName
    }
  }

  const getFeatureDescription = (featureName: keyof FeatureSettings) => {
    switch (featureName) {
      case 'userRegistration':
        return 'Allow new user registrations'
      case 'pricePrediction':
        return 'Enable AI price prediction'
      case 'proPlanActivation':
        return 'Allow premium subscriptions'
      case 'maintenanceMode':
        return 'Temporarily disable website access'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Settings className="h-4 w-4" />
        <span className="text-sm font-medium">Settings</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-20">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Global Settings</span>
              </h3>
              
              <div className="space-y-3">
                {/* User Registration */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFeatureIcon('userRegistration')}
                    <div>
                      <p className="text-sm font-medium">{getFeatureLabel('userRegistration')}</p>
                      <p className="text-xs text-muted-foreground">{getFeatureDescription('userRegistration')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('userRegistration', features.userRegistration)}
                    disabled={updating === 'userRegistration'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      features.userRegistration ? 'bg-primary' : 'bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        features.userRegistration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Price Prediction */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFeatureIcon('pricePrediction')}
                    <div>
                      <p className="text-sm font-medium">{getFeatureLabel('pricePrediction')}</p>
                      <p className="text-xs text-muted-foreground">{getFeatureDescription('pricePrediction')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('pricePrediction', features.pricePrediction)}
                    disabled={updating === 'pricePrediction'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      features.pricePrediction ? 'bg-primary' : 'bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        features.pricePrediction ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Pro Plan Activation */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFeatureIcon('proPlanActivation')}
                    <div>
                      <p className="text-sm font-medium">{getFeatureLabel('proPlanActivation')}</p>
                      <p className="text-xs text-muted-foreground">{getFeatureDescription('proPlanActivation')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('proPlanActivation', features.proPlanActivation)}
                    disabled={updating === 'proPlanActivation'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      features.proPlanActivation ? 'bg-primary' : 'bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        features.proPlanActivation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Maintenance Mode - Only for Super Admins */}
                {user?.role === 'superadmin' && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center space-x-3">
                      {getFeatureIcon('maintenanceMode')}
                      <div>
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          {getFeatureLabel('maintenanceMode')}
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                          {getFeatureDescription('maintenanceMode')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFeature('maintenanceMode', features.maintenanceMode)}
                      disabled={updating === 'maintenanceMode'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        features.maintenanceMode ? 'bg-orange-500' : 'bg-orange-200'
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          features.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Quick Status</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${features.userRegistration ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>Registration</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${features.pricePrediction ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>Prediction</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${features.proPlanActivation ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>Pro Plans</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
