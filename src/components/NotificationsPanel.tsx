'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Bell, CheckCircle, Car, AlertCircle, Info, Loader2, Mail, Crown, RefreshCw } from 'lucide-react'
import { Notification } from '@/types'
import toast from 'react-hot-toast'
import { formatDistanceToNow, format } from 'date-fns'

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [markingAsRead, setMarkingAsRead] = useState(false)

  const fetchNotifications = useCallback(async (currentPage: number) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch(`notifications?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      setNotifications(data.notifications)
      setTotalPages(data.pagination.totalPages)
      setTotalNotifications(data.pagination.total)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(page)
    }
  }, [isOpen, page, fetchNotifications])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const refreshNotifications = useCallback(() => {
    fetchNotifications(page)
  }, [fetchNotifications, page])

  const markAsRead = useCallback(async (notificationId?: string) => {
    try {
      setMarkingAsRead(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          notificationId 
            ? { notificationIds: [notificationId] }
            : { markAll: true }
        )
      })

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read')
      }

      // Refresh notifications
      await fetchNotifications(page)
      toast.success(notificationId ? 'Notification marked as read' : 'All notifications marked as read')
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      toast.error('Failed to mark notifications as read')
    } finally {
      setMarkingAsRead(false)
    }
  }, [fetchNotifications, page])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'vehicle_approved': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'vehicle_rejected': return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'subscription': return <Crown className="h-5 w-5 text-yellow-500" />
      case 'system': return <Info className="h-5 w-5 text-blue-500" />
      case 'general': return <Bell className="h-5 w-5 text-gray-500" />
      default: return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black bg-opacity-60"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-11/12 max-w-lg max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications 
            {totalNotifications > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                {totalNotifications}
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={refreshNotifications}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh notifications"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Close notifications"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 flex justify-end space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => markAsRead()}
            disabled={markingAsRead || notifications.filter(n => !n.isRead).length === 0}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {markingAsRead ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            <span>Mark All as Read</span>
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-grow overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No notifications</h3>
              <p className="text-gray-500 dark:text-gray-500">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {notifications.map(notification => (
                <li 
                  key={notification.id} 
                  className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-200 border ${
                    notification.isRead 
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className={`font-semibold text-lg ${
                        notification.isRead 
                          ? 'text-gray-600 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium disabled:opacity-50"
                          disabled={markingAsRead}
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                    <p className={`text-sm mt-2 leading-relaxed ${
                      notification.isRead 
                        ? 'text-gray-500 dark:text-gray-500' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                      {format(new Date(notification.createdAt), 'MMM dd, yyyy \'at\' h:mm a', { timeZone: 'Asia/Colombo' })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex items-center justify-between">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
