@echo off
echo Testing Vehicle API Endpoints...
echo.

echo 1. Testing GET /api/vehicles...
curl -X GET "http://localhost:3000/api/vehicles" -H "Content-Type: application/json"
echo.
echo.

echo 2. Testing with specific parameters...
curl -X GET "http://localhost:3000/api/vehicles?page=1&limit=5" -H "Content-Type: application/json"
echo.
echo.

echo 3. Testing vehicle creation (without auth - should fail)...
curl -X POST "http://localhost:3000/api/vehicles" -H "Content-Type: application/json" -d "{\"title\":\"Test Vehicle\",\"brand\":\"Toyota\",\"model\":\"Camry\",\"year\":2020,\"price\":50000,\"type\":\"car\",\"fuelType\":\"petrol\",\"transmission\":\"automatic\",\"condition\":\"USED\",\"mileage\":10000,\"description\":\"Test vehicle\",\"contactInfo\":{\"phone\":\"1234567890\",\"email\":\"test@example.com\",\"location\":\"Test City\"}}"
echo.
echo.

echo API testing completed!
pause
