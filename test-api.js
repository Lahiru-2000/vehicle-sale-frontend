// Test script to verify the prediction API
const testAPI = async () => {
  try {
    console.log('🧪 Testing Price Prediction API...\n')
    
    // Test 1: Check ML API
    console.log('1️⃣ Testing ML API...')
    const mlResponse = await fetch('http://127.0.0.1:5000/health')
    if (mlResponse.ok) {
      const mlData = await mlResponse.json()
      console.log('✅ ML API is working:', mlData.status)
    } else {
      console.log('❌ ML API failed')
      return
    }
    
    // Test 2: Check Web API
    console.log('\n2️⃣ Testing Web API...')
    const webResponse = await fetch('http://localhost:3000/api/vehicles/predict-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: '1', yearsAhead: 2 })
    })
    
    if (webResponse.ok) {
      const data = await webResponse.json()
      console.log('✅ Web API is working!')
      console.log('📊 Prediction result:', data.prediction ? 'Success' : 'Failed')
    } else {
      const error = await webResponse.text()
      console.log('❌ Web API failed:', error)
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure ML API is running on port 5000')
    console.log('2. Make sure Web App is running on port 3000')
    console.log('3. Restart the web application if needed')
  }
}

testAPI()


