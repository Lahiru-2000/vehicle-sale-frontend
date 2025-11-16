@echo off
echo Starting Price Prediction Model Test...
echo.

echo Step 1: Starting ML API...
start "ML API" cmd /k "cd /d C:\Lahiru\Final Year Project\project\drivedeal-ml && python src\sri_lankan_prediction_api.py"

echo Step 2: Waiting for ML API to start...
timeout /t 10 /nobreak

echo Step 3: Starting Web Application...
start "Web App" cmd /k "cd /d C:\Lahiru\Final Year Project\project\vehicle-price-prediction && npm run dev"

echo.
echo Both services are starting...
echo.
echo Once both are running:
echo 1. Open your browser
echo 2. Go to http://localhost:3000
echo 3. Find an approved vehicle
echo 4. Click "Predict Price" button
echo.
pause


