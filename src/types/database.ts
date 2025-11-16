export interface DatabaseUser {
  id: string
  email: string
  name: string
  password: string
  role: 'user' | 'admin' | 'superadmin'
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
  phone: string
  lastLogin: Date
}

export interface DatabaseVehicle {
  id: string
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
  images: string
  contactInfo: string
  status: 'pending' | 'approved' | 'rejected'
  userId: string
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  isPremium: boolean
}

export interface DatabaseCountResult {
  total: number
}
