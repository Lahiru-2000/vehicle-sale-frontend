'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Calendar,
  DollarSign,
  User,
  RefreshCw,
  Download,
  X,
  Clock,
  Star
} from 'lucide-react'
import SubscriptionModal from '@/components/SubscriptionModal'
import SubscriptionDetailsModal from '@/components/SubscriptionDetailsModal'

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
  postCount: number
  features: string[]
  isActive: boolean
  createdAt: string
}

interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  expiredSubscriptions: number
  pendingSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  yearlyRevenue: number
  averageSubscriptionValue: number
}

export default function SubscriptionManagement() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)

  // Redirect if not admin or superadmin
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'superadmin'))) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch data
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchSubscriptions(),
        fetchSubscriptionPlans(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/subscriptions')

      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
        setTotalPages(Math.ceil((data.subscriptions || []).length / itemsPerPage))
      } else {
        throw new Error('Failed to fetch subscriptions')
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to fetch subscriptions')
    }
  }

  const fetchSubscriptionPlans = async () => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/subscription-plans')

      if (response.ok) {
        const data = await response.json()
        setSubscriptionPlans(data.plans || [])
      } else {
        throw new Error('Failed to fetch subscription plans')
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      toast.error('Failed to fetch subscription plans')
    }
  }

  const fetchStats = async () => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/subscription-stats')

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error('Failed to fetch stats')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to fetch stats')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    toast.success('Data refreshed successfully')
  }

  const handleAddSubscription = () => {
    setSelectedSubscription(null)
    setShowModal(true)
  }


  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscriptionId(subscription.id)
    setShowDetailsModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedSubscription(null)
  }

  const handleModalSuccess = () => {
    fetchData()
  }

  const handleAddPlan = () => {
    setSelectedPlan(null)
    setShowPlanModal(true)
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowPlanModal(true)
  }

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete the "${planName}" plan? This action cannot be undone.`)) {
      return
    }

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/subscription-plans/${planId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Subscription plan deleted successfully')
        fetchData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete subscription plan')
      }
    } catch (error) {
      console.error('Error deleting subscription plan:', error)
      toast.error('Failed to delete subscription plan')
    }
  }

  const handleTogglePlanStatus = async (planId: string, currentStatus: boolean, planName: string) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    const actionText = action === 'deactivate' ? 'deactivate' : 'activate'
    
    if (!confirm(`Are you sure you want to ${actionText} the "${planName}" plan?`)) {
      return
    }

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/subscription-plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isActive: !currentStatus 
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || `Plan ${actionText}d successfully`)
        fetchData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `Failed to ${actionText} plan`)
      }
    } catch (error) {
      console.error(`Error ${actionText}ing plan:`, error)
      toast.error(`Failed to ${actionText} plan`)
    }
  }

  const handlePlanModalClose = () => {
    setShowPlanModal(false)
    setSelectedPlan(null)
  }

  const handlePlanModalSuccess = () => {
    fetchData()
  }

  const handleDeleteSubscription = async (subscriptionId: string, subscriptionName: string) => {
    if (!confirm(`Are you sure you want to delete the subscription for ${subscriptionName}?`)) {
      return
    }

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/subscriptions/${subscriptionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Subscription deleted successfully')
        fetchData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete subscription')
      }
    } catch (error) {
      console.error('Error deleting subscription:', error)
      toast.error('Failed to delete subscription')
    }
  }

  const handleToggleStatus = async (subscriptionId: string, currentStatus: string, subscriptionName: string) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'reactivate'
    const actionText = action === 'deactivate' ? 'deactivate' : 'reactivate'
    
    if (!confirm(`Are you sure you want to ${actionText} the subscription for ${subscriptionName}?`)) {
      return
    }

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || `Subscription ${actionText}d successfully`)
        fetchData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `Failed to ${actionText} subscription`)
      }
    } catch (error) {
      console.error(`Error ${actionText}ing subscription:`, error)
      toast.error(`Failed to ${actionText} subscription`)
    }
  }

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.planType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
    const matchesPlan = planFilter === 'all' || subscription.planType === planFilter
    
    return matchesSearch && matchesStatus && matchesPlan
  })

  // Paginate subscriptions
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'expired': return 'text-gray-600 bg-gray-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading subscription management...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Subscription Management</h1>
            <p className="text-muted-foreground mt-2">Manage user subscriptions and plans</p>
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
              onClick={handleAddSubscription}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Subscription</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalSubscriptions}</p>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Value</p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(stats.averageSubscriptionValue)}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans Management */}
        <div className="bg-card p-6 rounded-lg border mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Subscription Plans</h2>
              <p className="text-muted-foreground mt-1">Manage available subscription plans</p>
            </div>
            <button
              onClick={() => setShowPlanModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Plan</span>
            </button>
          </div>

          {subscriptionPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className={`bg-background p-6 rounded-lg border ${plan.isActive ? 'border-green-200' : 'border-gray-200'}`}>
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
                        onClick={() => handleTogglePlanStatus(plan.id, plan.isActive, plan.name)}
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
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No subscription plans found</h3>
              <p className="text-muted-foreground mb-4">Create your first subscription plan to get started.</p>
              <button
                onClick={() => setShowPlanModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Plan</span>
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-card p-6 rounded-lg border mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search subscriptions..."
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
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Plans</option>
              {subscriptionPlans.map(plan => (
                <option key={plan.id} value={plan.planType}>{plan.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setPlanFilter('all')
                setCurrentPage(1)
              }}
              className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Start Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">End Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Payment Method</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-t border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{subscription.userName}</p>
                        <p className="text-sm text-muted-foreground">{subscription.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{subscription.planType}</p>
                        <p className="text-sm text-muted-foreground capitalize">{subscription.planType}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {formatPrice(subscription.price)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground capitalize">
                      {subscription.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewSubscription(subscription)}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(subscription.id, subscription.status, subscription.userName)}
                          className={`p-2 hover:bg-muted rounded-md transition-colors ${
                            subscription.status === 'active' ? 'text-red-600' : 'text-green-600'
                          }`}
                          title={subscription.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {subscription.status === 'active' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(subscription.id, subscription.userName)}
                          className="p-2 hover:bg-red-50 rounded-md transition-colors text-red-600"
                          title="Delete Subscription"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)} of {filteredSubscriptions.length} subscriptions
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {paginatedSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No subscriptions found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding a new subscription.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && planFilter === 'all') && (
              <button
                onClick={handleAddSubscription}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Subscription</span>
              </button>
            )}
          </div>
        )}

        {/* Subscription Modal */}
        <SubscriptionModal
          isOpen={showModal}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          subscription={selectedSubscription}
          subscriptionPlans={subscriptionPlans}
        />

        {/* Subscription Details Modal */}
        <SubscriptionDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          subscriptionId={selectedSubscriptionId}
          onDeactivated={fetchData}
        />

        {/* Plan Modal */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg border max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedPlan ? 'Edit Plan' : 'Add New Plan'}
                </h2>
                <button
                  onClick={handlePlanModalClose}
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

                console.log('=== PLAN FORM SUBMISSION DEBUG ===')
                console.log('Form data:', planData)
                console.log('Selected plan:', selectedPlan)

                try {
                  const { apiFetch } = await import('@/lib/api-client')
                  
                  const url = selectedPlan 
                    ? `admin/subscription-plans/${selectedPlan.id}`
                    : 'admin/subscription-plans'
                  
                  const method = selectedPlan ? 'PATCH' : 'POST'
                  
                  console.log('Making request to:', url, 'Method:', method)
                  
                  const response = await apiFetch(url, {
                    method,
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(planData)
                  })

                  console.log('Response status:', response.status)
                  console.log('Response ok:', response.ok)

                  if (response.ok) {
                    const result = await response.json()
                    console.log('Success response:', result)
                    toast.success(selectedPlan ? 'Plan updated successfully' : 'Plan created successfully')
                    handlePlanModalClose()
                    fetchData()
                  } else {
                    const errorData = await response.json().catch(() => ({}))
                    console.error('Error response:', errorData)
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
                      defaultValue={selectedPlan?.name || ''}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter plan name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Plan Type</label>
                    <select
                      name="planType"
                      defaultValue={selectedPlan?.planType || 'monthly'}
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
                      defaultValue={selectedPlan?.price || ''}
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
                      defaultValue={selectedPlan?.postCount || ''}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter number of posts allowed"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Features (one per line)</label>
                    <textarea
                      name="features"
                      defaultValue={selectedPlan?.features?.join('\n') || ''}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary h-24"
                      placeholder="Enter features, one per line"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      defaultChecked={selectedPlan?.isActive ?? true}
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
                    onClick={handlePlanModalClose}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {selectedPlan ? 'Update Plan' : 'Create Plan'}
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