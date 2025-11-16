-- Add cancelledAt column to subscriptions table
-- This column will store the timestamp when a subscription was cancelled

-- Check if cancelledAt column exists, if not add it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('subscriptions') AND name = 'cancelledAt')
BEGIN
    ALTER TABLE subscriptions 
    ADD cancelledAt DATETIME2(7) NULL;
    
    PRINT 'Added cancelledAt column to subscriptions table';
END
ELSE
BEGIN
    PRINT 'cancelledAt column already exists';
END

-- Add index for better performance when querying by cancellation date
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('subscriptions') AND name = 'IX_subscriptions_cancelledAt')
BEGIN
    CREATE INDEX IX_subscriptions_cancelledAt ON subscriptions(cancelledAt);
    PRINT 'Added index for cancelledAt column';
END

-- Update existing cancelled subscriptions to have a cancelledAt timestamp
-- (if you have any subscriptions with status = 'cancelled' but no cancelledAt)
UPDATE subscriptions 
SET cancelledAt = GETDATE()
WHERE status = 'cancelled' AND cancelledAt IS NULL;

-- Verify the migration
SELECT 
    'Migration Complete' AS Status,
    COUNT(*) AS TotalSubscriptions,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS CancelledSubscriptions,
    COUNT(CASE WHEN cancelledAt IS NOT NULL THEN 1 END) AS SubscriptionsWithCancelledAt
FROM subscriptions;

PRINT 'cancelledAt column migration completed successfully!';
