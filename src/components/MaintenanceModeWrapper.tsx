'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useFeatureSettings } from '@/hooks/useFeatureSettings'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import MaintenanceMode from './MaintenanceMode'

interface MaintenanceModeWrapperProps {
  children: React.ReactNode
}

export default function MaintenanceModeWrapper({ children }: MaintenanceModeWrapperProps) {
  const pathname = usePathname()
  const { features, loading } = useFeatureSettings()
  const { admin } = useAdminAuth()

  // Show loading state while fetching settings
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if maintenance mode is enabled
  if (features.maintenanceMode) {
    // Allow admin access to admin pages even during maintenance
    const isAdminPage = pathname.startsWith('/admin')
    const isAdminLoggedIn = admin && (admin.role === 'admin' || admin.role === 'superadmin')
    
    if (!isAdminPage || !isAdminLoggedIn) {
      return <MaintenanceMode message={features.maintenanceMessage} />
    }
  }

  return <>{children}</>
}
