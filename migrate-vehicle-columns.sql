-- =========================================
-- MIGRATE VEHICLE TABLE - ADD MISSING COLUMNS
-- =========================================

-- Check if condition column exists, if not add it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('vehicles') AND name = 'condition')
BEGIN
    ALTER TABLE vehicles 
    ADD condition NVARCHAR(10) NOT NULL DEFAULT 'USED' 
    CHECK (condition IN ('USED', 'BRANDNEW', 'REFURBISHED'));
    
    PRINT 'Added condition column to vehicles table';
END
ELSE
BEGIN
    PRINT 'Condition column already exists';
END

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

-- Add indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('vehicles') AND name = 'IX_vehicles_condition')
BEGIN
    CREATE INDEX IX_vehicles_condition ON vehicles(condition);
    PRINT 'Added index for condition column';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('vehicles') AND name = 'IX_vehicles_isPremium')
BEGIN
    CREATE INDEX IX_vehicles_isPremium ON vehicles(isPremium);
    PRINT 'Added index for isPremium column';
END

-- Update existing records to have proper default values
UPDATE vehicles 
SET condition = 'USED' 
WHERE condition IS NULL OR condition = '';

UPDATE vehicles 
SET isPremium = 0 
WHERE isPremium IS NULL;

-- Verify the migration
SELECT 
    'Migration Complete' AS Status,
    COUNT(*) AS TotalVehicles,
    COUNT(CASE WHEN condition = 'USED' THEN 1 END) AS UsedVehicles,
    COUNT(CASE WHEN condition = 'BRANDNEW' THEN 1 END) AS BrandNewVehicles,
    COUNT(CASE WHEN condition = 'REFURBISHED' THEN 1 END) AS RefurbishedVehicles,
    COUNT(CASE WHEN isPremium = 1 THEN 1 END) AS PremiumVehicles,
    COUNT(CASE WHEN isPremium = 0 THEN 1 END) AS RegularVehicles
FROM vehicles;

PRINT 'Migration completed successfully!';
