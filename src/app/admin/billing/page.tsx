'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Receipt, 
  CreditCard, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface BillingRecord {
  id: string
  invoiceNumber: string
  customerName: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  dueDate: string
  paymentMethod: string
  description: string
}

export default function BillingHistoryPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

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

    fetchBillingHistory()
  }, [user, isLoading, router])

  const fetchBillingHistory = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from an API
      // For now, using mock data
      const mockData: BillingRecord[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          customerName: 'John Doe',
          amount: 299.99,
          status: 'paid',
          dueDate: '2024-01-15',
          paymentMethod: 'Credit Card',
          description: 'Premium Subscription - Annual'
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          customerName: 'Jane Smith',
          amount: 149.99,
          status: 'pending',
          dueDate: '2024-01-20',
          paymentMethod: 'PayPal',
          description: 'Standard Subscription - Monthly'
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-003',
          customerName: 'Bob Johnson',
          amount: 599.99,
          status: 'overdue',
          dueDate: '2024-01-10',
          paymentMethod: 'Bank Transfer',
          description: 'Enterprise Package - Annual'
        },
        {
          id: '4',
          invoiceNumber: 'INV-2024-004',
          customerName: 'Alice Brown',
          amount: 99.99,
          status: 'paid',
          dueDate: '2024-01-25',
          paymentMethod: 'Credit Card',
          description: 'Basic Subscription - Monthly'
        }
      ]
      
      setBillingRecords(mockData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching billing history:', error)
      toast.error('Failed to fetch billing history')
      setLoading(false)
    }
  }

  const filteredRecords = billingRecords.filter(record => {
    const matchesSearch = record.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'overdue' && new Date(record.dueDate) < new Date()) ||
                       (dateFilter === 'upcoming' && new Date(record.dueDate) > new Date())
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✓'
      case 'pending':
        return '⏳'
      case 'overdue':
        return '⚠'
      case 'cancelled':
        return '✗'
      default:
        return '?'
    }
  }

  const exportBillingData = () => {
    // In a real app, this would generate and download a CSV/PDF
    toast.success('Billing data exported successfully')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading billing history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing History</h1>
          <p className="text-muted-foreground">View and manage all billing records and invoices</p>
        </div>
        <button
          onClick={exportBillingData}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(billingRecords.reduce((sum, record) => sum + (record.status === 'paid' ? record.amount : 0), 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatPrice(billingRecords.filter(r => r.status === 'pending').reduce((sum, record) => sum + record.amount, 0))}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPrice(billingRecords.filter(r => r.status === 'overdue').reduce((sum, record) => sum + record.amount, 0))}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
              <p className="text-2xl font-bold">{billingRecords.length}</p>
            </div>
            <Receipt className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by customer name or invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Dates</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Billing Records Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{record.invoiceNumber}</div>
                    <div className="text-sm text-muted-foreground">{record.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{record.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{formatPrice(record.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      <span className="mr-1">{getStatusIcon(record.status)}</span>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {new Date(record.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{record.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-primary hover:text-primary/80 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No billing records found</p>
          </div>
        )}
      </div>
    </div>
  )
}
