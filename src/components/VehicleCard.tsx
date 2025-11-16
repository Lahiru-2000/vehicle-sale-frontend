'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Gauge, Eye, Heart, Share2, Car, Crown } from 'lucide-react'
import { Vehicle } from '@/types'

interface VehicleCardProps {
  vehicle: Vehicle
  showActions?: boolean
  variant?: 'grid' | 'list'
  showPremiumBadge?: boolean
  isFavorited?: boolean
  onFavoriteToggle?: (vehicleId: string, isFavorited: boolean) => void
  onShare?: (vehicle: Vehicle) => void
  onEdit?: (vehicle: Vehicle) => void
  onDelete?: (vehicle: Vehicle) => void
  onApprove?: (vehicle: Vehicle) => void
  onReject?: (vehicle: Vehicle) => void
  fromSection?: 'my-vehicles' | 'favorites' | 'search' | 'home' | 'admin'
}

export default function VehicleCard({ 
  vehicle, 
  showActions = false,
  variant = 'grid',
  showPremiumBadge = true,
  isFavorited = false,
  onFavoriteToggle,
  onShare,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  fromSection
}: VehicleCardProps) {
  const getImages = () => {
    if (!vehicle.images) return []
    
    // Handle new VehicleImage objects from separate table
    if (Array.isArray(vehicle.images) && vehicle.images.length > 0) {
      const firstImage = vehicle.images[0]
      
      // Check if it's the new VehicleImage object format
      if (typeof firstImage === 'object' && firstImage !== null && 'imageData' in firstImage) {
        // New format: array of VehicleImage objects
        return vehicle.images.map((img: any) => img.imageData).filter(Boolean)
      } else {
        // Legacy format: array of strings
        return vehicle.images as string[]
      }
    }
    
    // Handle legacy string format
    if (typeof vehicle.images === 'string') {
      try {
        const parsed = JSON.parse(vehicle.images)
        return Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        // If it's not valid JSON, treat it as a single image
        return [vehicle.images]
      }
    }
    
    return []
  }

  const getContactInfo = () => {
    if (!vehicle.contactInfo) return {}
    if (typeof vehicle.contactInfo === 'string') {
      try {
        return JSON.parse(vehicle.contactInfo)
      } catch {
        return {}
      }
    }
    return vehicle.contactInfo
  }

  // Get valid images or fallback to placeholder images
  const validImages = getImages().filter((img: string) => {
    if (!img || typeof img !== 'string') return false
    const trimmed = img.trim()
    
    // Support all common image formats and storage methods
    const isValid = trimmed !== '' && (
      // HTTP/HTTPS URLs
      trimmed.startsWith('http://') || 
      trimmed.startsWith('https://') || 
      
      // Base64 images (all formats: JPG, PNG, GIF, WebP, etc.)
      trimmed.startsWith('data:image/jpeg') ||
      trimmed.startsWith('data:image/jpg') ||
      trimmed.startsWith('data:image/png') ||
      trimmed.startsWith('data:image/gif') ||
      trimmed.startsWith('data:image/webp') ||
      trimmed.startsWith('data:image/bmp') ||
      trimmed.startsWith('data:image/svg') ||
      trimmed.startsWith('data:image/') ||  // Generic data:image/ catch-all
      
      // Blob URLs (from file uploads)
      trimmed.startsWith('blob:') ||
      
      // File system paths
      trimmed.startsWith('/uploads/') ||
      trimmed.startsWith('./uploads/') ||
      trimmed.startsWith('../uploads/')
    )
    

    
    return isValid
  })
  
  // Static placeholder for invalid images - no external dependencies
  const placeholderImageData = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjJmMmYyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
  
  const fallbackImages = [placeholderImageData]
  
  const displayImages = validImages.length > 0 ? validImages : fallbackImages

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicle.title,
        text: `${vehicle.brand} ${vehicle.model} - ${vehicle.year}`,
        url: `${window.location.origin}/vehicles/${vehicle.id}`
      })
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/vehicles/${vehicle.id}`
      navigator.clipboard.writeText(url).then(() => {
        // You might want to show a toast notification here
        console.log('Link copied to clipboard')
      })
    }
    
    // Call the onShare prop if provided
    onShare?.(vehicle)
  }
  const contactInfo = getContactInfo()



  // Local placeholder component for when images fail
  const PlaceholderImage = () => (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="text-center text-muted-foreground">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
          <Car className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm font-medium">Vehicle Image</p>
        <p className="text-xs mt-1">{vehicle.brand} {vehicle.model}</p>
      </div>
    </div>
  )



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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (variant === 'list') {
    return (
      <div className={`card overflow-hidden hover:shadow-lg transition-shadow duration-300 relative ${
        vehicle.isPremium ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
      }`}>
        {/* Premium Badge */}
        {showPremiumBadge && vehicle.isPremium && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          </div>
        )}
        
        <div className="flex">
          {/* Image Section - List View */}
          <div className="relative w-48 h-32 bg-muted overflow-hidden flex-shrink-0">
            {displayImages.length > 0 ? (
              <Image
                src={displayImages[0]}
                alt={vehicle.title}
                fill
                className="object-cover"
                unoptimized={displayImages[0].startsWith('data:') || displayImages[0].startsWith('blob:') || displayImages[0].startsWith('/uploads/')}
                onError={(e) => {
                  // Try to use a fallback image
                  const target = e.target as HTMLImageElement
                  if (target.src !== fallbackImages[0]) {
                    target.src = fallbackImages[0]
                  }
                }}
              />
            ) : (
              <PlaceholderImage />
            )}
          </div>

          {/* Content Section - List View */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                  {vehicle.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{vehicle.year}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{vehicle.brand} {vehicle.model}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Gauge className="h-4 w-4" />
                    <span>{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                  {contactInfo.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{contactInfo.location}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {vehicle.description}
                </p>

                <div className="text-xs text-muted-foreground">
                  Posted {formatDate(vehicle.createdAt)}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3 ml-4">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(vehicle.price)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/vehicles/${vehicle.id}${fromSection ? `?from=${fromSection}` : ''}`}
                    className="btn btn-primary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>

                  <button
                    className={`p-2 border rounded-lg transition-colors ${
                      isFavorited 
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                        : 'hover:bg-muted'
                    }`}
                    title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    onClick={() => onFavoriteToggle?.(vehicle.id, isFavorited)}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Admin Actions */}
                {showActions && (
                  <div className="flex space-x-1">
                    {vehicle.status === 'pending' && onApprove && (
                      <button
                        onClick={() => onApprove(vehicle)}
                        className="btn btn-primary btn-sm"
                        title="Approve"
                      >
                        ✓
                      </button>
                    )}
                    {vehicle.status === 'pending' && onReject && (
                      <button
                        onClick={() => onReject(vehicle)}
                        className="btn btn-outline btn-sm"
                        title="Reject"
                      >
                        ✗
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(vehicle)}
                        className="btn btn-outline btn-sm"
                        title="Edit"
                      >
                        ✎
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(vehicle)}
                        className="btn btn-destructive btn-sm"
                        title="Delete"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view (default)
  return (
    <div className={`card overflow-hidden hover:shadow-lg transition-shadow duration-300 relative ${
      vehicle.isPremium ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
    }`}>
      {/* Premium Badge */}
      {showPremiumBadge && vehicle.isPremium && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            <Crown className="h-3 w-3" />
            <span>Premium</span>
          </div>
        </div>
      )}
      
      {/* Image Section */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {displayImages.length > 0 ? (
          <Image
            src={displayImages[0]}
            alt={vehicle.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            unoptimized={displayImages[0].startsWith('data:') || displayImages[0].startsWith('blob:') || displayImages[0].startsWith('/uploads/')}
            onError={(e) => {
              // Try to use a fallback image
              const target = e.target as HTMLImageElement
              if (target.src !== fallbackImages[0]) {
                target.src = fallbackImages[0]
              }
            }}
          />
        ) : (
          <PlaceholderImage />
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            className={`p-1.5 rounded-full transition-colors ${
              isFavorited 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-black/20 hover:bg-black/40 text-white'
            }`}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onFavoriteToggle?.(vehicle.id, isFavorited)}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            className="p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            title="Share"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="mb-3">
          <div className="mb-1">
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
              {vehicle.title}
            </h3>
          </div>
          <div className="text-2xl font-bold text-primary">
            {formatPrice(vehicle.price)}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{vehicle.year} • {vehicle.brand} {vehicle.model}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4" />
            <span>{vehicle.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4" />
            <span>{vehicle.condition}</span>
          </div>
          {contactInfo.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{contactInfo.location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {vehicle.description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* View Details Button */}
          <Link
            href={`/vehicles/${vehicle.id}${fromSection ? `?from=${fromSection}` : ''}`}
            className="btn btn-primary flex-1 flex items-center justify-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>

          {/* Admin Actions */}
          {showActions && (
            <div className="flex space-x-1">
              {vehicle.status === 'pending' && onApprove && (
                <button
                  onClick={() => onApprove(vehicle)}
                  className="btn btn-primary btn-sm"
                  title="Approve"
                >
                  ✓
                </button>
              )}
              {vehicle.status === 'pending' && onReject && (
                <button
                  onClick={() => onReject(vehicle)}
                  className="btn btn-outline btn-sm"
                  title="Reject"
                >
                  ✗
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(vehicle)}
                  className="btn btn-outline btn-sm"
                  title="Edit"
                >
                  ✎
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(vehicle)}
                  className="btn btn-destructive btn-sm"
                  title="Delete"
                >
                  🗑
                </button>
              )}
            </div>
          )}
        </div>

        {/* Posted Date */}
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          Posted {formatDate(vehicle.createdAt)}
        </div>
      </div>
    </div>
  )
}
