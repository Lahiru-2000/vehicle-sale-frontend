import bcrypt from 'bcryptjs'
import pool from '../src/lib/db'

async function initSuperAdmin() {
  const connection = await pool.connect()
  
  try {
    console.log('Initializing super admin...')

                // Create users table if it doesn't exist
            await connection.request()
              .query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
                CREATE TABLE users (
                  id INT IDENTITY(1,1) PRIMARY KEY,
                  email NVARCHAR(255) UNIQUE NOT NULL,
                  name NVARCHAR(255) NOT NULL,
                  password NVARCHAR(255) NOT NULL,
                  role NVARCHAR(50) DEFAULT 'user',
                  phone NVARCHAR(20) NULL,
                  isBlocked BIT DEFAULT 0,
                  lastLogin DATETIME NULL,
                  createdAt DATETIME DEFAULT GETDATE(),
                  updatedAt DATETIME DEFAULT GETDATE()
                )
              `)

    // Create admin permissions table if it doesn't exist
    await connection.request()
      .query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_permissions' AND xtype='U')
        CREATE TABLE admin_permissions (
          id INT IDENTITY(1,1) PRIMARY KEY,
          adminId INT NOT NULL,
          feature NVARCHAR(100) NOT NULL,
          canView BIT DEFAULT 0,
          canCreate BIT DEFAULT 0,
          canEdit BIT DEFAULT 0,
          canDelete BIT DEFAULT 0,
          canApprove BIT DEFAULT 0,
          createdAt DATETIME DEFAULT GETDATE(),
          updatedAt DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (adminId) REFERENCES admins(id) ON DELETE CASCADE
        )
      `)

    // Create admin features table if it doesn't exist
    await connection.request()
      .query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_features' AND xtype='U')
        CREATE TABLE admin_features (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(100) UNIQUE NOT NULL,
          description NVARCHAR(500),
          category NVARCHAR(100),
          isActive BIT DEFAULT 1,
          createdAt DATETIME DEFAULT GETDATE()
        )
      `)

                // Check if super admin already exists
            const existingAdmin = await connection.request()
              .query("SELECT id FROM users WHERE role = 'superadmin'")

            if (existingAdmin.recordset.length > 0) {
              console.log('Super admin already exists. Skipping initialization.')
              return
            }

    // Insert default features
    const featuresCount = await connection.request()
      .query('SELECT COUNT(*) as count FROM admin_features')

    if (featuresCount.recordset[0].count === 0) {
      const defaultFeatures = [
        { name: 'user_management', description: 'Manage users and their accounts', category: 'User Management' },
        { name: 'vehicle_management', description: 'Manage vehicle listings and approvals', category: 'Vehicle Management' },
        { name: 'admin_management', description: 'Manage other admin accounts', category: 'Admin Management' },
        { name: 'settings_management', description: 'Manage website settings', category: 'System Settings' },
        { name: 'analytics_view', description: 'View analytics and reports', category: 'Analytics' },
        { name: 'payment_management', description: 'Manage payments and subscriptions', category: 'Financial' },
        // { name: 'bulk_operations', description: 'Perform bulk operations on vehicles/users', category: 'Operations' }
      ]

      for (const feature of defaultFeatures) {
        await connection.request()
          .input('name', feature.name)
          .input('description', feature.description)
          .input('category', feature.category)
          .query(`
            INSERT INTO admin_features (name, description, category)
            VALUES (@name, @description, @category)
          `)
      }
      console.log('Default features created.')
    }

                // Create super admin
            const hashedPassword = await bcrypt.hash('superadmin123', 12)
            
            const result = await connection.request()
              .input('name', 'Super Administrator')
              .input('email', 'superadmin@vehiclehub.com')
              .input('password', hashedPassword)
              .input('role', 'superadmin')
              .input('phone', '+1-555-0000')
              .query(`
                INSERT INTO users (name, email, password, role, phone, isBlocked)
                OUTPUT INSERTED.id
                VALUES (@name, @email, @password, @role, @phone, 0)
              `)

    const adminId = result.recordset[0].id

    // Give super admin all permissions
    const features = await connection.request()
      .query('SELECT name FROM admin_features WHERE isActive = 1')

    for (const feature of features.recordset) {
      await connection.request()
        .input('adminId', adminId)
        .input('feature', feature.name)
        .query(`
          INSERT INTO admin_permissions (adminId, feature, canView, canCreate, canEdit, canDelete, canApprove)
          VALUES (@adminId, @feature, 1, 1, 1, 1, 1)
        `)
    }

    console.log('Super admin created successfully!')
    console.log('Email: superadmin@vehiclehub.com')
    console.log('Password: superadmin123')
    console.log('Role: superadmin')
    console.log('All permissions granted.')

  } catch (error) {
    console.error('Error initializing super admin:', error)
  } finally {
    // MS SQL Server connections are automatically returned to the pool
  }
}

// Run the initialization
initSuperAdmin()
  .then(() => {
    console.log('Super admin initialization completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Super admin initialization failed:', error)
    process.exit(1)
  })
