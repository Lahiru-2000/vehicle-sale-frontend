'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/contexts/PermissionsContext'
import { 
  Car, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

import { Vehicle } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function AdminVehiclesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { canAccess, canEdit, canDelete } = usePermissions()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    fuelType: 'all',
    transmission: 'all',
    priceRange: 'all',
    yearRange: 'all',
    premium: 'all'
  })
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/dashboard')
      toast.error('Access denied. Admin privileges required.')
      return
    }

    // Check if user has permission to access vehicle management
    if (!canAccess('vehicle_management')) {
      router.push('/admin')
      toast.error('Access denied. You do not have permission to manage vehicles.')
      return
    }



    fetchVehicles()
  }, [user, router, canAccess, canEdit, canDelete])

  // Refetch vehicles when filters, search, or pagination changes
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin') && canAccess('vehicle_management')) {
      fetchVehicles()
    }
  }, [searchQuery, filters, currentPage, rowsPerPage])

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
        console.error('Failed to load vehicles:', response.status, errorData)
        toast.error(errorData.error || errorData.details || 'Failed to load vehicles')
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to load vehicles. Please check if the .NET backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveVehicle = async (vehicleId: number) => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicles/${vehicleId}/approve`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Vehicle approved successfully')
        await fetchVehicles()
      } else {
        const errorData = await response.json().catch(() => ({}))
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
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Vehicle rejected successfully')
        await fetchVehicles()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to reject vehicle')
      }
    } catch (error) {
      console.error('Error rejecting vehicle:', error)
      toast.error('Failed to reject vehicle')
    }
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return
    }

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicles/${vehicleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Vehicle deleted successfully')
        // Refresh the vehicle list to update the table and statistics
        await fetchVehicles()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to delete vehicle')
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Failed to delete vehicle')
    }
  }

  const handleViewVehicle = (vehicleId: number) => {
    router.push(`/admin/vehicles/${vehicleId}`)
  }

  const handleEditVehicle = (vehicleId: number) => {
    router.push(`/admin/vehicles/${vehicleId}/edit`)
  }

  // Filter vehicles based on current filters and search
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesStatus = filters.status === 'all' || vehicle.status === filters.status
    const matchesType = filters.type === 'all' || vehicle.type === filters.type
    const matchesFuelType = filters.fuelType === 'all' || vehicle.fuelType === filters.fuelType
    const matchesTransmission = filters.transmission === 'all' || vehicle.transmission === filters.transmission
    const matchesPremium = filters.premium === 'all' || 
      (filters.premium === 'premium' && vehicle.isPremium) ||
      (filters.premium === 'regular' && !vehicle.isPremium)
    const matchesSearch = searchQuery === '' || 
      vehicle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesType && matchesFuelType && matchesTransmission && matchesPremium && matchesSearch
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
  
  // Adjust page if current page is out of bounds after vehicles list changes
  useEffect(() => {
    const filtered = vehicles.filter(vehicle => {
      const matchesStatus = filters.status === 'all' || vehicle.status === filters.status
      const matchesType = filters.type === 'all' || vehicle.type === filters.type
      const matchesFuelType = filters.fuelType === 'all' || vehicle.fuelType === filters.fuelType
      const matchesTransmission = filters.transmission === 'all' || vehicle.transmission === filters.transmission
      const matchesPremium = filters.premium === 'all' || 
        (filters.premium === 'premium' && vehicle.isPremium) ||
        (filters.premium === 'regular' && !vehicle.isPremium)
      const matchesSearch = !searchQuery || 
        vehicle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesType && matchesFuelType && matchesTransmission && matchesPremium && matchesSearch
    })
    const totalItems = filtered.length
    const maxPage = Math.ceil(totalItems / rowsPerPage) || 1
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage)
    }
  }, [vehicles.length, rowsPerPage, filters, searchQuery, currentPage])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Car className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">All Vehicles</h1>
            <p className="text-muted-foreground">Manage and monitor all vehicle listings</p>
          </div>
        </div>
        <Link
          href="/admin/add-vehicle"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
              <p className="text-2xl font-bold">{vehicles.length}</p>
            </div>
            <Car className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Premium</p>
              <p className="text-2xl font-bold text-yellow-600">{vehicles.filter(v => v.isPremium).length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600">{vehicles.filter(v => v.status === 'pending').length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.status === 'approved').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{vehicles.filter(v => v.status === 'rejected').length}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
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

          <button className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Premium Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Premium Status</label>
              <select
                value={filters.premium}
                onChange={(e) => setFilters(prev => ({ ...prev, premium: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Vehicles</option>
                <option value="premium">Premium Only</option>
                <option value="regular">Regular Only</option>
              </select>
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
                  <th className="text-left p-4 font-medium">Vehicle</th>
                  <th className="text-left p-4 font-medium">Owner</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Premium</th>
                  <th className="text-left p-4 font-medium">Posted</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-muted/50">
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
                      <span className="font-medium">{formatPrice(vehicle.price)}</span>
                    </td>
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${vehicle.isPremium ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}
                      `}>
                        {vehicle.isPremium ? 'Premium' : 'Regular'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(vehicle.createdAt).toLocaleDateString()}
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
                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewVehicle(vehicle.id)}
                          className="flex items-center justify-center p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        
                        {/* Edit Button - only if can edit */}
                        {canEdit('vehicle_management') && (
                          <button
                            onClick={() => handleEditVehicle(vehicle.id)}
                            className="flex items-center justify-center p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                        
                        {/* Status-specific actions - only if can edit */}
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
