'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Shield, 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'superadmin'
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
  phone?: string
}

export default function AdminAdminsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all'
  })
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'superadmin') {
      router.push('/admin')
      toast.error('Access denied. Super admin privileges required.')
      return
    }

    fetchAdmins()
  }, [user, router])

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins || [])
      } else {
        toast.error('Failed to load admin users')
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('Failed to load admin users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (adminId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/admins/toggle-block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminId, block: !currentStatus })
      })

      if (response.ok) {
        toast.success(`Admin ${currentStatus ? 'activated' : 'blocked'} successfully`)
        fetchAdmins()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update admin status')
      }
    } catch (error) {
      console.error('Error updating admin status:', error)
      toast.error('Failed to update admin status')
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('admin/admins/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminId })
      })

      if (response.ok) {
        toast.success('Admin deleted successfully')
        fetchAdmins()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete admin')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('Failed to delete admin')
    }
  }

  const handleViewAdmin = (adminId: string) => {
    router.push(`/admin/admins/${adminId}`)
  }

  const handleEditAdmin = (adminId: string) => {
    router.push(`/admin/admins/${adminId}/edit`)
  }

  // Filter admins based on current filters and search
  const filteredAdmins = admins.filter(admin => {
    const matchesRole = filters.role === 'all' || admin.role === filters.role
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && !admin.isBlocked) ||
      (filters.status === 'blocked' && admin.isBlocked)
    const matchesSearch = searchQuery === '' || 
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesRole && matchesStatus && matchesSearch
  })

  // Pagination calculations
  const totalItems = filteredAdmins.length
  const totalPages = Math.ceil(totalItems / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedAdmins = filteredAdmins.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Management</h1>
            <p className="text-muted-foreground">Manage administrator accounts and permissions</p>
            {user?.role === 'superadmin' && (
              <div className="flex items-center space-x-1 mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium w-fit">
                <Shield className="h-3 w-3" />
                <span>Super Admin Access</span>
              </div>
            )}
          </div>
        </div>
        {user?.role === 'superadmin' && (
          <Link
            href="/admin/admins/add"
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Admin</span>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Super Admins</p>
              <p className="text-2xl font-bold text-yellow-600">{admins.filter(a => a.role === 'superadmin').length}</p>
            </div>
            <Shield className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Administrators</p>
              <p className="text-2xl font-bold text-blue-600">{admins.filter(a => a.role === 'admin').length}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{admins.filter(a => !a.isBlocked).length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Blocked Users</p>
              <p className="text-2xl font-bold text-red-600">{admins.filter(a => a.isBlocked).length}</p>
            </div>
            <UserX className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Administrator</option>
                <option value="user">Regular User</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Admins Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading admins...</span>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No admins found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Admin</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdmins.map((admin) => (
                  <tr key={admin.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{admin.name}</div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${admin.role === 'superadmin' ? 'bg-yellow-100 text-yellow-800' : 
                          admin.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                      `}>
                        {admin.role === 'superadmin' ? 'Super Admin' : 
                         admin.role === 'admin' ? 'Administrator' : 'Regular User'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${admin.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                      `}>
                        {admin.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewAdmin(admin.id)}
                          className="flex items-center justify-center p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditAdmin(admin.id)}
                          className="flex items-center justify-center p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        
                        {/* Toggle Block Button - Cannot block super admins */}
                        {admin.role !== 'superadmin' && (
                          <button
                            onClick={() => handleToggleBlock(admin.id, admin.isBlocked)}
                            className={`flex items-center justify-center p-2 rounded ${
                              admin.isBlocked 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title={admin.isBlocked ? 'Activate Admin' : 'Block Admin'}
                          >
                            {admin.isBlocked ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          </button>
                        )}
                        
                        {/* Delete Button - Only super admins can delete, and cannot delete other super admins */}
                        {user?.role === 'superadmin' && admin.role !== 'superadmin' && (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                            className="flex items-center justify-center p-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                            title="Delete Admin"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                        
                        {/* Cannot delete super admin message */}
                        {user?.role === 'superadmin' && admin.role === 'superadmin' && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            Cannot delete super admin
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalItems > 0 && (
        <div className="bg-card border border-t-0 rounded-b-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Results Summary & Rows per Page */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} admins
              </div>
              
              {/* Rows per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-muted-foreground">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State for No Results */}
      {totalItems === 0 && !loading && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          No admins match your current filters
        </div>
      )}
    </div>
  )
}
