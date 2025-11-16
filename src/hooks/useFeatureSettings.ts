'use client'

import { useState, useEffect } from 'react'

interface FeatureSettings {
  userRegistration: boolean
  pricePrediction: boolean
  proPlanActivation: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
}

export function useFeatureSettings() {
  const [features, setFeatures] = useState<FeatureSettings>({
    userRegistration: true,
    pricePrediction: true,
    proPlanActivation: true,
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back later.'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeatureSettings()
  }, [])

  const fetchFeatureSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('settings/features')
      
      if (response.ok) {
        const data = await response.json()
        setFeatures(data)
      } else if (response.status === 404) {
        // Endpoint doesn't exist in .NET backend yet - use default values
        console.warn('Settings endpoint not available, using default values')
        setError(null) // Don't show error for missing endpoint
      } else {
        setError('Failed to load feature settings')
      }
    } catch (err) {
      console.error('Error fetching feature settings:', err)
      // Use default values if endpoint is not available
      setError(null) // Don't show error for missing endpoint
    } finally {
      setLoading(false)
    }
  }

  return {
    features,
    loading,
    error,
    refetch: fetchFeatureSettings
  }
}
