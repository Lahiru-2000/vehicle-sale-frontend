'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/contexts/PermissionsContext'
import { 
  Car, 
  Users, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Plus, 
  Filter, 
  Search,
  Loader2,
  AlertTriangle,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Clock,
  Crown,
  HardDrive
} from 'lucide-react'
import { Vehicle } from '@/types'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface AdminStats {
  totalVehicles: number
  pendingVehicles: number
  approvedVehicles: number
  rejectedVehicles: number
  totalUsers: number
  blockedUsers: number
  totalRevenue: number
  monthlyRevenue: number
  monthlyGrowth: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { canAccess, canEdit, canDelete } = usePermissions()
  const [stats, setStats] = useState<AdminStats>({
    totalVehicles: 0,
    pendingVehicles: 0,
    approvedVehicles: 0,
    rejectedVehicles: 0,
    totalUsers: 0,
    blockedUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0
  })
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicles, setSelectedVehicles] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    condition: 'all',
    fuelType: 'all',
    transmission: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    // Wait for auth to be loaded
    if (isLoading) return



    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/dashboard')
      toast.error('Access denied. Admin privileges required.')
      return
    }
    // Fetch data for all admin users
    fetchStats()
    fetchVehicles()
  }, [user, isLoading, router])

  // Refetch vehicles when filters, search, or pagination changes
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchVehicles()
    }
  }, [searchQuery, filters, currentPage, rowsPerPage])

  const fetchStats = async () => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/stats')

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const { apiFetch } = await import('@/lib/api-client')
      
      // Build query parameters
      const queryParams = new URLSearchParams()
      if (searchQuery) queryParams.append('search', searchQuery)
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status)
      if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type)
      if (filters.fuelType && filters.fuelType !== 'all') queryParams.append('fuelType', filters.fuelType)
      if (filters.transmission && filters.transmission !== 'all') queryParams.append('transmission', filters.transmission)
      queryParams.append('page', currentPage.toString())
      queryParams.append('limit', rowsPerPage.toString())
      
      const queryString = queryParams.toString()
      const endpoint = `admin/vehicles/table${queryString ? `?${queryString}` : ''}`
      
      const response = await apiFetch(endpoint)

      if (response.ok) {
        const data = await response.json()
        // New endpoint returns { vehicles: [], pagination: {} }
        setVehicles(data.vehicles || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to load vehicles')
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleViewVehicle = (vehicleId: number) => {
    router.push(`/admin/vehicles/${vehicleId}`)
  }



  const handleApproveVehicle = async (vehicleId: number) => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicles/${vehicleId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        toast.success('Vehicle approved successfully')
        fetchVehicles()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to approve vehicle')
      }
    } catch (error) {
      console.error('Error approving vehicle:', error)
      toast.error('Failed to approve vehicle')
    }
  }

  const handleRejectVehicle = async (vehicleId: number) => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicles/${vehicleId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        toast.success('Vehicle rejected successfully')
        fetchVehicles()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to reject vehicle')
      }
    } catch (error) {
      console.error('Error rejecting vehicle:', error)
      toast.error('Failed to reject vehicle')
    }
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
      return
    }

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/vehicles/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([vehicleId.toString()])
      })

      if (response.ok) {
        toast.success('Vehicle deleted successfully')
        fetchVehicles()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete vehicle')
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Failed to delete vehicle')
    }
  }

  const handleBulkApprove = async () => {
    if (selectedVehicles.size === 0) {
      toast.error('Please select vehicles to approve')
      return
    }

    if (!confirm(`Are you sure you want to approve ${selectedVehicles.size} vehicles?`)) {
      return
    }

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/vehicles/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Array.from(selectedVehicles).map(id => id.toString()))
      })

      if (response.ok) {
        toast.success(`${selectedVehicles.size} vehicles approved successfully`)
        setSelectedVehicles(new Set())
        fetchVehicles()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to approve vehicles')
      }
    } catch (error) {
      console.error('Error bulk approving vehicles:', error)
      toast.error('Failed to approve vehicles')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedVehicles.size === 0) {
      toast.error('Please select vehicles to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedVehicles.size} vehicles? This action cannot be undone.`)) {
      return
    }

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/vehicles/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Array.from(selectedVehicles).map(id => id.toString()))
      })

      if (response.ok) {
        toast.success(`${selectedVehicles.size} vehicles deleted successfully`)
        setSelectedVehicles(new Set())
        fetchVehicles()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete vehicles')
      }
    } catch (error) {
      console.error('Error bulk deleting vehicles:', error)
      toast.error('Failed to delete vehicles')
    }
  }

  const toggleVehicleSelection = (vehicleId: number) => {
    const newSelection = new Set(selectedVehicles)
    if (newSelection.has(vehicleId)) {
      newSelection.delete(vehicleId)
    } else {
      newSelection.add(vehicleId)
    }
    setSelectedVehicles(newSelection)
  }

  const toggleSelectAll = () => {
    const currentPageIds = paginatedVehicles.map(v => v.id)
    const allCurrentPageSelected = currentPageIds.every(id => selectedVehicles.has(id))
    
    if (allCurrentPageSelected) {
      // Deselect all on current page
      const newSelection = new Set(selectedVehicles)
      currentPageIds.forEach(id => newSelection.delete(id))
      setSelectedVehicles(newSelection)
    } else {
      // Select all on current page
      const newSelection = new Set(selectedVehicles)
      currentPageIds.forEach(id => newSelection.add(id))
      setSelectedVehicles(newSelection)
    }
  }

  // Filter vehicles based on current filters and search
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesStatus = filters.status === 'all' || vehicle.status === filters.status
    const matchesType = filters.type === 'all' || vehicle.type === filters.type
    const matchesFuelType = filters.fuelType === 'all' || vehicle.fuelType === filters.fuelType
    const matchesTransmission = filters.transmission === 'all' || vehicle.transmission === filters.transmission
    const matchesSearch = searchQuery === '' || 
      vehicle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesType && matchesFuelType && matchesTransmission && matchesSearch
  })

  // Pagination calculations
  const totalItems = filteredVehicles.length
  const totalPages = Math.ceil(totalItems / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  // Show access denied if not admin or super admin
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">Admin privileges required to access this page.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {user?.role === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="text-muted-foreground mb-2">
            Welcome back, <span className="font-medium">{user?.name}</span>! Manage vehicles, users, and system settings
          </p>
          <div className="flex items-center space-x-2">
            {user?.role === 'superadmin' && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                <Crown className="h-3 w-3" />
                <span>Super Admin</span>
              </div>
            )}
            {user?.role === 'admin' && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                <Shield className="h-3 w-3" />
                <span>Admin</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          {/* <Link
            href="/admin/add-vehicle"
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Vehicle</span>
          </Link> */}
          

        </div>
      </div>

      {/* Enhanced Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
              </div>
              <Car className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingVehicles}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(stats.monthlyRevenue || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
        </div>
      )}




      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* SUPER ADMIN EXCLUSIVE FEATURES */}
        {user?.role === 'superadmin' && (
          <>
            <Link
          href="/admin/users/add"
          className="bg-card p-4 rounded-lg border hover:border-primary transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Add User</p>
              <p className="text-sm text-muted-foreground">Create new user account</p>
            </div>
          </div>
        </Link>


            <Link
              href="/admin/add-vehicle"
              className="bg-card p-4 rounded-lg border hover:border-primary transition-colors"
            >
              <div className="flex items-center space-x-3">
                <HardDrive className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium">Add Vehicle</p>
                  <p className="text-sm text-muted-foreground">Add a Vehicle</p>
                </div>
              </div>
            </Link>
            
            <Link
              href="/admin/permissions"
              className="bg-card p-4 rounded-lg border hover:border-primary transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-medium">Manage Permissions</p>
                  <p className="text-sm text-muted-foreground">Control admin access</p>
                </div>
              </div>
            </Link>
            
            <Link
              href="/admin/settings"
              className="bg-card p-4 rounded-lg border hover:border-primary transition-colors"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Settings</p>
                  <p className="text-sm text-muted-foreground">Configure system</p>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedVehicles.size > 0 && (
            <div className="flex gap-2">
              {/* Bulk Approve - only if can edit */}
              {canEdit('vehicle_management') && (
                <button
                  onClick={handleBulkApprove}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve ({selectedVehicles.size})</span>
                </button>
              )}
              
              {/* Bulk Delete - only if can delete */}
              {canDelete('vehicle_management') && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete ({selectedVehicles.size})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Vehicle Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Fuel Type Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Fuel Type</label>
              <select
                value={filters.fuelType}
                onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Fuel Types</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Transmission Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Transmission</label>
              <select
                value={filters.transmission}
                onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Transmissions</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
                <option value="cvt">CVT</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  status: 'all',
                  type: 'all',
                  condition: 'all',
                  fuelType: 'all',
                  transmission: 'all'
                })}
                className="w-full px-3 py-2 border rounded-lg hover:bg-accent transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vehicles Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading vehicles...</span>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No vehicles found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={paginatedVehicles.length > 0 && paginatedVehicles.every(v => selectedVehicles.has(v.id))}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </th>
                  <th className="text-left p-4 font-medium">Vehicle</th>
                  <th className="text-left p-4 font-medium">Owner</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Posted</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.has(vehicle.id)}
                        onChange={() => toggleVehicleSelection(vehicle.id)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{vehicle.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {vehicle.brand} {vehicle.model} • {vehicle.year}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{vehicle.user?.name || 'Unknown'}</div>
                        <div className="text-muted-foreground">{vehicle.user?.email || 'No email'}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize">{vehicle.type}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{formatPrice(vehicle.price || 0)}</span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${vehicle.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${vehicle.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {/* View Details Button - always visible */}
                        <button
                          onClick={() => handleViewVehicle(vehicle.id)}
                          className="flex items-center justify-center p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        
                        {/* Approval Actions - only if can edit and vehicle is pending */}
                        {canEdit('vehicle_management') && vehicle.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveVehicle(vehicle.id)}
                              className="flex items-center justify-center p-2 bg-green-600 text-white rounded hover:bg-green-700"
                              title="Approve"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                            
                            <button
                              onClick={() => handleRejectVehicle(vehicle.id)}
                              className="flex items-center justify-center p-2 bg-red-600 text-white rounded hover:bg-red-700"
                              title="Reject"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        
                        {/* Delete Button - only if can delete */}
                        {canDelete('vehicle_management') && (
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="flex items-center justify-center p-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalItems > 0 && (
        <div className="bg-card border border-t-0 rounded-b-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Results Summary & Rows per Page */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} vehicles
                {selectedVehicles.size > 0 && ` • ${selectedVehicles.size} selected`}
              </div>
              
              {/* Rows per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-muted-foreground">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State for No Results */}
      {totalItems === 0 && !loading && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          No vehicles match your current filters
        </div>
      )}
    </div>
  )
}
