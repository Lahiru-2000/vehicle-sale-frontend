import pool from '../src/lib/db'

async function updateUsersTable() {
  try {
    const connection = await pool.connect()
    
    console.log('Updating users table...')
    
    // Add missing columns if they don't exist
    try {
      await connection.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'phone')
        ALTER TABLE users ADD phone NVARCHAR(20)
      `)
      console.log('✓ Added phone column')
    } catch (error) {
      console.log('Phone column already exists or error:', error)
    }

    try {
      await connection.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'lastLogin')
        ALTER TABLE users ADD lastLogin DATETIME2
      `)
      console.log('✓ Added lastLogin column')
    } catch (error) {
      console.log('lastLogin column already exists or error:', error)
    }

    // Update role constraint to allow superadmin
    try {
      await connection.request().query(`
        IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK__users__role__[A-Z0-9]*')
        BEGIN
          DECLARE @constraint_name NVARCHAR(128)
          SELECT @constraint_name = name FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('users') AND name LIKE 'CK__users__role__%'
          EXEC('ALTER TABLE users DROP CONSTRAINT ' + @constraint_name)
        END
      `)
      
      await connection.request().query(`
        ALTER TABLE users ADD CONSTRAINT CK_users_role CHECK (role IN ('user', 'admin', 'superadmin'))
      `)
      console.log('✓ Updated role constraint to allow superadmin')
    } catch (error) {
      console.log('Role constraint update error:', error)
    }

    // Update existing users to have default values for new fields
    await connection.request().query(`
      UPDATE users 
      SET phone = ISNULL(phone, ''),
          lastLogin = ISNULL(lastLogin, GETDATE()),
          isBlocked = ISNULL(isBlocked, 0)
      WHERE phone IS NULL OR lastLogin IS NULL OR isBlocked IS NULL
    `)
    console.log('✓ Updated existing users with default values')

    console.log('Users table update completed successfully!')
    
  } catch (error) {
    console.error('Error updating users table:', error)
  } finally {
    process.exit(0)
  }
}

updateUsersTable()
