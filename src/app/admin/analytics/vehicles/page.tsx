'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Car, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Download, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  DollarSign,
  Tag,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Star
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Vehicle {
  id: number
  title: string
  brand: string
  model: string
  type: string
  year: number
  price: number
  status: string
  createdAt: string
  updatedAt: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  favoritesCount: number
}

interface RecentActivity {
  activityType: string
  description: string
  userName: string
  userEmail: string
  userPhone: string
  status: string
  activityDate: string
}

interface Analytics {
  newVehiclesThisWeek: number
  newVehiclesThisMonth: number
  newVehiclesToday: number
  approvedThisWeek: number
  pendingVehicles: number
  avgPrice: number
  uniqueBrands: number
  uniqueTypes: number
}

interface StatusDistribution {
  status: string
  count: number
  percentage: number
}

interface BrandDistribution {
  brand: string
  count: number
  percentage: number
}

interface TypeDistribution {
  type: string
  count: number
  percentage: number
}

interface PriceRangeDistribution {
  priceRange: string
  count: number
  percentage: number
}

export default function VehicleAnalyticsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([])
  const [brandDistribution, setBrandDistribution] = useState<BrandDistribution[]>([])
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([])
  const [priceRangeDistribution, setPriceRangeDistribution] = useState<PriceRangeDistribution[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'activities' | 'reports'>('overview')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Report filters
  const [reportFilters, setReportFilters] = useState({
    status: 'all',
    brand: 'all',
    type: 'all',
    priceMin: '',
    priceMax: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showReportFilters, setShowReportFilters] = useState(false)
  const [reportData, setReportData] = useState<Vehicle[]>([])
  const [loadingReport, setLoadingReport] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState({
    title: true,
    brand: true,
    type: true,
    year: true,
    price: true,
    status: true,
    ownerName: true,
    favoritesCount: true,
    createdAt: true
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

    fetchVehicleData()
  }, [user, isLoading, router, currentPage])

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReportData()
    }
  }, [activeTab, reportFilters])

  const fetchVehicleData = async () => {
    setLoading(true)
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicle-analytics?page=${currentPage}&limit=10`)

      if (response.ok) {
        try {
          const data = await response.json()
          console.log('Vehicle analytics data received:', data)
          setVehicles(data.vehicles || [])
          setRecentActivities(data.recentActivities || [])
          setAnalytics(data.analytics || null)
          setStatusDistribution(data.statusDistribution || [])
          setBrandDistribution(data.brandDistribution || [])
          setTypeDistribution(data.typeDistribution || [])
          setPriceRangeDistribution(data.priceRangeDistribution || [])
          setStatistics(data.statistics || null)
        } catch (jsonError) {
          console.error('Error parsing vehicle analytics response:', jsonError)
          toast.error('Failed to parse vehicle analytics data')
        }
      } else {
        try {
          const errorData = await response.json()
          console.error('Vehicle analytics error:', errorData)
          toast.error(errorData.error || 'Failed to fetch vehicle data')
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError)
          toast.error('Failed to fetch vehicle data')
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle data:', error)
      toast.error('Failed to fetch vehicle data')
    } finally {
      setLoading(false)
    }
  }

  const fetchReportData = async () => {
    setLoadingReport(true)
    try {
      const params = new URLSearchParams({
        ...reportFilters,
        export: 'true'
      })

      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicle-analytics?${params}`)

      if (response.ok) {
        const data = await response.json()
        setReportData(data.vehicles || [])
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
    const filteredData = reportData.map(vehicle => {
      const row: any = {}
      if (selectedColumns.title) row['Title'] = vehicle.title
      if (selectedColumns.brand) row['Brand'] = vehicle.brand
      if (selectedColumns.type) row['Type'] = vehicle.type
      if (selectedColumns.year) row['Year'] = vehicle.year
      if (selectedColumns.price) row['Price'] = vehicle.price
      if (selectedColumns.status) row['Status'] = vehicle.status
      if (selectedColumns.ownerName) row['Owner'] = vehicle.ownerName
      if (selectedColumns.favoritesCount) row['Favorites'] = vehicle.favoritesCount
      if (selectedColumns.createdAt) row['Created Date'] = formatDate(vehicle.createdAt)
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
    link.setAttribute('download', `vehicle-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Report exported successfully with ${filteredData.length} vehicles`)
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
      brand: 'all',
      type: 'all',
      priceMin: '',
      priceMax: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'vehicle_posted':
        return <Car className="h-4 w-4 text-blue-500" />
      case 'vehicle_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading vehicle analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Analytics</h1>
          <p className="text-muted-foreground">Comprehensive vehicle data and analytics</p>
        </div>
        {/* <button
          onClick={exportReport}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'vehicles'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Car className="h-4 w-4" />
          <span>Vehicles</span>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                  <p className="text-2xl font-bold">{statistics.totalVehicles}</p>
                  <p className="text-sm text-green-600">{statistics.approvedVehicles || 0} approved</p>
                </div>
                <Car className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pendingVehicles}</p>
                  <p className="text-sm text-muted-foreground">{statistics.totalVehicles > 0 ? Math.round((statistics.pendingVehicles / statistics.totalVehicles) * 100) : 0}% of total</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.rejectedVehicles}</p>
                  <p className="text-sm text-muted-foreground">{statistics.totalVehicles > 0 ? Math.round((statistics.rejectedVehicles / statistics.totalVehicles) * 100) : 0}% of total</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Price</p>
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(statistics.avgPrice || 0)}</p>
                  <p className="text-sm text-muted-foreground">Range: {formatPrice(statistics.minPrice || 0)} - {formatPrice(statistics.maxPrice || 0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Analytics Data */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New Today</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.newVehiclesToday}</p>
                  </div>
                  <Car className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New This Week</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.newVehiclesThisWeek}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                    <p className="text-2xl font-bold text-purple-600">{analytics.newVehiclesThisMonth}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved This Week</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics.approvedThisWeek}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
          )}

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
              <div className="space-y-3">
                {statusDistribution && statusDistribution.length > 0 ? (
                  statusDistribution.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status.status)}
                        <span className="text-sm font-medium capitalize">{status.status}</span>
                      </div>
                      <span className="font-semibold">{status.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No status data available</p>
                )}
              </div>
            </div>

            {/* Brand Distribution */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Top Brands</h3>
              <div className="space-y-3">
                {brandDistribution && brandDistribution.length > 0 ? (
                  brandDistribution.slice(0, 5).map((brand, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{brand.brand}</span>
                      </div>
                      <span className="font-semibold">{brand.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No brand data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Type and Price Range Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Type Distribution */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Vehicle Types</h3>
              <div className="space-y-3">
                {typeDistribution && typeDistribution.length > 0 ? (
                  typeDistribution.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium capitalize">{type.type}</span>
                      </div>
                      <span className="font-semibold">{type.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No type data available</p>
                )}
              </div>
            </div>

            {/* Price Range Distribution */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Price Ranges</h3>
              <div className="space-y-3">
                {priceRangeDistribution && priceRangeDistribution.length > 0 ? (
                  priceRangeDistribution.map((range, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{range.priceRange}</span>
                      </div>
                      <span className="font-semibold">{range.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No price range data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div>
          {/* Search and Filters */}
          <div className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
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

          {/* Vehicle Table */}
          <div className="bg-card rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Vehicle</th>
                    <th className="text-left p-4 font-medium">Owner</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Favorites</th>
                    <th className="text-left p-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2">Loading vehicles...</span>
                        </div>
                      </td>
                    </tr>
                  ) : vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{vehicle.title}</div>
                            <div className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
                            <div className="text-sm text-muted-foreground capitalize">{vehicle.type}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{vehicle.ownerName}</div>
                            <div className="text-sm text-muted-foreground">{vehicle.ownerEmail}</div>
                            <div className="text-sm text-muted-foreground">{vehicle.ownerPhone}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{formatPrice(vehicle.price)}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(vehicle.status)}
                            <span className="capitalize">{vehicle.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{vehicle.favoritesCount}</td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(vehicle.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No vehicles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div>
          <div className="bg-card rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Recent Vehicle Activities</h3>
              <p className="text-sm text-muted-foreground">Latest vehicle-related activities</p>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading activities...</span>
                  </div>
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="p-6 hover:bg-muted/50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{activity.userName}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{activity.userEmail}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{activity.userPhone}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="capitalize">{activity.activityType.replace('_', ' ')}</span>
                          <span>•</span>
                          <span className="capitalize">Status: {activity.status}</span>
                          <span>•</span>
                          <span>{formatDate(activity.activityDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No recent activities found
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
                <h3 className="text-lg font-semibold">Vehicle Reports</h3>
                <span className="text-sm text-muted-foreground">
                  {reportData.length} vehicles found
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
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <select
                    value={reportFilters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Brands</option>
                    {brandDistribution.map((brand) => (
                      <option key={brand.brand} value={brand.brand}>{brand.brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={reportFilters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Types</option>
                    {typeDistribution.map((type) => (
                      <option key={type.type} value={type.type}>{type.type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price Min</label>
                  <input
                    type="number"
                    value={reportFilters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price Max</label>
                  <input
                    type="number"
                    value={reportFilters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    placeholder="10000000"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date From</label>
                  <input
                    type="date"
                    value={reportFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date To</label>
                  <input
                    type="date"
                    value={reportFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
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
                    <option value="createdAt">Created Date</option>
                    <option value="price">Price</option>
                    <option value="brand">Brand</option>
                    <option value="type">Type</option>
                    <option value="status">Status</option>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                    {selectedColumns.title && <th className="text-left p-4 font-medium">Title</th>}
                    {selectedColumns.brand && <th className="text-left p-4 font-medium">Brand</th>}
                    {selectedColumns.type && <th className="text-left p-4 font-medium">Type</th>}
                    {selectedColumns.year && <th className="text-left p-4 font-medium">Year</th>}
                    {selectedColumns.price && <th className="text-left p-4 font-medium">Price</th>}
                    {selectedColumns.status && <th className="text-left p-4 font-medium">Status</th>}
                    {selectedColumns.ownerName && <th className="text-left p-4 font-medium">Owner</th>}
                    {selectedColumns.favoritesCount && <th className="text-left p-4 font-medium">Favorites</th>}
                    {selectedColumns.createdAt && <th className="text-left p-4 font-medium">Created</th>}
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
                    reportData.map((vehicle) => (
                      <tr key={vehicle.id} className="border-b hover:bg-muted/50">
                        {selectedColumns.title && (
                          <td className="p-4">
                            <div className="font-medium">{vehicle.title}</div>
                          </td>
                        )}
                        {selectedColumns.brand && (
                          <td className="p-4 text-sm text-muted-foreground">{vehicle.brand}</td>
                        )}
                        {selectedColumns.type && (
                          <td className="p-4 text-sm text-muted-foreground capitalize">{vehicle.type}</td>
                        )}
                        {selectedColumns.year && (
                          <td className="p-4 text-sm">{vehicle.year}</td>
                        )}
                        {selectedColumns.price && (
                          <td className="p-4 text-sm">{formatPrice(vehicle.price)}</td>
                        )}
                        {selectedColumns.status && (
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(vehicle.status)}
                              <span className="capitalize">{vehicle.status}</span>
                            </div>
                          </td>
                        )}
                        {selectedColumns.ownerName && (
                          <td className="p-4 text-sm text-muted-foreground">{vehicle.ownerName}</td>
                        )}
                        {selectedColumns.favoritesCount && (
                          <td className="p-4 text-sm">{vehicle.favoritesCount}</td>
                        )}
                        {selectedColumns.createdAt && (
                          <td className="p-4 text-sm text-muted-foreground">
                            {formatDate(vehicle.createdAt)}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={Object.values(selectedColumns).filter(Boolean).length} className="p-8 text-center text-muted-foreground">
                        No vehicles found matching the current filters
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
