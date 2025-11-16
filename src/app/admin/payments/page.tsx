'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  Search,
  Filter,
  Download,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import SubscriptionDetailsModal from '@/components/SubscriptionDetailsModal'
import { exportToExcel, exportToPDF, clearAllFilters, SubscriptionExportData } from '@/lib/exportUtils'
import { apiFetch } from '@/lib/api-client'

interface PaymentStats {
  totalSubscriptions: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  expiredSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  yearlyRevenue: number
  averageSubscriptionValue: number
  thisMonthSubscriptions: number
  todaySubscriptions: number
  successfulPayments: number
}

interface Subscription {
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
  planName: string
  planFeatures: string
  displayStatus: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<PaymentStats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    cancelledSubscriptions: 0,
    expiredSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    averageSubscriptionValue: 0,
    thisMonthSubscriptions: 0,
    todaySubscriptions: 0,
    successfulPayments: 0
  })
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: ''
  })
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/dashboard')
      return
    }

    fetchPaymentData()
  }, [user, isLoading, router, filters, pagination.page])

  const fetchPaymentData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate
      })

      const response = await apiFetch(`admin/payments?${params}`)

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setSubscriptions(data.subscriptions)
        setPagination(data.pagination)
      } else {
        let errorMessage = 'Failed to fetch payment data'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use default message
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error fetching payment data:', error)
      toast.error('Failed to fetch payment data')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchPaymentData()
    setRefreshing(false)
    toast.success('Data refreshed successfully')
  }

  const handleViewSubscription = (subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSubscriptionId(null)
  }

  const handleSubscriptionDeactivated = () => {
    // Refresh the data when a subscription is deactivated
    fetchPaymentData()
  }

  const handleDeactivateSubscription = async (subscriptionId: string, subscriptionName: string) => {
    if (!confirm(`Are you sure you want to deactivate the subscription for ${subscriptionName}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
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
        fetchPaymentData() // Refresh the data
      } else {
        const errorData = await response.json()
        console.error('Deactivation error:', errorData)
        toast.error(errorData.details || errorData.error || 'Failed to deactivate subscription')
      }
    } catch (error) {
      console.error('Error deactivating subscription:', error)
      toast.error('Failed to deactivate subscription')
    }
  }

  const handleReactivateSubscription = async (subscriptionId: string, subscriptionName: string) => {
    if (!confirm(`Are you sure you want to reactivate the subscription for ${subscriptionName}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reactivate' })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Subscription reactivated successfully')
        fetchPaymentData() // Refresh the data
      } else {
        const errorData = await response.json()
        console.error('Reactivation error:', errorData)
        toast.error(errorData.details || errorData.error || 'Failed to reactivate subscription')
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      toast.error('Failed to reactivate subscription')
    }
  }

  const handleClearFilters = () => {
    setFilters(clearAllFilters())
    setPagination(prev => ({ ...prev, page: 1 }))
    toast.success('All filters cleared')
  }

  const handleExportExcel = async () => {
    setExporting('excel')
    try {
      // Fetch all data for export (without pagination)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: '10000' // Large number to get all records
      })

      const response = await fetch(`/api/admin/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const exportData: SubscriptionExportData[] = data.subscriptions.map((sub: any) => ({
          id: sub.id,
          userName: sub.userName,
          userEmail: sub.userEmail,
          userPhone: sub.userPhone,
          planType: sub.planType,
          planName: sub.planName,
          price: sub.price,
          status: sub.status,
          displayStatus: sub.displayStatus,
          paymentMethod: sub.paymentMethod,
          transactionId: sub.transactionId,
          startDate: sub.startDate,
          endDate: sub.endDate,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt
        }))

        const result = exportToExcel(exportData)
        if (result.success) {
          toast.success(`Excel file exported successfully: ${result.filename}`)
        } else {
          toast.error(result.error || 'Failed to export Excel file')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to fetch data for export')
      }
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Failed to export Excel file')
    } finally {
      setExporting(null)
    }
  }

  const handleExportPDF = async () => {
    setExporting('pdf')
    try {
      // Fetch all data for export (without pagination)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: '10000' // Large number to get all records
      })

      const response = await fetch(`/api/admin/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const exportData: SubscriptionExportData[] = data.subscriptions.map((sub: any) => ({
          id: sub.id,
          userName: sub.userName,
          userEmail: sub.userEmail,
          userPhone: sub.userPhone,
          planType: sub.planType,
          planName: sub.planName,
          price: sub.price,
          status: sub.status,
          displayStatus: sub.displayStatus,
          paymentMethod: sub.paymentMethod,
          transactionId: sub.transactionId,
          startDate: sub.startDate,
          endDate: sub.endDate,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt
        }))

        const result = exportToPDF(exportData)
        if (result.success) {
          toast.success(`PDF file exported successfully: ${result.filename}`)
        } else {
          toast.error(result.error || 'Failed to export PDF file')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to fetch data for export')
      }
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF file')
    } finally {
      setExporting(null)
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading payment data...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Payment Management</h1>
              <p className="text-muted-foreground">Manage subscription payments and financial data</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Successful Payments</p>
              <p className="text-2xl font-bold text-blue-600">{stats.successfulPayments}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-purple-600">{stats.thisMonthSubscriptions}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today</p>
              <p className="text-2xl font-bold text-orange-600">{stats.todaySubscriptions}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelledSubscriptions}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Value</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(stats.averageSubscriptionValue)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              placeholder="Start Date"
              className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              placeholder="End Date"
              className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              disabled={exporting === 'excel'}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {exporting === 'excel' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{exporting === 'excel' ? 'Exporting...' : 'Export Excel'}</span>
            </button>
            
            <button
              onClick={handleExportPDF}
              disabled={exporting === 'pdf'}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {exporting === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Subscription Payments</h3>
            <div className="text-sm text-muted-foreground">
              Showing {subscriptions.length} of {pagination.total} subscriptions
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading subscriptions...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">User</th>
                      <th className="text-left py-3 px-4 font-medium">Plan</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Payment Method</th>
                      <th className="text-left py-3 px-4 font-medium">Period</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{subscription.userName}</div>
                            <div className="text-sm text-muted-foreground">{subscription.userEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium capitalize">{subscription.planType}</div>
                            <div className="text-sm text-muted-foreground">{subscription.planName || 'Standard Plan'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{formatPrice(subscription.price)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {subscription.paymentMethod || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <div>Start: {new Date(subscription.startDate).toLocaleDateString()}</div>
                            <div>End: {new Date(subscription.endDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(subscription.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewSubscription(subscription.id)}
                              className="p-2 hover:bg-muted rounded-md transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {subscription.status === 'active' && (
                              <button
                                onClick={() => handleDeactivateSubscription(subscription.id, subscription.userName)}
                                className="p-2 hover:bg-red-50 rounded-md transition-colors text-red-600"
                                title="Deactivate Subscription"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                            {subscription.status === 'cancelled' && (
                              <button
                                onClick={() => handleReactivateSubscription(subscription.id, subscription.userName)}
                                className="p-2 hover:bg-green-50 rounded-md transition-colors text-green-600"
                                title="Reactivate Subscription"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Revenue by Plan Type</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Monthly Plans</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalRevenue > 0 ? (stats.monthlyRevenue / stats.totalRevenue) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-16 text-right">
                  {formatPrice(stats.monthlyRevenue)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Yearly Plans</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalRevenue > 0 ? (stats.yearlyRevenue / stats.totalRevenue) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-16 text-right">
                  {formatPrice(stats.yearlyRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Subscription Status</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalSubscriptions > 0 ? (stats.activeSubscriptions / stats.totalSubscriptions) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {stats.activeSubscriptions}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cancelled</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalSubscriptions > 0 ? (stats.cancelledSubscriptions / stats.totalSubscriptions) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {stats.cancelledSubscriptions}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expired</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalSubscriptions > 0 ? (stats.expiredSubscriptions / stats.totalSubscriptions) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {stats.expiredSubscriptions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details Modal */}
      <SubscriptionDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        subscriptionId={selectedSubscriptionId}
        onDeactivated={handleSubscriptionDeactivated}
      />
    </div>
  )
}
