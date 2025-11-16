'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboard } from '@/contexts/DashboardContext'
import Navigation from '@/components/Navigation'
import { ArrowLeft, Loader2, Save, Car, Info, Phone, MapPin, Mail, DollarSign, Calendar, Fuel, Settings, FileText, Edit } from 'lucide-react'
import { Vehicle } from '@/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { updateVehicle } = useDashboard()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    type: 'car',
    fuelType: 'petrol',
    transmission: 'manual',
    condition: 'USED',
    mileage: '',
    description: '',
    contactInfo: {
      phone: '',
      email: '',
      location: ''
    }
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (params.id) {
      fetchVehicle(params.id as string)
    }
  }, [user, router, params.id])

  const fetchVehicle = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/vehicles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const vehicleData = data.vehicle
        
        // Check if user owns this vehicle
        if (vehicleData.userId !== user?.id) {
          toast.error('You can only edit your own vehicles')
          router.push('/dashboard')
          return
        }

        // Check if vehicle is pending (can be edited)
        if (vehicleData.status !== 'pending') {
          toast.error('Only pending vehicles can be edited')
          router.push('/dashboard')
          return
        }

        setVehicle(vehicleData)
        setFormData({
          title: vehicleData.title,
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year.toString(),
          price: vehicleData.price.toString(),
          type: vehicleData.type,
          fuelType: vehicleData.fuelType,
          transmission: vehicleData.transmission,
          condition: vehicleData.condition,
          mileage: vehicleData.mileage.toString(),
          description: vehicleData.description,
          contactInfo: vehicleData.contactInfo
        })
      } else {
        toast.error('Failed to load vehicle')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error)
      toast.error('Failed to load vehicle')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!vehicle) return

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('vehicles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: vehicle.id,
          ...formData,
          year: parseInt(formData.year),
          price: parseFloat(formData.price),
          mileage: parseInt(formData.mileage)
        })
      })

      if (response.ok) {
        const updatedVehicleData = await response.json()
        // Update the vehicle in dashboard context
        if (updatedVehicleData.vehicle) {
          updateVehicle(updatedVehicleData.vehicle)
        }
        toast.success('Vehicle updated successfully')
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!vehicle) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                <Edit className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Vehicle</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">Update your vehicle listing information</p>
              </div>
            </div>
            
            {/* Info Banner */}
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Vehicle Update Notice</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Only pending vehicles can be edited. Approved or rejected vehicles cannot be modified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Basic Information</h2>
                  <p className="text-slate-600 dark:text-slate-400">Update the essential details about the vehicle</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Car className="h-4 w-4 text-blue-500" />
                    <span>Vehicle Title *</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="e.g., 2020 Toyota Camry Hybrid"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enter a descriptive title for the vehicle listing</p>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Car className="h-4 w-4 text-blue-500" />
                    <span>Brand *</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="e.g., Toyota, Honda, BMW"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Car className="h-4 w-4 text-blue-500" />
                    <span>Model *</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="e.g., Camry, Civic, X5"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Year *</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    placeholder="e.g., 2020"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <span>Price (Rs.) *</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 2500000"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enter the asking price in Sri Lankan Rupees</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mileage *</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    className="input w-full"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input w-full"
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
                    className="input w-full"
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
                    className="input w-full"
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
                    className="input w-full"
                    required
                  >
                    <option value="USED">Used</option>
                    <option value="BRANDNEW">Brand New</option>
                    <option value="REFURBISHED">Refurbished</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Description</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input w-full h-32"
                  placeholder="Describe your vehicle in detail..."
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Location *</label>
                  <input
                    type="text"
                    name="contactInfo.location"
                    value={formData.contactInfo.location}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="btn btn-outline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
