'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Car, Upload, X, Plus, ArrowLeft, Save, Loader2, Image as ImageIcon, Info, Phone, MapPin, Mail, DollarSign, Calendar, Fuel, Settings, FileText } from 'lucide-react'
import { VehicleFormData } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import SubscriptionExceededModal from '@/components/SubscriptionExceededModal'

export default function PostVehiclePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showSubscriptionExceeded, setShowSubscriptionExceeded] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState<{
    planType?: string
    subscriptionId?: string
  }>({})
  const [formData, setFormData] = useState<VehicleFormData>({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    type: 'car',
    fuelType: 'petrol',
    transmission: 'automatic',
    condition: 'USED',
    mileage: 0,
    description: '',
    contactInfo: {
      phone: user?.phone || '',
      email: user?.email || '',
      location: ''
    }
  })
  const [images, setImages] = useState<string[]>([])

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          phone: user.phone || '',
          email: user.email || ''
        }
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Prevent email editing for users
    if (name === 'contactInfo.email') {
      return
    }
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1] as keyof typeof formData.contactInfo
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
        [name]: name === 'year' || name === 'price' || name === 'mileage' ? Number(value) : value
      }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // Check if adding these files would exceed the 8 image limit
      const totalImages = images.length + files.length
      if (totalImages > 8) {
        toast.error(`Maximum 8 images allowed. You currently have ${images.length} images and are trying to add ${files.length} more.`)
        return
      }

      try {
        const base64Images: string[] = []
        
        for (const file of Array.from(files)) {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            toast.error(`${file.name} is not a valid image file`)
            continue
          }
          
          // Validate file size (10MB limit)
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`${file.name} is too large. Maximum size is 10MB`)
            continue
          }
          
          // Convert to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          
          base64Images.push(base64)
        }
        
        if (base64Images.length > 0) {
          setImages(prev => [...prev, ...base64Images])
          toast.success(`Successfully processed ${base64Images.length} image(s)`)
        }
      } catch (error) {
        console.error('Image upload error:', error)
        toast.error('Failed to process images')
      }
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleRenewSubscription = () => {
    setShowSubscriptionExceeded(false)
    // Navigate to subscription page with renew option
    router.push('/subscription?action=renew&plan=' + subscriptionError.planType)
  }

  const handleUpgradePlan = () => {
    setShowSubscriptionExceeded(false)
    // Navigate to subscription page with upgrade option
    router.push('/subscription?action=upgrade')
  }

  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionExceeded(false)
    setSubscriptionError({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to post a vehicle')
      return
    }

    // Basic validation
    if (!formData.title || !formData.brand || !formData.model || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    if (formData.mileage < 0) {
      toast.error('Mileage cannot be negative')
      return
    }

    setIsLoading(true)

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          images: images
        })
      })

      if (response.ok) {
        // Set flag to indicate user just posted a vehicle
        sessionStorage.setItem('justPostedVehicle', 'true')
        toast.success('Vehicle posted successfully! It will be reviewed by our team.')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        
        // Check if it's a subscription exceeded error
        if (error.errorType === 'SUBSCRIPTION_EXCEEDED') {
          setSubscriptionError({
            planType: error.planType,
            subscriptionId: error.subscriptionId
          })
          setShowSubscriptionExceeded(true)
        } else {
          toast.error(error.error || 'Failed to post vehicle')
        }
      }
    } catch (error) {
      console.error('Error posting vehicle:', error)
      toast.error('Failed to post vehicle. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Post a Vehicle</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">Create a new vehicle listing for sale</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">

          {/* Vehicle Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Basic Information</h2>
                  <p className="text-slate-600 dark:text-slate-400">Enter the essential details about the vehicle</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <span>Model *</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="e.g., Camry, Civic, X5"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Year *</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Price *</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    min="0"
                    step="0.01"
                    placeholder="Enter price in LKR"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Mileage *</span>
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    min="0"
                    placeholder="Enter mileage in km"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vehicle Specifications</h2>
                  <p className="text-slate-600 dark:text-slate-400">Select the technical specifications of your vehicle</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Vehicle Type *</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Fuel Type *</span>
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Transmission *</span>
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Condition *</span>
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white"
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
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Description</h2>
                  <p className="text-slate-600 dark:text-slate-400">Provide detailed information about your vehicle</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span>Vehicle Description *</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full h-32 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500 resize-vertical"
                  placeholder="Describe the vehicle's condition, features, history, and any other relevant details..."
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Provide a detailed description of the vehicle's condition, features, and history</p>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <ImageIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vehicle Images</h2>
                  <p className="text-slate-600 dark:text-slate-400">Upload high-quality photos of your vehicle</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Upload Images</label>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {images.length}/8 images
                  </span>
                </div>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  images.length >= 8 
                    ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700' 
                    : 'border-gray-300 dark:border-slate-500 hover:border-gray-400 dark:hover:border-slate-400'
                }`}>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 8}
                  />
                  <label htmlFor="image-upload" className={`cursor-pointer ${images.length >= 8 ? 'cursor-not-allowed' : ''}`}>
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className={`h-8 w-8 ${images.length >= 8 ? 'text-gray-300 dark:text-slate-500' : 'text-gray-400'}`} />
                      <div className={`text-sm ${images.length >= 8 ? 'text-gray-400 dark:text-slate-500' : 'text-gray-600 dark:text-slate-300'}`}>
                        {images.length >= 8 ? (
                          <span>Maximum 8 images reached</span>
                        ) : (
                          <>
                            <span className="font-medium text-primary">Click to upload</span> or drag and drop
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        PNG, JPG, WebP up to 10MB each
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Uploaded Images ({images.length})</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={image}
                            alt={`Vehicle image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No images uploaded yet</p>
                  <p className="text-sm">Upload at least one image to showcase the vehicle</p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Information</h2>
                  <p className="text-slate-600 dark:text-slate-400">How potential buyers can reach you</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Phone *</span>
                  </label>
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Email *</span>
                  </label>
                  <input
                    type="email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-400 cursor-not-allowed"
                    required
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email is automatically filled from your account</p>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Location *</span>
                  </label>
                  <input
                    type="text"
                    name="contactInfo.location"
                    value={formData.contactInfo.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500"
                    placeholder="Enter location"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 text-center font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Posting Vehicle...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Post Vehicle</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Subscription Exceeded Modal */}
      <SubscriptionExceededModal
        isOpen={showSubscriptionExceeded}
        onClose={handleCloseSubscriptionModal}
        onRenewSubscription={handleRenewSubscription}
        onUpgradePlan={handleUpgradePlan}
        planType={subscriptionError.planType}
        subscriptionId={subscriptionError.subscriptionId}
      />
    </div>
  )
}

