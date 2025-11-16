-- =========================================
-- ADD PREMIUM FIELD TO VEHICLES TABLE
-- =========================================

-- Add isPremium column to vehicles table
ALTER TABLE vehicles 
ADD isPremium BIT NOT NULL DEFAULT 0;

-- Add an index for better query performance when sorting by premium status
CREATE INDEX IX_vehicles_isPremium ON vehicles(isPremium);

-- Update existing vehicles to be non-premium by default
UPDATE vehicles 
SET isPremium = 0 
WHERE isPremium IS NULL;

-- Optional: Set some existing vehicles as premium for testing
-- UPDATE vehicles 
-- SET isPremium = 1 
-- WHERE id IN (SELECT TOP 5 id FROM vehicles ORDER BY createdAt DESC);

-- Verify the changes
SELECT 
    'Migration Complete' AS Status,
    COUNT(*) AS TotalVehicles,
    COUNT(CASE WHEN isPremium = 1 THEN 1 END) AS PremiumVehicles,
    COUNT(CASE WHEN isPremium = 0 THEN 1 END) AS RegularVehicles
FROM vehicles;
