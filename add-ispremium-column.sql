-- Add isPremium column to vehicles table
-- This script adds only the isPremium column since condition already exists

-- Check if isPremium column exists, if not add it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('vehicles') AND name = 'isPremium')
BEGIN
    ALTER TABLE vehicles 
    ADD isPremium BIT NOT NULL DEFAULT 0;
    
    PRINT 'Added isPremium column to vehicles table';
END
ELSE
BEGIN
    PRINT 'isPremium column already exists';
END

-- Add index for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('vehicles') AND name = 'IX_vehicles_isPremium')
BEGIN
    CREATE INDEX IX_vehicles_isPremium ON vehicles(isPremium);
    PRINT 'Added index for isPremium column';
END

-- Update existing records to have proper default values
UPDATE vehicles 
SET isPremium = 0 
WHERE isPremium IS NULL;

-- Verify the migration
SELECT 
    'Migration Complete' AS Status,
    COUNT(*) AS TotalVehicles,
    COUNT(CASE WHEN isPremium = 1 THEN 1 END) AS PremiumVehicles,
    COUNT(CASE WHEN isPremium = 0 THEN 1 END) AS RegularVehicles
FROM vehicles;

PRINT 'isPremium column migration completed successfully!';
