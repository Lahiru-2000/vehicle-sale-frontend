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
      
      const storedVehicles = sessionStorage.getItem(vehiclesKey)
      const storedFavorites = sessionStorage.getItem(favoritesKey)
      
      if (storedVehicles) {
        setVehicles(JSON.parse(storedVehicles))
      }
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
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
      sessionStorage.setItem(vehiclesKey, JSON.stringify(vehicles))
    }
  }, [vehicles, user?.id])

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const favoritesKey = `dashboard_favorites_${user.id}`
      sessionStorage.setItem(favoritesKey, JSON.stringify(favorites))
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
