'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Settings, 
  Database, 
  FileText, 
  HardDrive,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemSettings {
  maintenanceMode: boolean
  debugMode: boolean
  maxFileSize: number
  sessionTimeout: number
  backupFrequency: string
  logLevel: string
}

export default function SystemSettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    debugMode: false,
    maxFileSize: 10,
    sessionTimeout: 30,
    backupFrequency: 'daily',
    logLevel: 'info'
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'superadmin') {
      router.push('/admin')
      toast.error('Access denied. Super admin privileges required.')
      return
    }

    fetchSystemSettings()
  }, [user, isLoading, router])

  const fetchSystemSettings = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from an API
      // For now, using mock data
      setLoading(false)
    } catch (error) {
      console.error('Error fetching system settings:', error)
      toast.error('Failed to fetch system settings')
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, this would save to an API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('System settings saved successfully')
      setSaving(false)
    } catch (error) {
      console.error('Error saving system settings:', error)
      toast.error('Failed to save system settings')
      setSaving(false)
    }
  }

  const handleRefresh = () => {
    fetchSystemSettings()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading system settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Advanced system configuration for super administrators</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>General Settings</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Maintenance Mode</label>
                <p className="text-xs text-muted-foreground">Put the system in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Debug Mode</label>
                <p className="text-xs text-muted-foreground">Enable debug logging</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) => setSettings({...settings, debugMode: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium">Max File Size (MB)</label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                className="mt-1 w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                className="mt-1 w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min="5"
                max="480"
              />
            </div>
          </div>
        </div>

        {/* Backup & Logging */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Backup & Logging</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Backup Frequency</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Log Level</label>
              <select
                value={settings.logLevel}
                onChange={(e) => setSettings({...settings, logLevel: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>System Status</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Database</p>
              <p className="text-sm text-green-600">Connected</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">File System</p>
              <p className="text-sm text-green-600">Healthy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Memory Usage</p>
              <p className="text-sm text-green-600">45%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">Important Notice</h3>
            <p className="text-sm text-yellow-700">
              Changes to system settings may affect the entire application. Please ensure you understand the implications before saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
