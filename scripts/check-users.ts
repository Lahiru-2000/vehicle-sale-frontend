import pool from '../src/lib/db'

async function checkUsers() {
  try {
    const connection = await pool.connect()
    
    console.log('Connected to MS SQL Server')
    
    // Check all users
    const result = await connection.request()
      .query('SELECT id, name, email, role, isBlocked FROM users ORDER BY role, name')
    
    console.log('\nAll Users in Database:')
    console.log('=======================')
    
    if (result.recordset.length === 0) {
      console.log('No users found in database')
    } else {
      result.recordset.forEach((user: any, index: number) => {
        console.log(`${index + 1}. ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Blocked: ${user.isBlocked}`)
      })
    }
    
    // Check specific roles
    const adminResult = await connection.request()
      .query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
    
    const superAdminResult = await connection.request()
      .query("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'")
    
    const userResult = await connection.request()
      .query("SELECT COUNT(*) as count FROM users WHERE role = 'user'")
    
    console.log('\nRole Distribution:')
    console.log('==================')
    console.log(`Admin users: ${adminResult.recordset[0].count}`)
    console.log(`Super Admin users: ${superAdminResult.recordset[0].count}`)
    console.log(`Regular users: ${userResult.recordset[0].count}`)
    
    // Check if super admin exists
    const superAdminCheck = await connection.request()
      .query("SELECT id, name, email, role FROM users WHERE role = 'superadmin'")
    
    if (superAdminCheck.recordset.length > 0) {
      console.log('\nSuper Admin Details:')
      console.log('====================')
      superAdminCheck.recordset.forEach((admin: any) => {
        console.log(`ID: ${admin.id}, Name: ${admin.name}, Email: ${admin.email}, Role: ${admin.role}`)
      })
    } else {
      console.log('\n❌ No super admin found!')
    }
    
  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    process.exit(0)
  }
}

checkUsers()
