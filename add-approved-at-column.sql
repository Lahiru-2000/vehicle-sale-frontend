-- =========================================
-- ADD APPROVED AT COLUMN TO VEHICLES TABLE
-- =========================================

-- Add approvedAt column to vehicles table
ALTER TABLE vehicles
ADD approvedAt DATETIME2 NULL;

-- Add an index for better query performance when sorting by approval date
CREATE INDEX IX_vehicles_approvedAt ON vehicles(approvedAt);

-- Update existing approved vehicles to have their approvedAt set to their updatedAt
-- (This is a best guess for when they were approved)
UPDATE vehicles
SET approvedAt = updatedAt
WHERE status = 'approved' AND approvedAt IS NULL;

-- Update the approve vehicle API to set approvedAt when approving
-- (This will be handled in the code, not in this SQL script)

-- Verify the changes
SELECT
    'Migration Complete' AS Status,
    COUNT(*) AS TotalVehicles,
    COUNT(CASE WHEN status = 'approved' AND approvedAt IS NOT NULL THEN 1 END) AS ApprovedWithDate,
    COUNT(CASE WHEN status = 'approved' AND approvedAt IS NULL THEN 1 END) AS ApprovedWithoutDate,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS PendingVehicles,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS RejectedVehicles
FROM vehicles;
