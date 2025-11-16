'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ThemeToggle({ 
  className = '', 
  showLabel = false, 
  size = 'md' 
}: ThemeToggleProps) {
  const { theme, toggleTheme, isLoaded } = useTheme()

  if (!isLoaded) {
    return (
      <div className={`animate-pulse bg-muted rounded-lg ${className}`}>
        <div className="h-5 w-5 bg-muted-foreground/20 rounded" />
      </div>
    )
  }

  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-3'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center rounded-lg 
        hover:bg-accent transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${sizeClasses[size]} ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className={`${iconSizes[size]} text-foreground`} />
      ) : (
        <Sun className={`${iconSizes[size]} text-foreground`} />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  )
}
