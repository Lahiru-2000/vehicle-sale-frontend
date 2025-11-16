'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureSettings } from '@/hooks/useFeatureSettings'
import { 
  Settings, 
  Users, 
  BarChart3, 
  Crown, 
  Wrench, 
  Loader2,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FeatureSettings {
  userRegistration: boolean
  pricePrediction: boolean
  proPlanActivation: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
}

export default function QuickSettingsPanel() {
  const { user } = useAuth()
  const { features, loading, refetch } = useFeatureSettings()
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
        return <Users className="h-5 w-5" />
      case 'pricePrediction':
        return <BarChart3 className="h-5 w-5" />
      case 'proPlanActivation':
        return <Crown className="h-5 w-5" />
      case 'maintenanceMode':
        return <Wrench className="h-5 w-5" />
      default:
        return <Settings className="h-5 w-5" />
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
        return 'Allow new user registrations on the platform'
      case 'pricePrediction':
        return 'Enable AI-powered price prediction for vehicles'
      case 'proPlanActivation':
        return 'Allow users to activate premium subscription plans'
      case 'maintenanceMode':
        return 'Temporarily disable website access for all users except administrators'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card p-6 rounded-lg border">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Quick Settings</h2>
      </div>
      
      <div className="space-y-4">
        {/* User Registration */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              {getFeatureIcon('userRegistration')}
            </div>
            <div>
              <h3 className="font-medium">{getFeatureLabel('userRegistration')}</h3>
              <p className="text-sm text-muted-foreground">{getFeatureDescription('userRegistration')}</p>
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
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              {getFeatureIcon('pricePrediction')}
            </div>
            <div>
              <h3 className="font-medium">{getFeatureLabel('pricePrediction')}</h3>
              <p className="text-sm text-muted-foreground">{getFeatureDescription('pricePrediction')}</p>
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
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              {getFeatureIcon('proPlanActivation')}
            </div>
            <div>
              <h3 className="font-medium">{getFeatureLabel('proPlanActivation')}</h3>
              <p className="text-sm text-muted-foreground">{getFeatureDescription('proPlanActivation')}</p>
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
          <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                {getFeatureIcon('maintenanceMode')}
              </div>
              <div>
                <h3 className="font-medium text-orange-900 dark:text-orange-100">
                  {getFeatureLabel('maintenanceMode')}
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
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

        {/* Status Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(features).filter(v => v === true).length}
              </div>
              <div className="text-sm text-muted-foreground">Features Enabled</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(features).filter(v => v === false).length}
              </div>
              <div className="text-sm text-muted-foreground">Features Disabled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
