import pool from './db'

export interface AdminPermission {
  feature: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
}

export interface AdminUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'superadmin'
  isBlocked: boolean
}

export async function getAdminPermissions(adminId: number): Promise<AdminPermission[]> {
  const connection = await pool.connect()
  
  try {
    const result = await connection.request()
      .input('adminId', adminId)
      .query(`
        SELECT 
          feature,
          canView,
          canCreate,
          canEdit,
          canDelete,
          canApprove
        FROM admin_permissions 
        WHERE adminId = @adminId
      `)

    return result.recordset.map((row: any) => ({
      feature: row.feature,
      canView: row.canView === 1,
      canCreate: row.canCreate === 1,
      canEdit: row.canEdit === 1,
      canDelete: row.canDelete === 1,
      canApprove: row.canApprove === 1
    }))
  } finally {
    // MS SQL Server connections are automatically returned to the pool
  }
}

export async function getAdminUser(adminId: number): Promise<AdminUser | null> {
  const connection = await pool.connect()
  
  try {
    const result = await connection.request()
      .input('adminId', adminId)
      .query(`
        SELECT 
          id,
          email,
          name,
          role,
          isBlocked
        FROM users 
        WHERE id = @adminId AND role IN ('admin', 'superadmin')
      `)

    if (result.recordset.length === 0) {
      return null
    }

    const row = result.recordset[0]
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      isBlocked: row.isBlocked === 1
    }
  } finally {
    // MS SQL Server connections are automatically returned to the pool
  }
}

export async function checkPermission(
  adminId: number, 
  feature: string, 
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve'
): Promise<boolean> {
  const admin = await getAdminUser(adminId)
  
  // Super admins have all permissions
  if (admin?.role === 'superadmin') {
    return true
  }

  // Check if admin is blocked
  if (admin?.isBlocked) {
    return false
  }

  const permissions = await getAdminPermissions(adminId)
  const featurePermission = permissions.find(p => p.feature === feature)
  
  if (!featurePermission) {
    return false
  }

  switch (action) {
    case 'view':
      return featurePermission.canView
    case 'create':
      return featurePermission.canCreate
    case 'edit':
      return featurePermission.canEdit
    case 'delete':
      return featurePermission.canDelete
    case 'approve':
      return featurePermission.canApprove
    default:
      return false
  }
}

export async function requirePermission(
  adminId: number, 
  feature: string, 
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve'
): Promise<void> {
  const hasPermission = await checkPermission(adminId, feature, action)
  
  if (!hasPermission) {
    throw new Error(`Access denied. Admin does not have ${action} permission for ${feature}`)
  }
}
