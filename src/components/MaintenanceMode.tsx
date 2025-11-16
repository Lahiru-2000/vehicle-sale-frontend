'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Wrench, 
  Clock, 
  RefreshCw, 
  ArrowLeft,
  Mail,
  Phone
} from 'lucide-react'

interface MaintenanceModeProps {
  message?: string
}

export default function MaintenanceMode({ message }: MaintenanceModeProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(30)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    window.location.reload()
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Maintenance Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 dark:bg-orange-900 rounded-full mb-6">
            <Wrench className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            We'll Be Right Back
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {message || 'We are currently performing scheduled maintenance. Please check back later.'}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Maintenance in Progress
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our team is working hard to improve your experience. We'll be back online shortly.
            </p>
            
            {/* Auto-refresh countdown */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                This page will automatically refresh in:
              </p>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {countdown}s
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Now'}</span>
              </button>
              
              <button
                onClick={handleGoBack}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Need Immediate Assistance?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            If you have an urgent matter, please contact us directly:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">support@drivedeal.lk</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">+94 11 234 5678</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 DRIVEDEAL. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
