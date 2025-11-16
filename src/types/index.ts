// User interface for frontend (without password for security)
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'superadmin'
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
  phone?: string
  lastLogin?: Date
}

// Database User interface (includes password for backend operations)
export interface DatabaseUser {
  id: string
  email: string
  name: string
  password: string
  role: 'user' | 'admin' | 'superadmin'
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
  phone?: string
  lastLogin?: Date
}

// Vehicle image interface for the separate images table
export interface VehicleImage {
  id: number
  vehicleId: number
  imageData: string
  fileName?: string
  mimeType?: string
  fileSize?: number
  sortOrder: number
  uploadedAt: Date
}

// Notification interface
export interface Notification {
  id: string
  userId: string
  type: 'vehicle_approved' | 'vehicle_rejected' | 'general' | 'subscription' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
  relatedEntityType?: string
  relatedEntityId?: string
}

// Vehicle interface matching the database schema
export interface Vehicle {
  id: number
  title: string
  brand: string
  model: string
  year: number
  price: number
  type: 'car' | 'bike' | 'van' | 'truck' | 'other'
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other'
  transmission: 'manual' | 'automatic' | 'cvt'
  condition: 'USED' | 'BRANDNEW' | 'REFURBISHED'
  mileage: number
  description: string
  images: VehicleImage[] | string[]  // Array of VehicleImage objects or legacy string array
  contactInfo: {    // Parsed from JSON string in database
    phone: string
    email: string
    location: string
  }
  status: 'pending' | 'approved' | 'rejected'
  userId: string
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date  // When the vehicle was approved
  isPremium: boolean  // Premium vehicles appear first
  // Optional fields added when joining with other tables
  user?: User  // Added when joining with users table
  isPremiumUser?: boolean  // Added when checking subscription status
}

// Vehicle interface for database operations (raw database format)
export interface DatabaseVehicle {
  id: number
  title: string
  brand: string
  model: string
  year: number
  price: number
  type: 'car' | 'bike' | 'van' | 'truck' | 'other'
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other'
  transmission: 'manual' | 'automatic' | 'cvt'
  condition: 'USED' | 'BRANDNEW' | 'REFURBISHED'
  mileage: number
  description: string
  images: string       // JSON string in database
  contactInfo: string  // JSON string in database
  status: 'pending' | 'approved' | 'rejected'
  userId: string
  createdAt: Date
  updatedAt: Date
  isPremium: boolean
}

export interface VehicleFormData {
  title: string
  brand: string
  model: string
  year: number
  price: number
  type: 'car' | 'bike' | 'van' | 'truck' | 'other'
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other'
  transmission: 'manual' | 'automatic' | 'cvt'
  condition: 'USED' | 'BRANDNEW' | 'REFURBISHED'
  mileage: number
  description: string
  contactInfo: {
    phone: string
    email: string
    location: string
  }
}

export interface SearchFilters {
  query: string
  type: string
  minPrice: number | null
  maxPrice: number | null
  minYear: number | null
  maxYear: number | null
  fuelType: string
  transmission: string
  condition: string
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high'
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  updateUser: (updatedUserData: Partial<User>) => void
  isLoading: boolean
}

