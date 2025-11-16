'use client'

import React, { useState } from 'react'
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SubscriptionDetails {
  id: string
  userId: string
  planType: string
  status: string
  startDate: string
  endDate: string
  price: number
  paymentMethod: string
  transactionId: string
  createdAt: string
  updatedAt: string
  userName: string
  userEmail: string
  userPhone: string
  userRole: string
  userIsBlocked: boolean
  userCreatedAt: string
  planName: string
  planFeatures: string
  durationMonths: number
  displayStatus: string
  durationDays: number
  daysRemaining: number
  vehicleCount: number
}

interface SubscriptionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionId: string | null
  onDeactivated: () => void
}

export default function SubscriptionDetailsModal({ 
  isOpen, 
  onClose, 
  subscriptionId, 
  onDeactivated 
}: SubscriptionDetailsModalProps) {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  React.useEffect(() => {
    if (isOpen && subscriptionId) {
      fetchSubscriptionDetails()
    }
  }, [isOpen, subscriptionId])

  const fetchSubscriptionDetails = async () => {
    if (!subscriptionId) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to fetch subscription details')
        onClose()
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error)
      toast.error('Failed to fetch subscription details')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!subscription) return

    if (!confirm(`Are you sure you want to deactivate the subscription for ${subscription.userName}?`)) {
      return
    }

    setDeactivating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'deactivate' })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Subscription deactivated successfully')
        onDeactivated()
        onClose()
      } else {
        const errorData = await response.json()
        console.error('Deactivation error:', errorData)
        toast.error(errorData.details || errorData.error || 'Failed to deactivate subscription')
      }
    } catch (error) {
      console.error('Error deactivating subscription:', error)
      toast.error('Failed to deactivate subscription')
    } finally {
      setDeactivating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Subscription Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading subscription details...</span>
            </div>
          ) : subscription ? (
            <div className="space-y-6">
              {/* User Information */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>User Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg font-medium">{subscription.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg font-medium flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{subscription.userEmail}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-lg font-medium flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{subscription.userPhone || 'N/A'}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <p className="text-lg font-medium capitalize">{subscription.userRole}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                    <p className={`text-lg font-medium flex items-center space-x-2 ${
                      subscription.userIsBlocked ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {subscription.userIsBlocked ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Blocked</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Active</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-lg font-medium">
                      {new Date(subscription.userCreatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vehicles Posted</label>
                    <p className="text-lg font-medium">{subscription.vehicleCount}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Information */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Subscription Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Type</label>
                    <p className="text-lg font-medium capitalize">{subscription.planType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
                    <p className="text-lg font-medium">{subscription.planName || 'Standard Plan'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                    <p className="text-lg font-medium flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatPrice(subscription.price)}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.displayStatus === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : subscription.displayStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : subscription.displayStatus === 'Expired'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {subscription.displayStatus}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                    <p className="text-lg font-medium">{subscription.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                    <p className="text-sm font-medium font-mono">{subscription.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="text-lg font-medium flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                    <p className="text-lg font-medium flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <p className="text-lg font-medium">{subscription.durationDays} days ({subscription.durationMonths} months)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Days Remaining</label>
                    <p className={`text-lg font-medium flex items-center space-x-2 ${
                      subscription.daysRemaining > 7 ? 'text-green-600' : 
                      subscription.daysRemaining > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      <Clock className="h-4 w-4" />
                      <span>{subscription.daysRemaining} days</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                    <p className="text-lg font-medium">
                      {new Date(subscription.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-lg font-medium">
                      {new Date(subscription.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              {subscription.planFeatures && (
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Plan Features</h3>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {subscription.planFeatures}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Subscription ID: {subscription.id}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                  {subscription.status === 'active' && (
                    <button
                      onClick={handleDeactivate}
                      disabled={deactivating}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deactivating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      <span>{deactivating ? 'Deactivating...' : 'Deactivate Subscription'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Failed to load subscription details</p>
              <p className="text-muted-foreground">Please try again later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
