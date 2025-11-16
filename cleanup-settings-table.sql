-- Clean up settings table to only keep feature settings
-- This script removes unnecessary settings and keeps only the features

-- First, let's see what's currently in the settings table
SELECT settingKey, value FROM settings;

-- Remove unnecessary settings (keep only 'features')
DELETE FROM settings WHERE settingKey IN (
    'site',
    'vehicle', 
    'security',
    'analytics'
);

-- Verify only features remain
SELECT settingKey, value FROM settings;

-- If no features exist, insert default features
IF NOT EXISTS (SELECT 1 FROM settings WHERE settingKey = 'features')
BEGIN
    INSERT INTO settings (settingKey, value) VALUES (
        'features', 
        '{"userRegistration":true,"pricePrediction":true,"proPlanActivation":true,"maintenanceMode":false,"maintenanceMessage":"We are currently performing scheduled maintenance. Please check back later."}'
    )
END
