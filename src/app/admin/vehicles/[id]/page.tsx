'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/contexts/PermissionsContext'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Car, 
  User, 
  Calendar, 
  MapPin,
  Phone,
  Mail,
  Edit,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Eye,
  DollarSign,
  Gauge,
  Fuel,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { VehicleImage } from '@/types'
import { formatPrice } from '@/lib/utils'

interface VehicleDetails {
  id: number
  title: string
  brand: string
  model: string
  year: number
  price: number
  type: 'car' | 'bike' | 'van' | 'truck' | 'other'
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other'
  transmission: 'manual' | 'automatic' | 'cvt'
  mileage: number
  description: string
  images: VehicleImage[] | string[]
  contactInfo: {
    phone: string
    email: string
    location: string
  }
  status: 'pending' | 'approved' | 'rejected'
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

export default function AdminVehicleDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { canAccess, canEdit, canDelete } = usePermissions()
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)

  // Image processing functions (same as VehicleCard)
  const getImages = (vehicle: VehicleDetails): string[] => {
    if (!vehicle.images) return []
    
    // Handle new VehicleImage[] format
    if (Array.isArray(vehicle.images) && vehicle.images.length > 0 && typeof vehicle.images[0] === 'object') {
      return (vehicle.images as VehicleImage[]).map(img => img.imageData)
    }
    
    // Handle legacy string[] format
    if (Array.isArray(vehicle.images)) {
      return vehicle.images as string[]
    }
    
    // Handle legacy JSON string format
    if (typeof vehicle.images === 'string') {
      try {
        const parsed = JSON.parse(vehicle.images)
        if (Array.isArray(parsed)) {
          return parsed
        }
      } catch {
        return [vehicle.images]
      }
    }
    
    return []
  }

  const validateImage = (imageUrl: string): boolean => {
    if (!imageUrl || typeof imageUrl !== 'string') return false
    const trimmed = imageUrl.trim()
    
    return (
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('/uploads/') ||
      trimmed.startsWith('./uploads/') ||
      trimmed.startsWith('../uploads/')
    )
  }

  const placeholderImageData = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMjAgMTIwSDI4MFYyNDBIMTIwVjEyMFoiIGZpbGw9IiNlNWU3ZWIiLz4KPHA+SW1hZ2UgTm90IEZvdW5kPC9wPgo8L3N2Zz4K'

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

    if (params.id) {
      fetchVehicleDetails(params.id as string)
    }
  }, [user, router, params.id])

  const fetchVehicleDetails = async (vehicleId: string) => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`vehicles/${vehicleId}`)

      if (response.ok) {
        const data = await response.json()
        setVehicleDetails(data.vehicle || data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to load vehicle details')
        router.push('/admin/vehicles')
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error)
      toast.error('Failed to load vehicle details')
      router.push('/admin/vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveVehicle = async () => {
    if (!vehicleDetails) return
    
    setActionLoading('approve')
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicles/${vehicleDetails.id}/approve`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Vehicle approved successfully')
        fetchVehicleDetails(vehicleDetails.id.toString())
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to approve vehicle')
      }
    } catch (error) {
      console.error('Error approving vehicle:', error)
      toast.error('Failed to approve vehicle')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectVehicle = async () => {
    if (!vehicleDetails) return

    setActionLoading('reject')
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicles/${vehicleDetails.id}/reject`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Vehicle rejected successfully')
        fetchVehicleDetails(vehicleDetails.id.toString())
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to reject vehicle')
      }
    } catch (error) {
      console.error('Error rejecting vehicle:', error)
      toast.error('Failed to reject vehicle')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteVehicle = async () => {
    if (!vehicleDetails) return

    if (!confirm(`Are you sure you want to delete "${vehicleDetails.title}"? This action cannot be undone.`)) {
      return
    }

    setActionLoading('delete')
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicles/${vehicleDetails.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.success(data.message || 'Vehicle deleted successfully')
        router.push('/admin/vehicles')
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to delete vehicle')
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Failed to delete vehicle')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditVehicle = () => {
    if (vehicleDetails) {
      router.push(`/admin/vehicles/${vehicleDetails.id}/edit`)
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading vehicle details...</span>
      </div>
    )
  }

  if (!vehicleDetails) {
    return (
      <div className="text-center py-12">
        <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Vehicle not found</h3>
        <p className="text-muted-foreground mb-4">The vehicle you're looking for doesn't exist.</p>
        <Link
          href="/admin/vehicles"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Vehicles</span>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin/vehicles"
            className="flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Vehicles</span>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Vehicle Details</h1>
              <p className="text-muted-foreground">View and manage vehicle information</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {/* Edit Button - only if can edit */}
            {canEdit('vehicle_management') && (
              <button
                onClick={handleEditVehicle}
                className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Edit Vehicle"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            {/* Approval Actions - only if can edit and vehicle is pending */}
            {canEdit('vehicle_management') && vehicleDetails.status === 'pending' && (
              <>
                <button
                  onClick={handleApproveVehicle}
                  disabled={actionLoading === 'approve'}
                  className="flex items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  title="Approve Vehicle"
                >
                  {actionLoading === 'approve' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={handleRejectVehicle}
                  disabled={actionLoading === 'reject'}
                  className="flex items-center justify-center p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  title="Reject Vehicle"
                >
                  {actionLoading === 'reject' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </button>
              </>
            )}
            
            {/* Delete Button - only if can delete */}
            {canDelete('vehicle_management') && (
              <button
                onClick={handleDeleteVehicle}
                disabled={actionLoading === 'delete'}
                className="flex items-center justify-center p-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
                title="Delete Vehicle"
              >
                {actionLoading === 'delete' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Images */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Vehicle Images</h2>
            {(() => {
              const images = getImages(vehicleDetails)
              const validImages = images.filter(validateImage)
              const displayImages = validImages.length > 0 ? validImages : [placeholderImageData]
              
              return displayImages.length > 0 ? (
                <div>
                  {/* Main Image */}
                  <div className="mb-4">
                    <Image
                      src={displayImages[selectedImage] || placeholderImageData}
                      alt={vehicleDetails.title}
                      width={800}
                      height={600}
                      className="w-full h-64 object-cover rounded-lg"
                      unoptimized={displayImages[selectedImage]?.startsWith('data:') || displayImages[selectedImage]?.startsWith('blob:') || displayImages[selectedImage]?.startsWith('/uploads/')}
                    />
                  </div>
                  {/* Thumbnail Gallery */}
                  {displayImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {displayImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImage === index ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${vehicleDetails.title} ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized={image.startsWith('data:') || image.startsWith('blob:') || image.startsWith('/uploads/')}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-2" />
                  <p>No images available</p>
                </div>
              )
            })()}
          </div>

          {/* Vehicle Details */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <span>Vehicle Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                <p className="text-lg font-medium">{vehicleDetails.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Brand & Model</label>
                <p className="text-lg">{vehicleDetails.brand} {vehicleDetails.model}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Year</label>
                <p className="text-lg">{vehicleDetails.year}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Price</label>
                <p className="text-lg font-bold text-primary">{formatPrice(vehicleDetails.price)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                <p className="text-lg capitalize">{vehicleDetails.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Fuel Type</label>
                <p className="text-lg capitalize">{vehicleDetails.fuelType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Transmission</label>
                <p className="text-lg capitalize">{vehicleDetails.transmission}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Mileage</label>
                <p className="text-lg">{vehicleDetails.mileage.toLocaleString()} km</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
              <p className="text-base">{vehicleDetails.description}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{vehicleDetails.contactInfo.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{vehicleDetails.contactInfo.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{vehicleDetails.contactInfo.location || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Current Status</label>
                <span className={`px-3 py-2 text-sm font-medium rounded-full ${
                  vehicleDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  vehicleDetails.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {vehicleDetails.status.charAt(0).toUpperCase() + vehicleDetails.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Owner</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                <p className="font-medium">{vehicleDetails.user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                <p className="text-sm">{vehicleDetails.user.email}</p>
              </div>
              <Link
                href={`/admin/users/${vehicleDetails.userId}`}
                className="w-full flex items-center space-x-2 p-3 text-left rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
              >
                <User className="h-4 w-4" />
                <span>View User Profile</span>
              </Link>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Timeline</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Posted</label>
                <p className="font-medium">{new Date(vehicleDetails.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Last Updated</label>
                <p className="font-medium">{new Date(vehicleDetails.updatedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              {/* Edit Action - only if can edit */}
              {canEdit('vehicle_management') && (
                <button
                  onClick={handleEditVehicle}
                  className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Edit Vehicle Details"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              <Link
                href={`/vehicles/${vehicleDetails.id}`}
                className="flex items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="View Public Listing"
              >
                <Eye className="h-4 w-4" />
              </Link>
              
              {/* View Owner Profile - only if can access user management */}
              {canAccess('user_management') && (
                <Link
                  href={`/admin/users/${vehicleDetails.userId}`}
                  className="flex items-center justify-center p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  title="View Owner Profile"
                >
                  <User className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
