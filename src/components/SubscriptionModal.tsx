'use client'

import { useState, useEffect } from 'react'
import { X, Save, User, Calendar, DollarSign, CreditCard } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Subscription {
  id: string
  userId: string
  planType: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  startDate: string
  endDate: string
  price: number
  paymentMethod: string
  transactionId: string
  createdAt: string
  updatedAt: string
  userName: string
  userEmail: string
}

interface SubscriptionPlan {
  id: string
  name: string
  planType: 'monthly' | 'yearly' | 'custom'
  price: number
  durationMonths: number
  features: string[]
  isActive: boolean
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  subscription?: Subscription | null
  subscriptionPlans: SubscriptionPlan[]
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  subscription,
  subscriptionPlans
}: SubscriptionModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    planId: '',
    startDate: '',
    endDate: '',
    status: 'active',
    paymentMethod: 'manual',
    transactionId: ''
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  const isEdit = !!subscription

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      if (subscription) {
        setFormData({
          userId: subscription.userId,
          planId: '', // No planId in current schema
          startDate: subscription.startDate.split('T')[0],
          endDate: subscription.endDate.split('T')[0],
          status: subscription.status,
          paymentMethod: subscription.paymentMethod,
          transactionId: subscription.transactionId
        })
        setSelectedUser({
          id: subscription.userId,
          name: subscription.userName,
          email: subscription.userEmail,
          role: 'user'
        })
        // Find plan by planType
        const plan = subscriptionPlans.find(p => p.planType === subscription.planType)
        setSelectedPlan(plan || null)
      } else {
        setFormData({
          userId: '',
          planId: '',
          startDate: '',
          endDate: '',
          status: 'active',
          paymentMethod: 'manual',
          transactionId: ''
        })
        setSelectedUser(null)
        setSelectedPlan(null)
      }
    }
  }, [isOpen, subscription, subscriptionPlans])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId)
    setSelectedUser(user || null)
    setFormData(prev => ({ ...prev, userId }))
  }

  const handlePlanSelect = (planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId)
    setSelectedPlan(plan || null)
    setFormData(prev => ({ ...prev, planId }))
    
    if (plan) {
      // Auto-calculate end date based on plan duration
      const startDate = formData.startDate || new Date().toISOString().split('T')[0]
      const start = new Date(startDate)
      const end = new Date(start)
      
      // Add the duration in months
      end.setMonth(end.getMonth() + plan.durationMonths)
      
      setFormData(prev => ({
        ...prev,
        endDate: end.toISOString().split('T')[0]
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.userId || !formData.planId || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const url = isEdit 
        ? `/api/admin/subscriptions/${subscription.id}`
        : '/api/admin/subscriptions'
      
      const method = isEdit ? 'PATCH' : 'POST'
      const body = isEdit 
        ? { action: 'update', ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Subscription saved successfully')
        onSuccess()
        onClose()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save subscription')
      }
    } catch (error) {
      console.error('Error saving subscription:', error)
      toast.error('Failed to save subscription')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Subscription' : 'Add New Subscription'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <User className="inline h-4 w-4 mr-2" />
              User *
            </label>
            <select
              value={formData.userId}
              onChange={(e) => handleUserSelect(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {selectedUser && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {selectedUser.name} - {selectedUser.email}
              </p>
            )}
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <DollarSign className="inline h-4 w-4 mr-2" />
              Subscription Plan *
            </label>
            <select
              value={formData.planId}
              onChange={(e) => handlePlanSelect(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a plan</option>
              {subscriptionPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.planType} - Rs. {plan.price.toLocaleString()}
                </option>
              ))}
            </select>
            {selectedPlan && (
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground">{selectedPlan.name}</p>
                <p className="text-sm text-muted-foreground">
                  Duration: {selectedPlan.durationMonths} month{selectedPlan.durationMonths !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  Price: Rs. {selectedPlan.price.toLocaleString()} ({selectedPlan.planType})
                </p>
              </div>
            )}
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Status and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <CreditCard className="inline h-4 w-4 mr-2" />
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="manual">Manual</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Transaction ID
            </label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
              placeholder="Enter transaction ID (optional)"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
