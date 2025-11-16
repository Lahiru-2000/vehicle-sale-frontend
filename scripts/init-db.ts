import { initDatabase } from '../src/lib/db'

async function main() {
  try {
    console.log('Starting MS SQL Server database initialization...')
    await initDatabase()
    console.log('Database initialization completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Database initialization failed:', error)
    process.exit(1)
  }
}

main()
