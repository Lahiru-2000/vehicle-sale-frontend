'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PermissionsProvider } from '@/contexts/PermissionsContext'
import AdminLayoutContent from './AdminLayoutContent'
import toast from 'react-hot-toast'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/dashboard')
      toast.error('Access denied. Admin privileges required.')
      return
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }

  return (
    <PermissionsProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </PermissionsProvider>
  )
}