'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import VehicleCard from '@/components/VehicleCard'
import { 
  Search, 
  SlidersHorizontal,
  X,
  MapPin,
  Calendar,
  DollarSign,
  Fuel,
  Settings,
  Car,
  Bike,
  Truck,
  Zap,
  RefreshCw,
  Grid3X3,
  List,
  ArrowUpDown
} from 'lucide-react'
import { Vehicle } from '@/types'
import toast from 'react-hot-toast'

interface AdvancedFilterState {
  searchQuery: string
  type: string
  priceRange: {
    min: string
    max: string
  }
  yearRange: {
    min: string
    max: string
  }
  mileageRange: {
    min: string
    max: string
  }
  fuelType: string
  transmission: string
  location: string
  brand: string
  condition: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const [filters, setFilters] = useState<AdvancedFilterState>({
    searchQuery: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    priceRange: { 
      min: searchParams.get('minPrice') || '', 
      max: searchParams.get('maxPrice') || '' 
    },
    yearRange: { 
      min: searchParams.get('minYear') || '', 
      max: searchParams.get('maxYear') || '' 
    },
    mileageRange: { 
      min: searchParams.get('minMileage') || '', 
      max: searchParams.get('maxMileage') || '' 
    },
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    location: searchParams.get('location') || '',
    brand: searchParams.get('brand') || '',
    condition: searchParams.get('condition') || '',
    sortBy: searchParams.get('sortBy') || 'approvedAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  })

  const [brands] = useState([
    'Toyota', 'Honda', 'Nissan', 'Suzuki', 'Mitsubishi', 'Mazda', 
    'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Hyundai', 
    'Kia', 'Tata', 'Bajaj', 'TVS', 'Hero', 'Yamaha', 'Other'
  ])

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    applyFilters()
    updateURL()
  }, [vehicles, filters])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('vehicles?status=approved')
      
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      } else {
        toast.error('Failed to load vehicles')
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = useCallback(() => {
    let filtered = [...vehicles]

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(vehicle =>
        vehicle.title.toLowerCase().includes(query) ||
        vehicle.brand.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.description.toLowerCase().includes(query)
      )
    }


    if (filters.type) {
      filtered = filtered.filter(vehicle => vehicle.type === filters.type)
    }

    if (filters.brand) {
      filtered = filtered.filter(vehicle => 
        vehicle.brand.toLowerCase() === filters.brand.toLowerCase()
      )
    }

    if (filters.priceRange.min) {
      filtered = filtered.filter(vehicle => vehicle.price >= parseFloat(filters.priceRange.min))
    }
    if (filters.priceRange.max) {
      filtered = filtered.filter(vehicle => vehicle.price <= parseFloat(filters.priceRange.max))
    }

    if (filters.yearRange.min) {
      filtered = filtered.filter(vehicle => vehicle.year >= parseInt(filters.yearRange.min))
    }
    if (filters.yearRange.max) {
      filtered = filtered.filter(vehicle => vehicle.year <= parseInt(filters.yearRange.max))
    }

    if (filters.mileageRange.min) {
      filtered = filtered.filter(vehicle => vehicle.mileage >= parseFloat(filters.mileageRange.min))
    }
    if (filters.mileageRange.max) {
      filtered = filtered.filter(vehicle => vehicle.mileage <= parseFloat(filters.mileageRange.max))
    }

    // Fuel type filter
    if (filters.fuelType) {
      filtered = filtered.filter(vehicle => vehicle.fuelType === filters.fuelType)
    }

    // Transmission filter
    if (filters.transmission) {
      filtered = filtered.filter(vehicle => vehicle.transmission === filters.transmission)
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(vehicle => 
        vehicle.contactInfo?.location?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Condition filter
    if (filters.condition) {
      if (filters.condition === 'new') {
        const currentYear = new Date().getFullYear()
        filtered = filtered.filter(vehicle => vehicle.year >= currentYear - 1)
      } else if (filters.condition === 'used') {
        const currentYear = new Date().getFullYear()
        filtered = filtered.filter(vehicle => vehicle.year < currentYear - 1)
      }
    }

    // Sorting - Always prioritize premium vehicles first, then apply user's sort preference
    filtered.sort((a, b) => {
      // First, sort by premium status (premium vehicles first)
      if (a.isPremium && !b.isPremium) return -1
      if (!a.isPremium && b.isPremium) return 1
      
      // For both premium and regular vehicles, apply the user's sort preference
      let aValue: any = a[filters.sortBy as keyof Vehicle]
      let bValue: any = b[filters.sortBy as keyof Vehicle]

      if (filters.sortBy === 'createdAt') {
        aValue = new Date(a.createdAt || 0).getTime()
        bValue = new Date(b.createdAt || 0).getTime()
      } else if (filters.sortBy === 'approvedAt') {
        // Use approvedAt if available, otherwise fall back to createdAt
        aValue = a.approvedAt ? new Date(a.approvedAt).getTime() : new Date(a.createdAt || 0).getTime()
        bValue = b.approvedAt ? new Date(b.approvedAt).getTime() : new Date(b.createdAt || 0).getTime()
      } else if (filters.sortBy === 'isPremium') {
        aValue = a.isPremium ? 1 : 0
        bValue = b.isPremium ? 1 : 0
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredVehicles(filtered)
  }, [vehicles, filters])

  const updateURL = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'priceRange' || key === 'yearRange' || key === 'mileageRange') {
        const range = value as { min: string; max: string }
        if (range.min) params.set(`min${key.replace('Range', '').charAt(0).toUpperCase() + key.replace('Range', '').slice(1)}`, range.min)
        if (range.max) params.set(`max${key.replace('Range', '').charAt(0).toUpperCase() + key.replace('Range', '').slice(1)}`, range.max)
      } else if (value) {
        params.set(key, value as string)
      }
    })

    const newURL = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newURL, { scroll: false })
  }

  const handleFilterChange = (field: keyof AdvancedFilterState, value: any) => {
    if (field === 'priceRange' || field === 'yearRange' || field === 'mileageRange') {
      setFilters(prev => ({
        ...prev,
        [field]: { ...prev[field], ...value }
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const clearFilters = () => {
    const clearedFilters: AdvancedFilterState = {
      searchQuery: '',
      type: '',
      priceRange: { min: '', max: '' },
      yearRange: { min: '', max: '' },
      mileageRange: { min: '', max: '' },
      fuelType: '',
      transmission: '',
      location: '',
      brand: '',
      condition: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
  }

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'sortBy' && value === 'createdAt') return false
      if (key === 'sortOrder' && value === 'desc') return false
      if (typeof value === 'object') {
        return Object.values(value).some(v => v !== '')
      }
      return value !== ''
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'sortBy' || key === 'sortOrder') return
      if (typeof value === 'object') {
        if (Object.values(value).some(v => v !== '')) count++
      } else if (value !== '') {
        count++
      }
    })
    return count
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Search Vehicles</h1>
          <p className="text-lg text-muted-foreground">
            Find your perfect vehicle with our advanced search and filtering options
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by brand, model, description..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-lg rounded-lg border-2 border-primary/20 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 bg-background"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => handleFilterChange('type', filters.type === 'car' ? '' : 'car')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filters.type === 'car' 
                  ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200' 
                  : 'border-border hover:bg-muted'
              }`}
            >
              <Car className="h-4 w-4 inline mr-2" />
              Cars
            </button>
            <button
              onClick={() => handleFilterChange('type', filters.type === 'bike' ? '' : 'bike')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filters.type === 'bike' 
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200' 
                  : 'border-border hover:bg-muted'
              }`}
            >
              <Bike className="h-4 w-4 inline mr-2" />
              Bikes
            </button>
            <button
              onClick={() => handleFilterChange('type', filters.type === 'truck' ? '' : 'truck')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filters.type === 'truck' 
                  ? 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200' 
                  : 'border-border hover:bg-muted'
              }`}
            >
              <Truck className="h-4 w-4 inline mr-2" />
              Trucks
            </button>
            <button
              onClick={() => handleFilterChange('type', filters.type === 'van' ? '' : 'van')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filters.type === 'van' 
                  ? 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-200' 
                  : 'border-border hover:bg-muted'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              Vans
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6">
          {/* Mobile Layout - 2 Rows */}
          <div className="flex flex-col space-y-4 md:hidden">
            {/* Row 1: Sort Only (View Mode Hidden on Mobile) */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    handleFilterChange('sortBy', sortBy)
                    handleFilterChange('sortOrder', sortOrder)
                  }}
                  className="px-3 py-2 border rounded-lg bg-background text-sm"
                >
                  <option value="approvedAt-desc">Newest Approved</option>
                  <option value="isPremium-desc">Premium First</option>
                  <option value="createdAt-desc">Newest Created</option>
                  <option value="createdAt-asc">Oldest Created</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="year-desc">Year: Newest First</option>
                  <option value="year-asc">Year: Oldest First</option>
                  <option value="mileage-asc">Mileage: Low to High (km)</option>
                  <option value="mileage-desc">Mileage: High to Low (km)</option>
                </select>
              </div>

              {/* View Mode Toggle Hidden on Mobile */}
              {/* Grid/List toggle removed from mobile layout */}
            </div>

            {/* Row 2: Advanced Filters */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Advanced Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Layout - Single Row */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Advanced Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    handleFilterChange('sortBy', sortBy)
                    handleFilterChange('sortOrder', sortOrder)
                  }}
                  className="px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="approvedAt-desc">Newest Approved</option>
                  <option value="isPremium-desc">Premium First</option>
                  <option value="createdAt-desc">Newest Created</option>
                  <option value="createdAt-asc">Oldest Created</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="year-desc">Year: Newest First</option>
                  <option value="year-asc">Year: Oldest First</option>
                  <option value="mileage-asc">Mileage: Low to High (km)</option>
                  <option value="mileage-desc">Mileage: High to Low (km)</option>
                </select>
              </div>

              <div className="flex border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-8 p-6 bg-muted/30 rounded-xl border">
            <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => handleFilterChange('priceRange', { min: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => handleFilterChange('priceRange', { max: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Year Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Year Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={filters.yearRange.min}
                    onChange={(e) => handleFilterChange('yearRange', { min: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={filters.yearRange.max}
                    onChange={(e) => handleFilterChange('yearRange', { max: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              {/* Mileage Range */}
              <div>
                              <label className="block text-sm font-medium mb-2">
                <Settings className="h-4 w-4 inline mr-1" />
                Mileage Range (km)
              </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.mileageRange.min}
                    onChange={(e) => handleFilterChange('mileageRange', { min: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.mileageRange.max}
                    onChange={(e) => handleFilterChange('mileageRange', { max: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Fuel className="h-4 w-4 inline mr-1" />
                  Fuel Type
                </label>
                <select
                  value={filters.fuelType}
                  onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">All Fuel Types</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Settings className="h-4 w-4 inline mr-1" />
                  Transmission
                </label>
                <select
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">All Transmissions</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="cvt">CVT</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New/Like New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading vehicles...</span>
                </div>
              ) : (
                `${filteredVehicles.length} vehicle${filteredVehicles.length !== 1 ? 's' : ''} found`
              )}
            </h2>
            {hasActiveFilters() && !loading && (
              <div className="text-sm text-muted-foreground">
                Showing filtered results
              </div>
            )}
          </div>
        </div>

        {/* Vehicles Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Searching for vehicles...</p>
            </div>
          </div>
        ) : filteredVehicles.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                showActions={false}
                variant={viewMode}
                fromSection="search"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">No vehicles found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {hasActiveFilters() 
                ? 'Try adjusting your search criteria or filters to find more vehicles'
                : vehicles.length === 0 
                  ? 'No vehicles are currently available. If you are an admin, you can add vehicles through the admin panel.'
                  : 'Start searching to find vehicles that match your preferences'
              }
            </p>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            )}
            {vehicles.length === 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  To test the search functionality, you can add some test vehicles to the database.
                </p>
                <button
                  onClick={() => window.open('/admin/vehicles', '_blank')}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                >
                  Go to Admin Panel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
