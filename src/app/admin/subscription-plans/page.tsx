'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  X,
  DollarSign,
  Calendar,
  Star
} from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  planType: 'monthly' | 'yearly' | 'custom'
  price: number
  postCount: number
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SubscriptionPlanManagement() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)

  // Redirect if not admin or superadmin
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'superadmin'))) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch data
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchPlans()
    }
  }, [user])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      } else {
        throw new Error('Failed to fetch subscription plans')
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      toast.error('Failed to fetch subscription plans')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPlans()
    setRefreshing(false)
    toast.success('Data refreshed successfully')
  }

  const handleAddPlan = () => {
    setEditingPlan(null)
    setShowAddModal(true)
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setShowAddModal(true)
  }

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete the "${planName}" plan? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Subscription plan deleted successfully')
        fetchPlans()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete subscription plan')
      }
    } catch (error) {
      console.error('Error deleting subscription plan:', error)
      toast.error('Failed to delete subscription plan')
    }
  }

  const handleToggleStatus = async (planId: string, currentStatus: boolean, planName: string) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    const actionText = action === 'deactivate' ? 'deactivate' : 'activate'
    
    if (!confirm(`Are you sure you want to ${actionText} the "${planName}" plan?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'toggle-status',
          isActive: !currentStatus 
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || `Plan ${actionText}d successfully`)
        fetchPlans()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `Failed to ${actionText} plan`)
      }
    } catch (error) {
      console.error(`Error ${actionText}ing plan:`, error)
      toast.error(`Failed to ${actionText} plan`)
    }
  }

  const handleModalClose = () => {
    setShowAddModal(false)
    setEditingPlan(null)
  }

  const handleModalSuccess = () => {
    fetchPlans()
  }

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.planType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && plan.isActive) ||
                         (statusFilter === 'inactive' && !plan.isActive)
    
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subscription Plan Management</h1>
            <p className="text-muted-foreground mt-2">Create and manage subscription plans</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleAddPlan}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Plan</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card p-6 rounded-lg border mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }}
              className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className={`bg-card p-6 rounded-lg border ${plan.isActive ? 'border-green-200' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      plan.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                      {plan.planType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleToggleStatus(plan.id, plan.isActive, plan.name)}
                    className={`p-2 rounded-md transition-colors ${
                      plan.isActive 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                  >
                    {plan.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit Plan"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id, plan.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold text-primary mb-2">
                  {formatPrice(plan.price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.planType === 'monthly' ? 'month' : plan.planType === 'yearly' ? 'year' : 'period'}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Posts: {plan.postCount} post{plan.postCount !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-foreground mb-2">Features:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {plan.features && Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  )) : (
                    <li className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
                      Basic features included
                    </li>
                  )}
                </ul>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(plan.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No subscription plans found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first subscription plan.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={handleAddPlan}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Plan</span>
              </button>
            )}
          </div>
        )}

        {/* Add/Edit Plan Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg border max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                </h2>
                <button
                  onClick={handleModalClose}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const planData = {
                  name: formData.get('name') as string,
                  planType: formData.get('planType') as string,
                  price: parseFloat(formData.get('price') as string),
                  postCount: parseInt(formData.get('postCount') as string),
                  features: (formData.get('features') as string).split('\n').filter(f => f.trim()),
                  isActive: formData.get('isActive') === 'on'
                }

                try {
                  const { apiFetch } = await import('@/lib/api-client')
                  const url = editingPlan 
                    ? `admin/subscription-plans/${editingPlan.id}`
                    : 'admin/subscription-plans'
                  
                  const method = editingPlan ? 'PATCH' : 'POST'
                  
                  const response = await apiFetch(url, {
                    method,
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(planData)
                  })

                  if (response.ok) {
                    toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully')
                    handleModalClose()
                    fetchPlans()
                  } else {
                    const errorData = await response.json().catch(() => ({}))
                    toast.error(errorData.error || 'Failed to save plan')
                  }
                } catch (error) {
                  console.error('Error saving plan:', error)
                  toast.error('Failed to save plan')
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Plan Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingPlan?.name || ''}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter plan name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Plan Type</label>
                    <select
                      name="planType"
                      defaultValue={editingPlan?.planType || 'monthly'}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (LKR)</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      defaultValue={editingPlan?.price || ''}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Post Count</label>
                    <input
                      type="number"
                      name="postCount"
                      min="1"
                      defaultValue={editingPlan?.postCount || ''}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter number of posts allowed"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Features (one per line)</label>
                    <textarea
                      name="features"
                      defaultValue={editingPlan?.features?.join('\n') || ''}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary h-24"
                      placeholder="Enter features, one per line"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      defaultChecked={editingPlan?.isActive ?? true}
                      className="rounded border-border"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      Active Plan
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
