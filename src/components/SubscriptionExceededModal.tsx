'use client'

import { useState } from 'react'
import { X, Crown, AlertTriangle, CreditCard, RefreshCw } from 'lucide-react'

interface SubscriptionExceededModalProps {
  isOpen: boolean
  onClose: () => void
  onRenewSubscription: () => void
  onUpgradePlan: () => void
  planType?: string
  subscriptionId?: string
  isAutoCancelled?: boolean
}

export default function SubscriptionExceededModal({
  isOpen,
  onClose,
  onRenewSubscription,
  onUpgradePlan,
  planType,
  subscriptionId,
  isAutoCancelled = false
}: SubscriptionExceededModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isAutoCancelled ? 'Subscription Auto-Cancelled' : 'Subscription Exceeded'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isAutoCancelled ? 'Your premium subscription has been cancelled' : 'You\'ve used all your premium posts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
              <Crown className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isAutoCancelled ? 'Premium Posts Exhausted' : 'Premium Posts Used Up'}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {isAutoCancelled 
                  ? 'You\'ve used all your premium posts and your subscription has been automatically cancelled. You can still post regular vehicles or reactivate your premium subscription.'
                  : 'You\'ve reached the limit of premium posts for your current plan. Choose an option below to continue posting premium vehicles.'
                }
              </p>
            </div>
            
            {planType && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Current Plan: <span className="font-medium capitalize">{planType}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onRenewSubscription}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Renew Current Plan</span>
            </button>
            
            <button
              onClick={onUpgradePlan}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Crown className="h-5 w-5" />
              <span>Upgrade to Higher Plan</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <span>Continue with Regular Posts</span>
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              <strong>Note:</strong> Regular posts are free but won't appear as premium vehicles. 
              Upgrade your plan to get more premium post slots.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
