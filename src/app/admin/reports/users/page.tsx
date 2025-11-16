'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Clock,
  Shield,
  UserCheck,
  UserX,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Crown,
  Phone,
  Mail,
  Car,
  Star
} from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  phone: string
  isBlocked: boolean
  lastLogin: string
  createdAt: string
  updatedAt: string
  vehicleCount: number
  approvedVehicles: number
  pendingVehicles: number
  rejectedVehicles: number
  favoritesCount: number
  hasActiveSubscription: boolean
  subscriptionPlan: string
  subscriptionEndDate: string
}

interface RecentActivity {
  activityType: string
  userName: string
  userEmail: string
  activityDate: string
  description: string
  userPhone: string
  userStatus: boolean
}

interface Analytics {
  newUsersThisWeek: number
  newUsersThisMonth: number
  activeToday: number
  activeThisWeek: number
  activeThisMonth: number
  avgVehiclesPerUser: number
}

interface StatusDistribution {
  status: string
  count: number
}

export default function UserReportsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activities' | 'reports'>('overview')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Report filters
  const [reportFilters, setReportFilters] = useState({
    status: 'all',
    registeredDateFrom: '',
    registeredDateTo: '',
    userType: 'all',
    vehicleCountMin: '',
    vehicleCountMax: '',
    lastLoginFrom: '',
    lastLoginTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showReportFilters, setShowReportFilters] = useState(false)
  const [reportData, setReportData] = useState<User[]>([])
  const [loadingReport, setLoadingReport] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState({
    name: true,
    email: true,
    phone: true,
    status: true,
    lastLogin: true,
    vehicleCount: true,
    subscription: true,
    joinedDate: true
  })

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/admin')
      toast.error('Access denied. Admin privileges required.')
      return
    }

    fetchUserData()
  }, [user, isLoading, router, currentPage])

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReportData()
    }
  }, [activeTab, reportFilters])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/user-reports?page=${currentPage}&limit=10`)

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setRecentActivities(data.recentActivities || [])
        setAnalytics(data.analytics || null)
        setStatusDistribution(data.statusDistribution || [])
        setStatistics(data.statistics || null)
      } else {
        toast.error('Failed to fetch user data')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  const fetchReportData = async () => {
    setLoadingReport(true)
    try {
      const params = new URLSearchParams({
        ...reportFilters,
        export: 'true' // Get all data for reports
      })

      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/user-reports?${params}`)

      if (response.ok) {
        const data = await response.json()
        setReportData(data.users || [])
      } else {
        toast.error('Failed to fetch report data')
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to fetch report data')
    } finally {
      setLoadingReport(false)
    }
  }

  const exportReport = () => {
    if (reportData.length === 0) {
      toast.error('No data to export')
      return
    }

    // Filter data based on selected columns
    const filteredData = reportData.map(user => {
      const row: any = {}
      if (selectedColumns.name) row['Name'] = user.name
      if (selectedColumns.email) row['Email'] = user.email
      if (selectedColumns.phone) row['Phone'] = user.phone || 'N/A'
      if (selectedColumns.status) row['Status'] = user.isBlocked ? 'Blocked' : 'Active'
      if (selectedColumns.lastLogin) row['Last Login'] = user.lastLogin ? formatDate(user.lastLogin) : 'Never'
      if (selectedColumns.vehicleCount) row['Vehicle Count'] = user.vehicleCount
      if (selectedColumns.subscription) row['Subscription'] = user.hasActiveSubscription ? `${user.subscriptionPlan || 'Premium'}` : 'Free'
      if (selectedColumns.joinedDate) row['Joined Date'] = formatDate(user.createdAt)
      return row
    })

    // Convert to CSV
    const headers = Object.keys(filteredData[0])
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `user-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Report exported successfully with ${filteredData.length} users`)
  }

  const handleFilterChange = (key: string, value: string) => {
    setReportFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetFilters = () => {
    setReportFilters({
      status: 'all',
      registeredDateFrom: '',
      registeredDateTo: '',
      userType: 'all',
      vehicleCountMin: '',
      vehicleCountMax: '',
      lastLoginFrom: '',
      lastLoginTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'registration':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'vehicle_posted':
        return <Car className="h-4 w-4 text-blue-500" />
      case 'login':
        return <UserCheck className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading user analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Analytics</h1>
          <p className="text-muted-foreground">Comprehensive user analytics and insights (Normal Users Only)</p>
        </div>
        {/* <button
          onClick={exportReport}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button> */}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'overview'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'users'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'activities'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Activities</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'reports'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Download className="h-4 w-4" />
          <span>Reports</span>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && statistics && (
        <div>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{statistics.totalUsers}</p>
                  <p className="text-sm text-green-600">{statistics.activeUsers} active</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Last 30 Days</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.activeLast30Days}</p>
                  <p className="text-sm text-muted-foreground">{Math.round((statistics.activeLast30Days / statistics.totalUsers) * 100)}% of total</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blocked Users</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.blockedUsers}</p>
                  <p className="text-sm text-muted-foreground">{Math.round((statistics.blockedUsers / statistics.totalUsers) * 100)}% of total</p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Premium Users</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.activeSubscriptions}</p>
                  <p className="text-sm text-muted-foreground">{Math.round((statistics.activeSubscriptions / statistics.totalUsers) * 100)}% of total</p>
                </div>
                <Crown className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Analytics Data */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New Users This Week</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.newUsersThisWeek}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New Users This Month</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.newUsersThisMonth}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                    <p className="text-2xl font-bold text-purple-600">{analytics.activeToday}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active This Week</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics.activeThisWeek}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              {/* <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active This Month</p>
                    <p className="text-2xl font-bold text-indigo-600">{analytics.activeThisMonth}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
              </div> */}

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Vehicles/User</p>
                    <p className="text-2xl font-bold text-teal-600">{analytics.avgVehiclesPerUser.toFixed(1)}</p>
                  </div>
                  <Car className="h-8 w-8 text-teal-600" />
                </div>
              </div>
            </div>
          )}

          {/* Status Distribution */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">User Status Distribution</h3>
            <div className="space-y-3">
              {statusDistribution.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status.status.includes('Active') ? 'bg-green-500' :
                      status.status.includes('Blocked') ? 'bg-red-500' :
                      status.status.includes('Never') ? 'bg-gray-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm font-medium">{status.status}</span>
                  </div>
                  <span className="font-semibold">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Search and Filters */}
          <div className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-muted"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-card rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Last Login</th>
                    <th className="text-left p-4 font-medium">Vehicles</th>
                    <th className="text-left p-4 font-medium">Subscription</th>
                    <th className="text-left p-4 font-medium">Joined</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {user.isBlocked ? (
                            <UserX className="h-4 w-4 text-red-500" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                          <span className={user.isBlocked ? 'text-red-600' : 'text-green-600'}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div>Total: {user.vehicleCount}</div>
                          <div className="text-muted-foreground">
                            Approved: {user.approvedVehicles} | Pending: {user.pendingVehicles}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {user.hasActiveSubscription ? (
                            <Crown className="h-4 w-4 text-yellow-500" title="Premium User" />
                          ) : (
                            <span className="text-sm text-muted-foreground">Free</span>
                          )}
                          {user.subscriptionPlan && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {user.subscriptionPlan}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4">
                        <button className="p-1 hover:bg-muted rounded">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Recent User Activities</h3>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-4 rounded-lg ${
                    activity.activityType === 'registration' ? 'bg-green-50' :
                    activity.activityType === 'vehicle_posted' ? 'bg-blue-50' :
                    activity.activityType === 'login' ? 'bg-purple-50' :
                    'bg-yellow-50'
                  }`}>
                    {getActivityIcon(activity.activityType)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          activity.activityType === 'registration' ? 'text-green-800' :
                          activity.activityType === 'vehicle_posted' ? 'text-blue-800' :
                          activity.activityType === 'login' ? 'text-purple-800' :
                          'text-yellow-800'
                        }`}>
                          {activity.userName}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          activity.userStatus ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {activity.userStatus ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        activity.activityType === 'registration' ? 'text-green-600' :
                        activity.activityType === 'vehicle_posted' ? 'text-blue-600' :
                        activity.activityType === 'login' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`}>
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{activity.userEmail}</span>
                        </span>
                        {activity.userPhone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{activity.userPhone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.activityDate)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          {/* Report Controls */}
          <div className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold">User Analytics</h3>
                <span className="text-sm text-muted-foreground">
                  {reportData.length} users found
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowReportFilters(!showReportFilters)}
                  className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-muted"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {showReportFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button
                  onClick={exportReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showReportFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={reportFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">User Type</label>
                  <select
                    value={reportFilters.userType}
                    onChange={(e) => handleFilterChange('userType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Types</option>
                    <option value="premium">Premium</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Vehicle Count (Min)</label>
                  <input
                    type="number"
                    value={reportFilters.vehicleCountMin}
                    onChange={(e) => handleFilterChange('vehicleCountMin', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Vehicle Count (Max)</label>
                  <input
                    type="number"
                    value={reportFilters.vehicleCountMax}
                    onChange={(e) => handleFilterChange('vehicleCountMax', e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Registered From</label>
                  <input
                    type="date"
                    value={reportFilters.registeredDateFrom}
                    onChange={(e) => handleFilterChange('registeredDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Registered To</label>
                  <input
                    type="date"
                    value={reportFilters.registeredDateTo}
                    onChange={(e) => handleFilterChange('registeredDateTo', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Login From</label>
                  <input
                    type="date"
                    value={reportFilters.lastLoginFrom}
                    onChange={(e) => handleFilterChange('lastLoginFrom', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Login To</label>
                  <input
                    type="date"
                    value={reportFilters.lastLoginTo}
                    onChange={(e) => handleFilterChange('lastLoginTo', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={reportFilters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="createdAt">Registration Date</option>
                    <option value="lastLogin">Last Login</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="vehicleCount">Vehicle Count</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort Order</label>
                  <select
                    value={reportFilters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}

            {/* Column Selection */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Select Columns for Export:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(selectedColumns).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSelectedColumns(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Report Table */}
          <div className="bg-card rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    {selectedColumns.name && <th className="text-left p-4 font-medium">Name</th>}
                    {selectedColumns.email && <th className="text-left p-4 font-medium">Email</th>}
                    {selectedColumns.phone && <th className="text-left p-4 font-medium">Phone</th>}
                    {selectedColumns.status && <th className="text-left p-4 font-medium">Status</th>}
                    {selectedColumns.lastLogin && <th className="text-left p-4 font-medium">Last Login</th>}
                    {selectedColumns.vehicleCount && <th className="text-left p-4 font-medium">Vehicles</th>}
                    {selectedColumns.subscription && <th className="text-left p-4 font-medium">Subscription</th>}
                    {selectedColumns.joinedDate && <th className="text-left p-4 font-medium">Joined</th>}
                  </tr>
                </thead>
                <tbody>
                  {loadingReport ? (
                    <tr>
                      <td colSpan={Object.values(selectedColumns).filter(Boolean).length} className="p-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2">Loading report data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : reportData.length > 0 ? (
                    reportData.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        {selectedColumns.name && (
                          <td className="p-4">
                            <div className="font-medium">{user.name}</div>
                          </td>
                        )}
                        {selectedColumns.email && (
                          <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                        )}
                        {selectedColumns.phone && (
                          <td className="p-4 text-sm text-muted-foreground">{user.phone || 'N/A'}</td>
                        )}
                        {selectedColumns.status && (
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {user.isBlocked ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                              <span className={user.isBlocked ? 'text-red-600' : 'text-green-600'}>
                                {user.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </div>
                          </td>
                        )}
                        {selectedColumns.lastLogin && (
                          <td className="p-4 text-sm text-muted-foreground">
                            {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                          </td>
                        )}
                        {selectedColumns.vehicleCount && (
                          <td className="p-4 text-sm">{user.vehicleCount}</td>
                        )}
                        {selectedColumns.subscription && (
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {user.hasActiveSubscription ? (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              ) : null}
                              <span className="text-sm">
                                {user.hasActiveSubscription ? (user.subscriptionPlan || 'Premium') : 'Free'}
                              </span>
                            </div>
                          </td>
                        )}
                        {selectedColumns.joinedDate && (
                          <td className="p-4 text-sm text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={Object.values(selectedColumns).filter(Boolean).length} className="p-8 text-center text-muted-foreground">
                        No users found matching the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2">Loading...</span>
        </div>
      )}
    </div>
  )
}
