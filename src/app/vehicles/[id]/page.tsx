'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import PricePredictionModal from '@/components/PricePredictionModal'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Car, 
  Fuel, 
  Settings, 
  Gauge, 
  DollarSign,
  User,
  Clock,
  Image as ImageIcon,
  Heart,
  Share2,
  Loader2,
  TrendingUp,
  Crown
} from 'lucide-react'
import { Vehicle } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { showConfirmDialog, showSuccessDialog, showErrorDialog } from '@/lib/sweetalert'

export default function VehicleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const [showPredictionModal, setShowPredictionModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchVehicleDetails(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (user && vehicle) {
      checkFavoriteStatus()
    }
  }, [user, vehicle])

  const fetchVehicleDetails = async (vehicleId: string) => {
    try {
      setLoading(true)
      
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`vehicles/${vehicleId}`)
      
      if (response.ok) {
        const data = await response.json()
        setVehicle(data.vehicle || data) // Handle both { vehicle: ... } and direct vehicle response
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Vehicle not found')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error)
      toast.error('Failed to load vehicle details')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const checkFavoriteStatus = async () => {
    if (!user || !vehicle) return

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`favorites/check?vehicleIds=${vehicle.id}`)

      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.favorites?.[vehicle.id] || false)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      await showErrorDialog('Login Required', 'Please log in to add vehicles to your favorites.')
      return
    }

    if (!vehicle) return

    if (isFavorite) {
      // Ask for confirmation before removing
      const result = await showConfirmDialog(
        'Remove from Favorites',
        'Are you sure you want to remove this vehicle from your favorites?',
        'Yes, Remove',
        'Cancel'
      )
      if (!result.isConfirmed) return
    }

    setLoadingFavorite(true)
    try {
      const { apiFetch } = await import('@/lib/api-client')
      
      if (isFavorite) {
        // Remove from favorites
        const response = await apiFetch(`favorites?vehicleId=${vehicle.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setIsFavorite(false)
          await showSuccessDialog('Removed from Favorites', 'This vehicle has been removed from your favorites.')
        } else {
          await showErrorDialog('Error', 'Failed to remove from favorites. Please try again.')
        }
      } else {
        // Add to favorites
        const response = await apiFetch('favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ vehicleId: vehicle.id })
        })
        
        if (response.ok) {
          setIsFavorite(true)
          await showSuccessDialog('Added to Favorites', 'This vehicle has been added to your favorites!')
        } else {
          const errorData = await response.json().catch(() => ({}))
          await showErrorDialog('Error', errorData.error || 'Failed to add to favorites. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      await showErrorDialog('Error', 'Failed to update favorites. Please try again.')
    } finally {
      setLoadingFavorite(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicle?.title || 'Vehicle Details',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const getImages = () => {
    if (!vehicle?.images) return []
    
    if (Array.isArray(vehicle.images)) {
      // Handle new VehicleImage[] structure
      if (vehicle.images.length > 0 && typeof vehicle.images[0] === 'object' && vehicle.images[0] !== null && 'imageData' in vehicle.images[0]) {
        // New structure: array of VehicleImage objects
        return vehicle.images.map(img => (img as any).imageData).filter(Boolean)
      } else if (vehicle.images.length > 0 && typeof vehicle.images[0] === 'string') {
        // Legacy structure: array of strings
        return vehicle.images as string[]
      }
      return []
    }
    
    if (typeof vehicle.images === 'string') {
      try {
        const parsed = JSON.parse(vehicle.images)
        if (Array.isArray(parsed)) {
          // Check if parsed array contains objects or strings
          if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && 'imageData' in parsed[0]) {
            return parsed.map(img => (img as any).imageData).filter(Boolean)
          } else {
            return parsed as string[]
          }
        } else {
          return [parsed as string]
        }
      } catch {
        // If it's not valid JSON, treat it as a single image
        // This handles direct base64 strings or single URLs
        return [vehicle.images]
      }
    }
    return []
  }

  const getContactInfo = () => {
    if (!vehicle?.contactInfo) return {}
    if (typeof vehicle.contactInfo === 'string') {
      try {
        return JSON.parse(vehicle.contactInfo)
      } catch {
        return {}
      }
    }
    return vehicle.contactInfo
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price).replace('LKR', 'Rs.')
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Vehicle Not Found</h1>
            <Link href="/" className="btn btn-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const images = getImages()
  

  const contactInfo = getContactInfo()

  const handleBackNavigation = () => {
    const fromSection = searchParams.get('from')
    
    if (fromSection === 'my-vehicles') {
      router.push('/dashboard?tab=vehicles')
    } else if (fromSection === 'favorites') {
      router.push('/dashboard?tab=favorites')
    } else if (fromSection === 'search') {
      router.push('/search')
    } else if (fromSection === 'home') {
      router.push('/')
    } else if (fromSection === 'admin') {
      router.push('/admin/vehicles')
    } else {
      // Default behavior - go back in browser history
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBackNavigation}
            className="btn btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Vehicle Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{vehicle.title}</h1>
                {vehicle.isPremium && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Crown className="h-4 w-4" />
                    <span>Premium</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{vehicle.user?.name || 'Unknown Seller'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Posted {formatDate(vehicle.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFavorite}
                disabled={loadingFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'hover:bg-accent'
                } ${loadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {loadingFavorite ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="Share vehicle"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Price */}
          <div className="text-3xl font-bold text-primary mb-4">
            {formatPrice(vehicle.price)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Images</h2>
              {images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={images[selectedImage]}
                      alt={vehicle.title}
                      fill
                      className="object-cover"
                      unoptimized={images[selectedImage].startsWith('data:') || images[selectedImage].startsWith('blob:') || images[selectedImage].startsWith('/uploads/')}

                    />
                  </div>
                  
                  {/* Thumbnail Images */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index 
                              ? 'border-primary' 
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${vehicle.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized={image.startsWith('data:') || image.startsWith('blob:') || image.startsWith('/uploads/')}

                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-foreground leading-relaxed">
                {vehicle.description}
              </p>
            </div>

            {/* Specifications */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium">{vehicle.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{vehicle.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Fuel className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Type</p>
                      <p className="font-medium capitalize">{vehicle.fuelType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="font-medium capitalize">{vehicle.transmission}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Condition</p>
                      <p className="font-medium">{vehicle.condition}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Gauge className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mileage</p>
                      <p className="font-medium">{vehicle.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">{formatPrice(vehicle.price)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Posted</p>
                      <p className="font-medium">{formatDate(vehicle.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Brand & Model</p>
                      <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                {contactInfo.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a 
                        href={`tel:${contactInfo.phone}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                
                {contactInfo.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{contactInfo.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{vehicle.user?.name || 'Unknown'}</p>
                  </div>
                </div>
                

                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {vehicle.user?.createdAt ? formatDate(vehicle.user.createdAt) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {/* Predict Price Button - Only show for approved cars */}
                {vehicle.status === 'approved' && vehicle.type === 'car' && (
                  <button
                    onClick={() => setShowPredictionModal(true)}
                    className="w-full py-4 btn bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Predict Price
                  </button>
                )}
                
                <button
                  onClick={handleFavorite}
                  disabled={loadingFavorite}
                  className={`w-full btn ${
                    isFavorite ? 'btn-destructive' : 'btn-outline'
                  } ${loadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingFavorite ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  )}
                  {loadingFavorite ? 'Loading...' : (isFavorite ? 'Remove from Favorites' : 'Add to Favorites')}
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full btn btn-outline"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Vehicle
                </button>
                
                {contactInfo.phone && (
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="w-full btn btn-primary"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Seller
                  </a>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Prediction Modal */}
      {vehicle && (
        <PricePredictionModal
          isOpen={showPredictionModal}
          onClose={() => setShowPredictionModal(false)}
          vehicle={vehicle}
        />
      )}
    </div>
  )
}
