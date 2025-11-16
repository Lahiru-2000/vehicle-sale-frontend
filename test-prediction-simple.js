// Simple test script for price prediction
const testPrediction = async () => {
  try {
    console.log('Testing price prediction API...')
    
    // Test ML API first
    console.log('1. Testing ML API health...')
    const mlResponse = await fetch('http://localhost:5000/health')
    if (mlResponse.ok) {
      const mlData = await mlResponse.json()
      console.log('✅ ML API is running:', mlData)
    } else {
      console.log('❌ ML API is not responding')
      return
    }
    
    // Test web API
    console.log('2. Testing web API...')
    const webResponse = await fetch('http://localhost:3000/api/vehicles/predict-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vehicleId: '1',
        yearsAhead: 2
      }),
    })
    
    if (webResponse.ok) {
      const data = await webResponse.json()
      console.log('✅ Web API is working:', data)
    } else {
      const error = await webResponse.text()
      console.log('❌ Web API error:', error)
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message)
    console.log('Make sure both services are running:')
    console.log('- ML API: http://localhost:5000')
    console.log('- Web App: http://localhost:3000')
  }
}

testPrediction()

