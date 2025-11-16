-- Insert test vehicles for search functionality testing
-- First, create a test user if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'testuser@example.com')
BEGIN
    INSERT INTO users (id, email, name, password, role, isBlocked, createdAt, updatedAt)
    VALUES ('test-user-123', 'testuser@example.com', 'Test User', 'hashedpassword', 'user', 0, GETDATE(), GETDATE())
END

-- Insert test vehicles
INSERT INTO vehicles (id, title, brand, model, year, price, type, fuelType, transmission, condition, mileage, description, images, contactInfo, status, userId, isPremium, createdAt, updatedAt)
VALUES 
('vehicle-1', 'Toyota Camry 2020', 'Toyota', 'Camry', 2020, 25000, 'car', 'petrol', 'automatic', 'USED', 50000, 'Well maintained Toyota Camry with low mileage', '["/uploads/vehicles/sample1.jpg"]', '{"phone":"1234567890","email":"test@example.com","location":"Colombo"}', 'approved', 'test-user-123', 0, GETDATE(), GETDATE()),

('vehicle-2', 'Honda Civic 2019', 'Honda', 'Civic', 2019, 22000, 'car', 'petrol', 'manual', 'USED', 60000, 'Excellent condition Honda Civic', '["/uploads/vehicles/sample2.jpg"]', '{"phone":"1234567891","email":"test2@example.com","location":"Kandy"}', 'approved', 'test-user-123', 0, GETDATE(), GETDATE()),

('vehicle-3', 'Yamaha YZF R15', 'Yamaha', 'YZF R15', 2021, 8000, 'bike', 'petrol', 'manual', 'USED', 15000, 'Sporty Yamaha bike in great condition', '["/uploads/vehicles/sample3.jpg"]', '{"phone":"1234567892","email":"test3@example.com","location":"Galle"}', 'approved', 'test-user-123', 0, GETDATE(), GETDATE()),

('vehicle-4', 'BMW X5 2020', 'BMW', 'X5', 2020, 45000, 'car', 'petrol', 'automatic', 'USED', 30000, 'Luxury BMW X5 in excellent condition', '["/uploads/vehicles/sample4.jpg"]', '{"phone":"1234567893","email":"test4@example.com","location":"Colombo"}', 'approved', 'test-user-123', 1, GETDATE(), GETDATE()),

('vehicle-5', 'Suzuki Swift 2018', 'Suzuki', 'Swift', 2018, 15000, 'car', 'petrol', 'manual', 'USED', 80000, 'Reliable Suzuki Swift for city driving', '["/uploads/vehicles/sample5.jpg"]', '{"phone":"1234567894","email":"test5@example.com","location":"Negombo"}', 'approved', 'test-user-123', 0, GETDATE(), GETDATE())

-- Check the results
SELECT COUNT(*) as total_vehicles FROM vehicles WHERE status = 'approved'
SELECT id, title, brand, model, status FROM vehicles WHERE status = 'approved'
