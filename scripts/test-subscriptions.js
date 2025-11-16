const sql = require('mssql')

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123!',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'VehiclePricePrediction',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}

async function testSubscriptions() {
  try {
    console.log('Connecting to database...')
    const pool = await sql.connect(config)
    
    console.log('Connected successfully!')
    
    // Check if subscriptions table exists
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) as tableCount
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'subscriptions'
    `)
    
    console.log('Subscriptions table exists:', tableCheck.recordset[0].tableCount > 0)
    
    if (tableCheck.recordset[0].tableCount > 0) {
      // Get table structure
      const structure = await pool.request().query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'subscriptions'
        ORDER BY ORDINAL_POSITION
      `)
      
      console.log('Table structure:')
      structure.recordset.forEach(col => {
        console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`)
      })
      
      // Get sample data
      const sampleData = await pool.request().query(`
        SELECT TOP 3 
          id, 
          userId, 
          planType, 
          status, 
          startDate, 
          endDate, 
          price, 
          paymentMethod, 
          transactionId, 
          createdAt, 
          updatedAt
        FROM subscriptions
      `)
      
      console.log('Sample data:')
      console.log(sampleData.recordset)
      
      // Test update query
      if (sampleData.recordset.length > 0) {
        const testId = sampleData.recordset[0].id
        console.log(`Testing update query with ID: ${testId}`)
        
        try {
          const updateResult = await pool.request()
            .input('id', testId)
            .query(`
              UPDATE subscriptions 
              SET status = 'cancelled', updatedAt = GETDATE()
              WHERE id = @id
            `)
          
          console.log('Update successful, rows affected:', updateResult.rowsAffected[0])
          
          // Revert the change
          await pool.request()
            .input('id', testId)
            .query(`
              UPDATE subscriptions 
              SET status = 'active', updatedAt = GETDATE()
              WHERE id = @id
            `)
          
          console.log('Reverted test change')
        } catch (updateError) {
          console.error('Update test failed:', updateError)
        }
      }
    }
    
    await pool.close()
    console.log('Test completed successfully!')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testSubscriptions()
