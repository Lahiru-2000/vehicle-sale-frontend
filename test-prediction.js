// Test script for price prediction integration
// Run this after starting both the ML API and web application

const testPrediction = async () => {
  const testVehicleId = '1' // Replace with an actual vehicle ID from your database
  const yearsAhead = 2

  try {
    console.log('Testing price prediction integration...')
    console.log(`Vehicle ID: ${testVehicleId}`)
    console.log(`Years ahead: ${yearsAhead}`)
    console.log('')

    const response = await fetch('http://localhost:3000/api/vehicles/predict-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vehicleId: testVehicleId,
        yearsAhead: yearsAhead
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Prediction successful!')
      console.log('')
      console.log('Vehicle Information:')
      console.log(`  Title: ${data.vehicle.title}`)
      console.log(`  Brand: ${data.vehicle.brand}`)
      console.log(`  Model: ${data.vehicle.model}`)
      console.log(`  Year: ${data.vehicle.year}`)
      console.log(`  Mileage: ${data.vehicle.mileage.toLocaleString()} km`)
      console.log('')
      console.log('Prediction Results:')
      console.log(`  Current Price: Rs. ${data.prediction.currentPrice.toLocaleString()}`)
      console.log(`  Predicted Price: Rs. ${data.prediction.predictedPrice.toLocaleString()}`)
      console.log(`  Price Change: Rs. ${data.prediction.priceDifference.toLocaleString()}`)
      console.log(`  Change Percentage: ${data.prediction.priceChangePercentage.toFixed(1)}%`)
      console.log(`  Confidence: ${(data.prediction.confidence * 100).toFixed(0)}%`)
      console.log(`  Years Ahead: ${data.prediction.yearsAhead}`)
      console.log(`  Currency: ${data.prediction.currency}`)
      console.log(`  Market: ${data.prediction.market}`)
      
      if (data.prediction.priceTrend && data.prediction.priceTrend.length > 0) {
        console.log('')
        console.log('Price Trend:')
        data.prediction.priceTrend.forEach((price, index) => {
          console.log(`  Year ${index + 1}: Rs. ${price.toLocaleString()}`)
        })
      }
    } else {
      console.log('❌ Prediction failed!')
      console.log(`Error: ${data.error}`)
      if (data.details) {
        console.log(`Details: ${data.details}`)
      }
    }
  } catch (error) {
    console.log('❌ Network error!')
    console.log(`Error: ${error.message}`)
    console.log('')
    console.log('Make sure both services are running:')
    console.log('1. ML API: http://localhost:5000')
    console.log('2. Web App: http://localhost:3000')
  }
}

// Run the test
testPrediction()

