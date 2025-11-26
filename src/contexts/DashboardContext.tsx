'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Vehicle } from '@/types'
import { useAuth } from './AuthContext'

interface DashboardContextType {
  vehicles: Vehicle[]
  favorites: Vehicle[]
  setVehicles: (vehicles: Vehicle[]) => void
  setFavorites: (favorites: Vehicle[]) => void
  updateVehicle: (updatedVehicle: Vehicle) => void
  clearData: () => void
  isLoadingVehicles: boolean
  isLoadingFavorites: boolean
  setIsLoadingVehicles: (loading: boolean) => void
  setIsLoadingFavorites: (loading: boolean) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

// Maximum number of vehicles to store in sessionStorage
const MAX_STORED_VEHICLES = 100

// Helper function to create a reduced-size vehicle object for storage
// Keeps all required fields but reduces data size (fewer images, shorter description)
function createReducedVehicle(vehicle: Vehicle): Vehicle {
  // Limit images to first 3 to reduce storage size
  let reducedImages: VehicleImage[] | string[] = []
  if (Array.isArray(vehicle.images) && vehicle.images.length > 0) {
    reducedImages = vehicle.images.slice(0, 3)
  }
  
  // Truncate description if too long (keep first 500 chars)
  const maxDescriptionLength = 500
  const reducedDescription = vehicle.description && vehicle.description.length > maxDescriptionLength
    ? vehicle.description.substring(0, maxDescriptionLength) + '...'
    : (vehicle.description || '')
  
  return {
    ...vehicle,
    images: reducedImages,
    description: reducedDescription,
    // Remove optional large fields that aren't needed for caching
    user: undefined,
  }
}

// Helper function to safely store data in sessionStorage with quota handling
function safeSetItem(key: string, data: any, maxItems?: number): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // If maxItems is specified, limit the array size
    let dataToStore = data
    if (maxItems && Array.isArray(data) && data.length > maxItems) {
      // Keep only the most recent items
      dataToStore = data.slice(-maxItems)
    }
    
    // Create reduced-size version for storage
    if (Array.isArray(dataToStore)) {
      dataToStore = dataToStore.map(createReducedVehicle)
    }
    
    const jsonString = JSON.stringify(dataToStore)
    
    // Check if data is too large (rough estimate: 4MB limit for safety)
    const sizeInBytes = new Blob([jsonString]).size
    if (sizeInBytes > 4 * 1024 * 1024) {
      console.warn(`Data too large (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB), reducing size...`)
      // If still too large, reduce further
      if (Array.isArray(dataToStore) && dataToStore.length > 50) {
        dataToStore = dataToStore.slice(-50)
        return safeSetItem(key, dataToStore)
      }
    }
    
    sessionStorage.setItem(key, JSON.stringify(dataToStore))
    return true
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('SessionStorage quota exceeded, attempting to free space...')
      
      // Try to clear old dashboard data
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const existingKey = sessionStorage.key(i)
          if (existingKey && 
              existingKey !== key && 
              (existingKey.startsWith('dashboard_vehicles_') || existingKey.startsWith('dashboard_favorites_'))) {
            keysToRemove.push(existingKey)
          }
        }
        keysToRemove.forEach(k => sessionStorage.removeItem(k))
        
        // Try again with reduced data
        if (Array.isArray(data) && data.length > 50) {
          const reducedData = data.slice(-50).map(createReducedVehicle)
          sessionStorage.setItem(key, JSON.stringify(reducedData))
          return true
        }
      } catch (retryError) {
        console.error('Failed to free sessionStorage space:', retryError)
        // Silently fail - the app will work without caching
        return false
      }
    } else {
      console.error('Error storing data in sessionStorage:', error)
    }
    return false
  }
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  
  // Initialize with sessionStorage data if available
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [favorites, setFavorites] = useState<Vehicle[]>([])
  
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false)
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)

  // Load user-specific data when user changes
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      // Load user-specific cached data
      const vehiclesKey = `dashboard_vehicles_${user.id}`
      const favoritesKey = `dashboard_favorites_${user.id}`
      
      try {
        const storedVehicles = sessionStorage.getItem(vehiclesKey)
        const storedFavorites = sessionStorage.getItem(favoritesKey)
        
        if (storedVehicles) {
          const parsed = JSON.parse(storedVehicles)
          setVehicles(parsed)
        }
        if (storedFavorites) {
          const parsed = JSON.parse(storedFavorites)
          setFavorites(parsed)
        }
      } catch (error) {
        console.error('Error loading data from sessionStorage:', error)
        // Clear corrupted data
        sessionStorage.removeItem(vehiclesKey)
        sessionStorage.removeItem(favoritesKey)
      }
    } else {
      // User logged out, clear all data and clean up old sessionStorage entries
      setVehicles([])
      setFavorites([])
      
      // Clean up old sessionStorage entries (optional - prevents accumulation)
      if (typeof window !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.startsWith('dashboard_vehicles_') || key.startsWith('dashboard_favorites_'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key))
      }
    }
  }, [user?.id])

  // Save to user-specific sessionStorage whenever data changes
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const vehiclesKey = `dashboard_vehicles_${user.id}`
      safeSetItem(vehiclesKey, vehicles, MAX_STORED_VEHICLES)
    }
  }, [vehicles, user?.id])

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const favoritesKey = `dashboard_favorites_${user.id}`
      safeSetItem(favoritesKey, favorites, MAX_STORED_VEHICLES)
    }
  }, [favorites, user?.id])

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => 
        vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
      )
    )
  }

  const clearData = () => {
    setVehicles([])
    setFavorites([])
    if (user && typeof window !== 'undefined') {
      const vehiclesKey = `dashboard_vehicles_${user.id}`
      const favoritesKey = `dashboard_favorites_${user.id}`
      sessionStorage.removeItem(vehiclesKey)
      sessionStorage.removeItem(favoritesKey)
    }
  }

  return (
    <DashboardContext.Provider value={{
      vehicles,
      favorites,
      setVehicles,
      setFavorites,
      updateVehicle,
      clearData,
      isLoadingVehicles,
      isLoadingFavorites,
      setIsLoadingVehicles,
      setIsLoadingFavorites
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
