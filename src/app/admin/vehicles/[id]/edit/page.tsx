'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Save, Loader2, Car, Edit } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface VehicleDetails {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  type: 'car' | 'bike' | 'van' | 'truck' | 'other'
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other'
  transmission: 'manual' | 'automatic' | 'cvt'
  condition: 'USED' | 'BRANDNEW' | 'REFURBISHED'
  mileage: number
  description: string
  images: string[]
  contactInfo: {
    phone: string
    email: string
    location: string
  }
  status: 'pending' | 'approved' | 'rejected'
  userId: string
  createdAt: Date
  updatedAt: Date
}

export default function AdminEditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    type: 'car' as 'car' | 'bike' | 'van' | 'truck' | 'other',
    fuelType: 'petrol' as 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other',
    transmission: 'manual' as 'manual' | 'automatic' | 'cvt',
    condition: 'USED' as 'USED' | 'BRANDNEW' | 'REFURBISHED',
    mileage: '',
    description: '',
    contactInfo: {
      phone: '',
      email: '',
      location: ''
    },
    status: 'pending' as 'pending' | 'approved' | 'rejected'
  })

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
        const vehicle = data.vehicle || data
        setVehicleDetails(vehicle)
        setFormData({
          title: vehicle.title,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year.toString(),
          price: vehicle.price.toString(),
          type: vehicle.type,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          condition: vehicle.condition,
          mileage: vehicle.mileage.toString(),
          description: vehicle.description,
          contactInfo: vehicle.contactInfo || { phone: '', email: '', location: '' },
          status: vehicle.status
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!vehicleDetails) return
    
    setSaving(true)
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`admin/vehicles/${vehicleDetails.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          price: parseFloat(formData.price),
          type: formData.type,
          fuelType: formData.fuelType,
          transmission: formData.transmission,
          mileage: parseInt(formData.mileage),
          description: formData.description,
          contactInfo: formData.contactInfo,
          status: formData.status
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Vehicle updated successfully')
        router.push('/admin/vehicles')
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to update vehicle')
      }
    } catch (error) {
      console.error('Error updating vehicle:', error)
      toast.error('Failed to update vehicle')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
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
        <p className="text-muted-foreground mb-4">The vehicle you're trying to edit doesn't exist.</p>
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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Edit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Edit Vehicle</h1>
            <p className="text-muted-foreground">Update vehicle information and settings</p>
          </div>
        </div>
      </div>

      {/* Edit Vehicle Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <Car className="h-5 w-5 text-primary" />
            <span>Vehicle Information</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter vehicle title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Toyota"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Camry"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Year *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 2022"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 25000"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Fuel Type *</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Transmission *</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
                <option value="cvt">CVT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Condition *</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="USED">Used</option>
                <option value="BRANDNEW">Brand New</option>
                <option value="REFURBISHED">Refurbished</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Mileage (km) *</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 15000"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe the vehicle's condition, features, etc."
                required
              />
            </div>
          </div>
        </div>


        {/* Contact Information */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                name="contactInfo.location"
                value={formData.contactInfo.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter location"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/vehicles"
            className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary flex items-center justify-center text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating Vehicle...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
