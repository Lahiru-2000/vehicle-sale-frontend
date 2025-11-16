'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [user, router])

  if (!user || user.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">View detailed reports and analytics data</p>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">$45,230</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Users</p>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
              <p className="text-sm text-blue-600">+8.2% from last month</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vehicles Sold</p>
              <p className="text-2xl font-bold text-purple-600">567</p>
              <p className="text-sm text-purple-600">+15.3% from last month</p>
            </div>
            <Car className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-600">3.2%</p>
              <p className="text-sm text-orange-600">+0.5% from last month</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p>Revenue chart will be displayed here</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2" />
              <p>User growth chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">New vehicle listing approved - Toyota Camry 2022</span>
            <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm">New user registered - john.doe@example.com</span>
            <span className="text-xs text-muted-foreground ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm">Vehicle sold - Honda Civic 2021</span>
            <span className="text-xs text-muted-foreground ml-auto">6 hours ago</span>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Advanced Analytics Coming Soon</h4>
            <p className="text-sm text-blue-700">
              We're working on advanced analytics features including detailed charts, 
              exportable reports, and real-time data visualization.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
