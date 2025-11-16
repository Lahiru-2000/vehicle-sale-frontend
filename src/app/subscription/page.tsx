'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureSettings } from '@/hooks/useFeatureSettings'
import Navigation from '@/components/Navigation'
import { Crown, Check, Star, CreditCard, Calendar, Zap, Shield, BarChart3, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import PaymentModal from '@/components/PaymentModal'
import { formatPrice } from '@/lib/utils'

interface SubscriptionPlan {
  id: string
  name: string
  planType: 'monthly' | 'yearly'
  price: number
  durationMonths: number
  features: string[]
  isActive: boolean
}

interface UserSubscription {
  hasActiveSubscription: boolean
  subscription: {
    id: string
    planType: string
    status: string
    startDate: string
    endDate: string
    price: number
    planName: string
    planFeatures: string[]
  } | null
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { features, loading: featuresLoading } = useFeatureSettings()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPlans()
      fetchUserSubscription()
    }
  }, [user])

  const fetchPlans = async () => {
    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('subscriptions/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      } else {
        toast.error('Failed to load subscription plans')
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Failed to load subscription plans')
    }
  }

  const fetchUserSubscription = async () => {
    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = (planId: string) => {
    if (!user) {
      toast.error('Please log in to subscribe')
      return
    }

    if (!features.proPlanActivation) {
      toast.error('Pro plan activation is currently disabled')
      return
    }

    const plan = plans.find(p => p.id === planId)
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
      
      const { apiFetch } = await import('@/lib/api-client')
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
        fetchUserSubscription() // Refresh subscription status
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

    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('subscriptions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Subscription cancelled successfully')
        fetchUserSubscription() // Refresh subscription status
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancellation error:', error)
      toast.error('Failed to cancel subscription. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Please log in to view subscriptions</h1>
            <Link href="/login" className="btn btn-primary">Log In</Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading || featuresLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading subscription plans...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show disabled message if pro plan activation is disabled
  if (!features.proPlanActivation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-8">
              <AlertCircle className="h-16 w-16 text-orange-600 dark:text-orange-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-4">
                Pro Plan Activation Disabled
              </h1>
              <p className="text-orange-700 dark:text-orange-300 mb-6 text-lg">
                Pro plan activation is currently disabled. Please check back later or contact support for assistance.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Premium Subscriptions</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">Boost your vehicle listings with premium features</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Subscription Status */}
        {userSubscription?.hasActiveSubscription && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                      {userSubscription.subscription?.planName}
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      Active until {new Date(userSubscription.subscription?.endDate || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                plan.planType === 'yearly' 
                  ? 'border-yellow-400 dark:border-yellow-500 relative' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.planType === 'yearly' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                  plan.planType === 'yearly' 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  {plan.planType === 'yearly' ? (
                    <Crown className="h-8 w-8 text-white" />
                  ) : (
                    <Zap className="h-8 w-8 text-white" />
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 ml-2">
                    /{plan.planType === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                
                {plan.planType === 'yearly' && (
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Save 20% compared to monthly
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={userSubscription?.hasActiveSubscription}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                  plan.planType === 'yearly'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {userSubscription?.hasActiveSubscription ? (
                  'Already Subscribed'
                ) : (
                  `Subscribe ${plan.planType === 'yearly' ? 'Yearly' : 'Monthly'}`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
              Why Choose Premium?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Priority Placement
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Your vehicles appear at the top of search results and listings
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Enhanced Visibility
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Get more views and engagement on your vehicle listings
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Premium Support
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Get priority customer support and faster response times
                </p>
              </div>
            </div>
          </div>
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
    </div>
  )
}
