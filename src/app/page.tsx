'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import VehicleCard from '@/components/VehicleCard'
import Link from 'next/link'
import { 
  Search, 
  ArrowRight,
  Star,
  Shield,
  Clock,
  Users,
  Car,
  Bike,
  Truck,
  Zap,
  TrendingUp,
  Heart,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  CheckCircle,
  SlidersHorizontal,
  Filter
} from 'lucide-react'
import { Vehicle } from '@/types'
import toast from 'react-hot-toast'
import { showConfirmDialog, showSuccessDialog, showErrorDialog } from '@/lib/sweetalert'

interface FilterState {
  searchQuery: string
  priceRange: {
    min: string
    max: string
  }
  type: string
  condition: string
  yearRange: {
    min: string
    max: string
  }
  fuelType: string
  transmission: string
  location: string
}

export default function HomePage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({})
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0)
  const [loadingUsersCount, setLoadingUsersCount] = useState<boolean>(true)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    priceRange: { min: '', max: '' },
    type: '',
    condition: '',
    yearRange: { min: '', max: '' },
    fuelType: '',
    transmission: '',
    location: ''
  })

  useEffect(() => {
    fetchVehicles()
    fetchActiveUsersCount()
  }, [])

  useEffect(() => {
    if (user && vehicles.length > 0) {
      fetchFavorites()
    }
  }, [user, vehicles])

  useEffect(() => {
    applyFilters()
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

  const fetchActiveUsersCount = async () => {
    try {
      setLoadingUsersCount(true)
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('stats/users')
      
      if (response.ok) {
        const data = await response.json()
        setActiveUsersCount(data.activeUsersCount || 0)
      } else {
        console.error('Failed to fetch active users count')
        setActiveUsersCount(0)
      }
    } catch (error) {
      console.error('Error fetching active users count:', error)
      setActiveUsersCount(0)
    } finally {
      setLoadingUsersCount(false)
    }
  }

  const fetchFavorites = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      const vehicleIds = vehicles.map(v => v.id).join(',')
      
      if (vehicleIds) {
        const response = await fetch(`/api/favorites/check?vehicleIds=${vehicleIds}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setFavorites(data.favorites || {})
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const handleFavoriteToggle = async (vehicleId: string, isFavorited: boolean) => {
    if (!user) {
      await showErrorDialog('Login Required', 'Please log in to add vehicles to your favorites.')
      return
    }

    if (isFavorited) {
      // Ask for confirmation before removing
      const result = await showConfirmDialog(
        'Remove from Favorites',
        'Are you sure you want to remove this vehicle from your favorites?',
        'Yes, Remove',
        'Cancel'
      )
      if (!result.isConfirmed) return
    }

    try {
      const token = localStorage.getItem('token')
      
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?vehicleId=${vehicleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          setFavorites(prev => ({ ...prev, [vehicleId]: false }))
          await showSuccessDialog('Removed from Favorites', 'This vehicle has been removed from your favorites.')
        } else {
          await showErrorDialog('Error', 'Failed to remove from favorites. Please try again.')
        }
      } else {
        // Add to favorites
        const { apiFetch } = await import('@/lib/api-client')
        const response = await apiFetch('favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ vehicleId })
        })
        
        if (response.ok) {
          setFavorites(prev => ({ ...prev, [vehicleId]: true }))
          await showSuccessDialog('Added to Favorites', 'This vehicle has been added to your favorites!')
        } else {
          const error = await response.json()
          await showErrorDialog('Error', error.error || 'Failed to add to favorites. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      await showErrorDialog('Error', 'Failed to update favorites. Please try again.')
    }
  }

  const applyFilters = () => {
    let filtered = [...vehicles]

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(vehicle =>
        vehicle.title.toLowerCase().includes(query) ||
        vehicle.brand.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.description.toLowerCase().includes(query)
      )
    }

    // Price range filter
    if (filters.priceRange.min) {
      filtered = filtered.filter(vehicle => vehicle.price >= parseFloat(filters.priceRange.min))
    }
    if (filters.priceRange.max) {
      filtered = filtered.filter(vehicle => vehicle.price <= parseFloat(filters.priceRange.max))
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(vehicle => vehicle.type === filters.type)
    }

    // Condition filter (used/new)
    if (filters.condition) {
      // Assuming we have a condition field, for now we'll use year as a proxy
      if (filters.condition === 'new') {
        const currentYear = new Date().getFullYear()
        filtered = filtered.filter(vehicle => vehicle.year >= currentYear - 1)
      } else if (filters.condition === 'used') {
        const currentYear = new Date().getFullYear()
        filtered = filtered.filter(vehicle => vehicle.year < currentYear - 1)
      }
    }

    // Year range filter
    if (filters.yearRange.min) {
      filtered = filtered.filter(vehicle => vehicle.year >= parseInt(filters.yearRange.min))
    }
    if (filters.yearRange.max) {
      filtered = filtered.filter(vehicle => vehicle.year <= parseInt(filters.yearRange.max))
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

    // Sort to maintain premium vehicles first, then by approval date (newest first)
    filtered.sort((a, b) => {
      // First, sort by premium status (premium vehicles first)
      if (a.isPremium && !b.isPremium) return -1
      if (!a.isPremium && b.isPremium) return 1
      
      // For both premium and regular vehicles, sort by approval date (newest first)
      // Use approvedAt if available, otherwise fall back to createdAt
      const dateA = a.approvedAt ? new Date(a.approvedAt).getTime() : new Date(a.createdAt).getTime()
      const dateB = b.approvedAt ? new Date(b.approvedAt).getTime() : new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    // Limit to maximum 8 vehicles on home page
    setFilteredVehicles(filtered.slice(0, 8))
  }

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    if (field === 'priceRange' || field === 'yearRange') {
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
    setFilters({
      searchQuery: '',
      priceRange: { min: '', max: '' },
      type: '',
      condition: '',
      yearRange: { min: '', max: '' },
      fuelType: '',
      transmission: '',
      location: ''
    })
  }

  const hasActiveFilters = () => {
    return (
      filters.searchQuery ||
      filters.priceRange.min ||
      filters.priceRange.max ||
      filters.type ||
      filters.condition ||
      filters.yearRange.min ||
      filters.yearRange.max ||
      filters.fuelType ||
      filters.transmission ||
      filters.location
    )
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.searchQuery) count++
    if (filters.priceRange.min || filters.priceRange.max) count++
    if (filters.type) count++
    if (filters.condition) count++
    if (filters.yearRange.min || filters.yearRange.max) count++
    if (filters.fuelType) count++
    if (filters.transmission) count++
    if (filters.location) count++
    return count
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`
            }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50 sm:bg-black/40" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-primary/30 via-transparent to-secondary/30 sm:from-primary/20 sm:to-secondary/20" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 sm:py-0">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg leading-tight">
              Find Your Perfect Vehicle
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-12 leading-relaxed drop-shadow-md px-4 sm:px-0">
              Browse thousands of quality vehicles from trusted sellers.
              <br className="hidden sm:block" />
              Buy, sell, and discover your next ride with confidence.
            </p>
            
            {/* Find Vehicle Button */}
            <div className="max-w-sm sm:max-w-md mx-auto mb-8 sm:mb-12 px-4 sm:px-0">
              <Link
                href="/search"
                className="group w-full inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold bg-primary text-primary-foreground rounded-xl sm:rounded-2xl hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-primary/25"
              >
                <Search className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                Find Vehicle
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
              
              {/* Secondary CTA */}
              <div className="mt-4 sm:mt-6">
                <Link 
                  href="/search" 
                  className="text-white/80 hover:text-white transition-colors inline-flex items-center space-x-2 text-base sm:text-lg drop-shadow-md"
                >
                  <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Advanced Search & Filters</span>
                </Link>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-sm sm:max-w-lg mx-auto px-4 sm:px-0">
              <div className="text-center">
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{vehicles.length}+</div>
                <div className="text-white/80 font-medium drop-shadow-md text-sm sm:text-base">Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                  {loadingUsersCount ? '...' : `${activeUsersCount.toLocaleString()}+`}
                </div>
                <div className="text-white/80 font-medium drop-shadow-md text-sm sm:text-base">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">5★</div>
                <div className="text-white/80 font-medium drop-shadow-md text-sm sm:text-base">Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator - Hidden on mobile */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Why Choose DRIVEDEAL?</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              We make buying and selling vehicles simple, secure, and reliable
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-xl bg-background shadow-sm border">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Verified Listings</h3>
              <p className="text-muted-foreground text-sm">All vehicles are verified by our team for quality and authenticity</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 rounded-xl bg-background shadow-sm border">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Quick Process</h3>
              <p className="text-muted-foreground text-sm">Find and buy your vehicle in minutes with our streamlined process</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 rounded-xl bg-background shadow-sm border">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Trusted Community</h3>
              <p className="text-muted-foreground text-sm">Join thousands of satisfied buyers and sellers in our community</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 rounded-xl bg-background shadow-sm border">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Best Prices</h3>
              <p className="text-muted-foreground text-sm">Competitive pricing with no hidden fees or extra charges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Browse by Category</h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4 sm:px-0">Find exactly what you're looking for</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link 
              href="/search?type=car"
              className="group p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 block"
            >
              <Car className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">Cars</h3>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-200 mt-1">
                {vehicles.filter(v => v.type === 'car').length} available
              </p>
            </Link>
            
            <Link 
              href="/search?type=bike"
              className="group p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 block"
            >
              <Bike className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-600 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-green-900 dark:text-green-100 text-sm sm:text-base">Bikes</h3>
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-200 mt-1">
                {vehicles.filter(v => v.type === 'bike').length} available
              </p>
            </Link>
            
            <Link 
              href="/search?type=truck"
              className="group p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 block"
            >
              <Truck className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-orange-600 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 text-sm sm:text-base">Trucks</h3>
              <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-200 mt-1">
                {vehicles.filter(v => v.type === 'truck').length} available
              </p>
            </Link>
            
            <Link 
              href="/search?type=van"
              className="group p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 block"
            >
              <Zap className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-600 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 text-sm sm:text-base">Vans</h3>
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-200 mt-1">
                {vehicles.filter(v => v.type === 'van').length} available
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <div className="text-center sm:text-left mb-6 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Featured Vehicles</h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {loading ? 'Loading vehicles...' : `Showing ${filteredVehicles.length} of ${vehicles.length} vehicles`}
              </p>
            </div>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-4 sm:hidden lg:flex lg:justify-end lg:mt-0">
                <Link href="/register" className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-center text-sm sm:text-base">
                  Sell Your Vehicle
                </Link>
                <Link href="/login" className="px-4 sm:px-6 py-2 sm:py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium text-center text-sm sm:text-base">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Vehicles Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading amazing vehicles...</p>
              </div>
            </div>
          ) : filteredVehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    showActions={false}
                    isFavorited={favorites[vehicle.id] || false}
                    fromSection="home"
                    onFavoriteToggle={handleFavoriteToggle}
                    onShare={(vehicle) => {
                      // Optional: Add any additional share handling logic here
                      console.log('Sharing vehicle:', vehicle.title)
                    }}
                  />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link 
                  href="/search"
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium inline-flex items-center space-x-2"
                >
                  <span>View All Vehicles</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Car className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">No vehicles found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {filters.searchQuery || filters.type
                  ? 'Try adjusting your search criteria to find more vehicles'
                  : 'Be the first to list a vehicle on our platform!'
                }
              </p>
              {filters.searchQuery || filters.type ? (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              ) : (
                <Link href="/register" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  List Your Vehicle
                </Link>
              )}
            </div>
          )}
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Sell Your Vehicle?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of successful sellers who reached buyers faster and got better prices
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard" className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                    Get Started Free
                  </Link>
                  <Link href="/login" className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* About Us */}
            <div>
              <h3 className="text-xl font-bold mb-4">About Us</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                DRIVEDEAL is Sri Lanka's leading online marketplace for buying and selling vehicles. 
                We connect buyers and sellers with a trusted, secure platform.
              </p>
              <p className="text-gray-300 text-sm">
                Established 2024 • Trusted by thousands
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/search" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Vehicles
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    Post a Vehicle
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-300 hover:text-white transition-colors">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Popular Searches */}
            <div>
              <h3 className="text-xl font-bold mb-4">Popular Searches</h3>
              <div className="space-y-2">
                <Link href="/search?search=toyota" className="block text-gray-300 hover:text-white transition-colors">
                  Toyota
                </Link>
                <Link href="/search?search=honda" className="block text-gray-300 hover:text-white transition-colors">
                  Honda
                </Link>
                <Link href="/search?search=nissan" className="block text-gray-300 hover:text-white transition-colors">
                  Nissan
                </Link>
                <Link href="/search?search=suzuki" className="block text-gray-300 hover:text-white transition-colors">
                  Suzuki
                </Link>
                <Link href="/search?search=bmw" className="block text-gray-300 hover:text-white transition-colors">
                  BMW
                </Link>
                <Link href="/search?search=mercedes" className="block text-gray-300 hover:text-white transition-colors">
                  Mercedes-Benz
                </Link>
                <Link href="/search?type=car" className="block text-gray-300 hover:text-white transition-colors">
                  All Cars
                </Link>
                <Link href="/search?type=bike" className="block text-gray-300 hover:text-white transition-colors">
                  Motorcycles
                </Link>
              </div>
            </div>

            {/* Contact & Support */}
            <div>
              <h3 className="text-xl font-bold mb-4">Contact & Support</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <Phone className="h-4 w-4 mr-2" />
                  +94 11 234 5678
                </li>
                <li className="flex items-center text-gray-300">
                  <Mail className="h-4 w-4 mr-2" />
                  info@drivedeal.lk
                </li>
                <li className="flex items-center text-gray-300">
                  <MapPin className="h-4 w-4 mr-2" />
                  Colombo, Sri Lanka
                </li>
                <li>
                  <button className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    FAQ
                  </button>
                </li>
                <li>
                  <button className="text-gray-300 hover:text-white transition-colors">
                    Customer Support
                  </button>
                </li>
              </ul>

              {/* Social Media Icons */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-blue-600 transition-colors">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-pink-500 transition-colors">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.995 1.488-1.995.219 0 .979.219.979 1.301 0 .781-.496 1.947-.781 3.026-.219.937.469 1.709 1.406 1.709 1.688 0 2.987-1.781 2.987-4.354 0-2.276-1.636-3.87-3.977-3.87-2.709 0-4.301 2.031-4.301 4.133 0 .821.314 1.709.706 2.189.077.094.088.177.065.272-.07.292-.226.92-.256 1.052-.043.177-.141.215-.326.13-1.21-.562-1.967-2.333-1.967-3.75 0-3.005 2.184-5.764 6.296-5.764 3.307 0 5.875 2.356 5.875 5.5 0 3.28-2.067 5.92-4.938 5.92-.964 0-1.871-.505-2.18-1.11l-.590 2.251c-.214.828-.792 1.865-1.18 2.497.887.274 1.832.42 2.811.42 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-blue-700 transition-colors">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-red-500 transition-colors">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 DRIVEDEAL. All rights reserved.
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
