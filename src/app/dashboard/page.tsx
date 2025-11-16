'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboard, DashboardProvider } from '@/contexts/DashboardContext'
import Navigation from '@/components/Navigation'
import VehicleCard from '@/components/VehicleCard'
import { Plus, User, Heart, Settings, Car, LogOut, Loader2, Edit, Trash2, Eye, Crown, Star, Zap, Check } from 'lucide-react'
import { Vehicle } from '@/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'
import PaymentModal from '@/components/PaymentModal'
import SubscriptionExceededModal from '@/components/SubscriptionExceededModal'
import { showConfirmDialog, showSuccessDialog, showErrorDialog } from '@/lib/sweetalert'
import { apiFetch } from '@/lib/api-client'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading, logout, updateUser } = useAuth()
  const { 
    vehicles, 
    favorites, 
    setVehicles, 
    setFavorites, 
    isLoadingVehicles, 
    isLoadingFavorites, 
    setIsLoadingVehicles, 
    setIsLoadingFavorites 
  } = useDashboard()
  const [activeTab, setActiveTab] = useState<'vehicles' | 'favorites' | 'profile'>('favorites')
  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([])
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showSubscriptionExceeded, setShowSubscriptionExceeded] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState<{
    planType?: string
    subscriptionId?: string
    isAutoCancelled?: boolean
  }>({})

  useEffect(() => {
    // Wait for auth to be loaded
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab')
    if (tabParam === 'vehicles' || tabParam === 'favorites' || tabParam === 'profile') {
      setActiveTab(tabParam)
    }

    // Fetch subscription data and favorites immediately when user logs in
    fetchSubscriptionData()
    fetchFavorites()
  }, [user, isLoading, router, searchParams])

  // Check for auto-cancellation on page load
  useEffect(() => {
    if (user) {
      // Clean up old popup flags first
      cleanupOldPopupFlags()
      
      // Check if user just came from posting a vehicle
      const justPostedVehicle = sessionStorage.getItem('justPostedVehicle')
      if (justPostedVehicle) {
        // Clear the flag
        sessionStorage.removeItem('justPostedVehicle')
        // Check for auto-cancellation
        checkForAutoCancellation()
      }
    }
  }, [user])

  // Clean up old popup flags
  const cleanupOldPopupFlags = () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('popup_shown_')) {
        const timestamp = localStorage.getItem(key + '_timestamp')
        if (timestamp && parseInt(timestamp) < oneHourAgo) {
          localStorage.removeItem(key)
          localStorage.removeItem(key + '_timestamp')
        }
      }
    })
  }

  // Fetch vehicles when switching to vehicles tab
  useEffect(() => {
    if (user && !isLoading && activeTab === 'vehicles' && vehicles.length === 0) {
      fetchUserVehicles()
    }
  }, [activeTab, user, isLoading, vehicles.length])

  // Fetch favorites when switching to favorites tab
  useEffect(() => {
    if (user && !isLoading && activeTab === 'favorites' && favorites.length === 0) {
      fetchFavorites()
    }
  }, [activeTab, user, isLoading, favorites.length])

  const fetchUserVehicles = async (retryCount = 0) => {
    if (!user) {
      console.log('fetchUserVehicles: No user, skipping')
      return
    }

    console.log('fetchUserVehicles: Starting fetch for user:', user.id, retryCount > 0 ? `(retry ${retryCount})` : '')
    setIsLoadingVehicles(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('fetchUserVehicles: No token found')
        toast.error('Authentication token not found. Please log in again.')
        return
      }

      console.log('fetchUserVehicles: Making API call to /api/vehicles?myPosts=true')
      const response = await apiFetch('vehicles?myPosts=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('fetchUserVehicles: Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched vehicles:', data.vehicles)
        console.log('Vehicle premium statuses:', data.vehicles?.map((v: any) => ({ id: v.id, isPremium: v.isPremium, type: typeof v.isPremium })))
        setVehicles(data.vehicles || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch vehicles:', response.status, response.statusText, errorData)
        
        // If it's a 500 error and we haven't retried yet, try again after a short delay
        if (response.status === 500 && retryCount < 2) {
          console.log('fetchUserVehicles: 500 error, retrying in 1 second...')
          setTimeout(() => {
            fetchUserVehicles(retryCount + 1)
          }, 1000)
          return
        }
        
        toast.error(`Failed to fetch your vehicles: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      
      // If it's a network error and we haven't retried yet, try again after a short delay
      if (retryCount < 2) {
        console.log('fetchUserVehicles: Network error, retrying in 1 second...')
        setTimeout(() => {
          fetchUserVehicles(retryCount + 1)
        }, 1000)
        return
      }
      
      toast.error('Failed to fetch your vehicles. Please try again.')
    } finally {
      setIsLoadingVehicles(false)
    }
  }

  const fetchFavorites = async () => {
    if (!user) return

    setIsLoadingFavorites(true)
    try {
      const token = localStorage.getItem('token')
      const response = await apiFetch('favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      } else {
        toast.error('Failed to fetch favorites')
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast.error('Failed to fetch favorites')
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  const handleRemoveFavorite = async (vehicleId: string) => {
    const result = await showConfirmDialog(
      'Remove from Favorites',
      'Are you sure you want to remove this vehicle from your favorites?',
      'Yes, Remove',
      'Cancel'
    )
    if (!result.isConfirmed) return

    try {
      const token = localStorage.getItem('token')
      const response = await apiFetch(`favorites?vehicleId=${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await showSuccessDialog('Removed from Favorites', 'This vehicle has been removed from your favorites.')
        fetchFavorites() // Refresh the favorites list
      } else {
        await showErrorDialog('Error', 'Failed to remove from favorites. Please try again.')
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      await showErrorDialog('Error', 'Failed to remove from favorites. Please try again.')
    }
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    const result = await showConfirmDialog(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle? This action cannot be undone.',
      'Yes, Delete',
      'Cancel'
    )
    if (!result.isConfirmed) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await showSuccessDialog('Vehicle Deleted', 'Your vehicle has been deleted successfully.')
        fetchUserVehicles() // Refresh the list
      } else {
        const data = await response.json()
        await showErrorDialog('Error', data.error || 'Failed to delete vehicle. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      await showErrorDialog('Error', 'Failed to delete vehicle. Please try again.')
    }
  }

  const handleEditVehicle = (vehicleId: number) => {
    router.push(`/dashboard/edit/${vehicleId}`)
  }

  const handleViewVehicle = (vehicleId: number) => {
    router.push(`/vehicles/${vehicleId}`)
  }

  const handleRefreshVehicles = () => {
    fetchUserVehicles()
  }

  const handleRefreshFavorites = () => {
    fetchFavorites()
  }

  const fetchSubscriptionData = async () => {
    if (!user) return

    setLoadingSubscription(true)
    try {
      const token = localStorage.getItem('token')
      
      // Fetch user's subscription status
      const subscriptionResponse = await apiFetch('subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        console.log('Subscription data:', subscriptionData)
        setSubscription(subscriptionData)
      } else {
        console.log('Subscription response not ok:', subscriptionResponse.status)
      }

      // Fetch available subscription plans
      const plansResponse = await apiFetch('subscriptions/plans')
      console.log('Plans response status:', plansResponse.status)
      
      if (plansResponse.ok) {
        const plansData = await plansResponse.json()
        console.log('Plans data:', plansData)
        setSubscriptionPlans(plansData.plans || [])
      } else {
        console.log('Plans response not ok:', plansResponse.status)
        const errorText = await plansResponse.text()
        console.log('Plans error:', errorText)
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      toast.error('Failed to load subscription information')
    } finally {
      setLoadingSubscription(false)
    }
  }

  const checkForAutoCancellation = async () => {
    if (!user) return

    try {
      // Check if there's a recently cancelled subscription
      const token = localStorage.getItem('token')
      const response = await apiFetch('subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const subscriptionData = await response.json()
        console.log('Subscription data from API:', subscriptionData)
        
        // Check if subscription is cancelled and recently cancelled (within last 10 minutes)
        if (subscriptionData && subscriptionData.subscription && subscriptionData.subscription.status === 'cancelled') {
          const cancelledAt = new Date(subscriptionData.subscription.cancelledAt)
          const now = new Date()
          const timeDiff = now.getTime() - cancelledAt.getTime()
          const minutesDiff = timeDiff / (1000 * 60)
          
          // Only show popup if cancelled within last 2 minutes (very recent)
          if (minutesDiff <= 2) {
            // Check if we've already shown the popup for this cancellation
            const popupShownKey = `popup_shown_${subscriptionData.subscription.id}`
            const popupAlreadyShown = localStorage.getItem(popupShownKey)
            
            if (!popupAlreadyShown) {
              console.log('Found recently cancelled subscription, showing popup:', subscriptionData.subscription)
              setSubscriptionError({
                planType: subscriptionData.subscription.planType,
                subscriptionId: subscriptionData.subscription.id,
                isAutoCancelled: true
              })
              setShowSubscriptionExceeded(true)
              
              // Mark that we've shown the popup for this cancellation
              localStorage.setItem(popupShownKey, 'true')
              localStorage.setItem(popupShownKey + '_timestamp', Date.now().toString())
            } else {
              console.log('Popup already shown for this cancellation')
            }
          } else {
            console.log('Subscription cancelled too long ago, not showing popup')
          }
        } else {
          console.log('No cancelled subscription found. Status:', subscriptionData?.subscription?.status)
        }
      } else {
        console.log('Failed to fetch subscription data:', response.status)
      }
    } catch (error) {
      console.error('Error checking for auto-cancellation:', error)
    }
  }

  const handleSubscribe = (planId: string) => {
    if (!user) {
      toast.error('Please log in to subscribe')
      return
    }

    const plan = subscriptionPlans.find(p => p.id === planId)
    if (plan) {
      setSelectedPlan(plan)
      setShowPaymentModal(true)
    }
  }

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!user || !selectedPlan) return

    setSubscribing(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await apiFetch('subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod: 'card',
          transactionId: transactionId
        })
      })

      if (response.ok) {
        toast.success('Subscription activated successfully! Your vehicles will now appear at the top of listings.')
        fetchSubscriptionData() // Refresh subscription data
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setSubscribing(false)
      setShowPaymentModal(false)
      setSelectedPlan(null)
    }
  }


  const handleCancelSubscription = async () => {
    if (!user) {
      toast.error('Please log in to cancel subscription')
      return
    }

    const result = await showConfirmDialog(
      'Cancel Subscription',
      'Are you sure you want to cancel your premium subscription? You will lose access to premium features and your vehicles will no longer be prioritized in listings.',
      'Yes, Cancel',
      'Keep Subscription'
    )

    if (!result.isConfirmed) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await apiFetch('subscriptions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await showSuccessDialog(
          'Subscription Cancelled',
          'Your premium subscription has been cancelled successfully. You can resubscribe anytime from your profile.'
        )
        fetchSubscriptionData() // Refresh subscription data
      } else {
        const error = await response.json()
        await showErrorDialog(
          'Cancellation Failed',
          error.error || 'Failed to cancel subscription. Please try again.'
        )
      }
    } catch (error) {
      console.error('Cancellation error:', error)
      await showErrorDialog(
        'Cancellation Failed',
        'Failed to cancel subscription. Please try again.'
      )
    }
  }

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show access denied if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Please log in to access your dashboard.</p>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionExceeded(false)
    setSubscriptionError({})
    
    // Clean up old popup flags (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('popup_shown_')) {
        const timestamp = localStorage.getItem(key + '_timestamp')
        if (timestamp && parseInt(timestamp) < oneHourAgo) {
          localStorage.removeItem(key)
          localStorage.removeItem(key + '_timestamp')
        }
      }
    })
  }

  const handleRenewSubscription = () => {
    setShowSubscriptionExceeded(false)
    setSubscriptionError({})
    // Navigate to subscription page or show subscription plans
    router.push('/subscription')
  }

  const handleUpgradePlan = () => {
    setShowSubscriptionExceeded(false)
    setSubscriptionError({})
    // Navigate to subscription page or show subscription plans
    router.push('/subscription')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-3">
              {subscription?.hasActiveSubscription ? (
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg">
                  <Crown className="h-4 w-4" />
                  <span>Premium Active</span>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  <Crown className="h-4 w-4" />
                  <span>Upgrade to Premium</span>
                </button>
              )}
              <Link
                href="/dashboard/post"
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap w-fit"
              >
                <Plus className="h-4 w-4" />
                <span>Post Vehicle</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'vehicles'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Car className="h-4 w-4" />
              <span>My Vehicles</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'profile'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card rounded-lg border p-6">
          {activeTab === 'vehicles' && (
            <div>
              {/* Premium Upgrade Banner - Show only if user doesn't have active subscription */}
              {!isLoadingVehicles && !subscription?.hasActiveSubscription && (
                <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Upgrade to Premium</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Get your vehicles featured at the top of search results
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium"
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              )}

              {isLoadingVehicles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading your vehicles...</span>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Vehicles Posted Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by posting your first vehicle for sale.
                  </p>
                  <Link
                    href="/dashboard/post"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Post Your First Vehicle
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">My Vehicles ({vehicles.length})</h3>
                    <button
                      onClick={handleRefreshVehicles}
                      disabled={isLoadingVehicles}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Loader2 className={`h-4 w-4 ${isLoadingVehicles ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    {/* <Link
                      href="/dashboard/post"
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Post New Vehicle</span>
                    </Link> */}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Vehicle Card */}
                        <div className="relative">
                          <VehicleCard vehicle={vehicle} variant="grid" showPremiumBadge={false} fromSection="my-vehicles" />
                          
           {/* Top Left Badges - Premium and Status stacked vertically */}
           <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
             {/* Test: Show premium badge for vehicles with id 8 or 9 */}
             {(vehicle.id === 8 || vehicle.id === 9) ? (
               <div className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                 <Crown className="h-3 w-3" />
                 <span>TEST PREMIUM</span>
               </div>
             ) : (() => {
               console.log(`Vehicle ${vehicle.id} (${vehicle.title}): isPremium = ${vehicle.isPremium}, type = ${typeof vehicle.isPremium}`)
               return vehicle.isPremium
             })() ? (
               /* Premium + Status Badges stacked */
               <>
                 <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                   <Crown className="h-3 w-3" />
                   <span>Premium</span>
                 </div>
                 <span
                   className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                     vehicle.status === 'approved'
                       ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                       : vehicle.status === 'pending'
                       ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                       : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                   }`}
                 >
                   {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                 </span>
               </>
             ) : (
               /* Status Badge when no premium */
               <span
                 className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                   vehicle.status === 'approved'
                     ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                     : vehicle.status === 'pending'
                     ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                     : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                 }`}
               >
                 {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
               </span>
             )}
           </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="p-4 border-t bg-muted/30">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleViewVehicle(vehicle.id)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            
                            {vehicle.status === 'pending' && (
                              <button
                                onClick={() => handleEditVehicle(vehicle.id)}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">My Favorites</h2>
                  <p className="text-muted-foreground">Your saved vehicles</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefreshFavorites}
                    disabled={isLoadingFavorites}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Loader2 className={`h-4 w-4 ${isLoadingFavorites ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Browse More
                  </Link>
                </div>
              </div>

              {isLoadingFavorites ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading favorites...</span>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse vehicles and add them to your favorites.
                  </p>
                  <Link
                    href="/"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Browse Vehicles
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favorites.map((vehicle) => (
                    <div key={vehicle.id} className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <VehicleCard 
                        vehicle={vehicle} 
                        variant="grid" 
                        showPremiumBadge={true}
                        isFavorited={true}
                        fromSection="favorites"
                        onFavoriteToggle={(vehicleId, isFavorited) => {
                          if (!isFavorited) {
                            handleRemoveFavorite(vehicleId)
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mt-1">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Account Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Member Since</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Premium Subscription Section */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Premium Subscription</h3>
                    <p className="text-muted-foreground">Boost your vehicle listings with premium features</p>
                  </div>
                </div>

                {loadingSubscription ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading subscription information...</span>
                  </div>
                ) : subscription?.hasActiveSubscription ? (
                  /* Current Subscription Status */
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-start sm:items-center space-x-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                          <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                            {subscription.subscription?.planName}
                          </h4>
                          <p className="text-green-700 dark:text-green-300 text-sm sm:text-base">
                            Active until {new Date(subscription.subscription?.endDate || '').toLocaleDateString()}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Your vehicles are now prioritized in listings!
                          </p>
                          <div className="mt-2 p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              Posts Remaining: {subscription.subscription?.postCount || 0}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              You can post {subscription.subscription?.postCount || 0} more vehicles with premium features
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleCancelSubscription}
                        className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base font-medium"
                      >
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Subscription Plans */
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">Upgrade to Premium</h4>
                      <p className="text-muted-foreground mb-6">
                        Get your vehicles featured at the top of search results and listings
                      </p>
                    </div>

                    {subscriptionPlans.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                          <Crown className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <h5 className="text-lg font-semibold mb-2">Subscription Plans Loading...</h5>
                          <p className="text-muted-foreground mb-4">
                            Please wait while we load the available subscription plans.
                          </p>
                          <button
                            onClick={fetchSubscriptionData}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Retry Loading Plans
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {subscriptionPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                            plan.planType === 'pro' 
                              ? 'border-yellow-400 dark:border-yellow-500 relative' 
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {plan.planType === 'pro' && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                🔥 HOT ITEM
                              </span>
                            </div>
                          )}
                          
                          <div className="text-center mb-6">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                              plan.planType === 'pro' 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
                                : plan.planType === 'premium'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                                : 'bg-gradient-to-r from-gray-500 to-gray-600'
                            }`}>
                              {plan.planType === 'pro' ? (
                                <Crown className="h-6 w-6 text-white" />
                              ) : plan.planType === 'premium' ? (
                                <Zap className="h-6 w-6 text-white" />
                              ) : (
                                <Star className="h-6 w-6 text-white" />
                              )}
                            </div>
                            
                            <h5 className="text-lg font-semibold mb-2">{plan.name}</h5>
                            
                            <div className="mb-4">
                              <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                            </div>
                            
                            {plan.planType === 'pro' && (
                              <p className="text-yellow-600 dark:text-yellow-400 font-medium text-sm">
                                🔥 Most Popular Choice
                              </p>
                            )}
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {plan.postCount} Vehicle Posts
                              </span>
                            </div>
                            {plan.features.map((feature: string, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={subscribing}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                              plan.planType === 'pro'
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white'
                                : plan.planType === 'premium'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {subscribing ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Processing...</span>
                              </div>
                            ) : (
                              `Subscribe ${plan.name}`
                            )}
                          </button>
                        </div>
                      ))}
                      </div>
                    )}

                    {/* Benefits Section */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                      <h5 className="text-lg font-semibold mb-4 text-center">Why Choose Premium?</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg mb-3">
                            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h6 className="font-medium mb-1">Priority Placement</h6>
                          <p className="text-sm text-muted-foreground">
                            Your vehicles appear at the top of search results
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg mb-3">
                            <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <h6 className="font-medium mb-1">Enhanced Visibility</h6>
                          <p className="text-sm text-muted-foreground">
                            Get more views and engagement on your listings
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg mb-3">
                            <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h6 className="font-medium mb-1">Premium Support</h6>
                          <p className="text-sm text-muted-foreground">
                            Get priority customer support
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedPlan(null)
          }}
          plan={selectedPlan}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Subscription Exceeded Modal */}
      <SubscriptionExceededModal
        isOpen={showSubscriptionExceeded}
        onClose={handleCloseSubscriptionModal}
        onRenewSubscription={handleRenewSubscription}
        onUpgradePlan={handleUpgradePlan}
        planType={subscriptionError.planType}
        subscriptionId={subscriptionError.subscriptionId}
        isAutoCancelled={subscriptionError.isAutoCancelled}
      />

    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}
