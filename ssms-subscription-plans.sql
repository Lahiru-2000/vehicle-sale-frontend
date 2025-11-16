-- =============================================
-- Sample Subscription Plans Data for SSMS
-- Copy and paste this entire script into SSMS
-- =============================================

-- First, ensure the postCount column exists in subscription_plans table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'subscription_plans' AND COLUMN_NAME = 'postCount')
BEGIN
    ALTER TABLE subscription_plans ADD postCount INT DEFAULT 0;
    PRINT 'Added postCount column to subscription_plans table';
END
ELSE
BEGIN
    PRINT 'postCount column already exists in subscription_plans table';
END

-- Clear existing data (optional - uncomment if you want to reset)
-- DELETE FROM subscription_plans;

-- Insert sample subscription plans with 3 plan types: basic, premium, pro
INSERT INTO subscription_plans (id, name, planType, price, postCount, features, isActive, createdAt, updatedAt) 
VALUES 
-- Basic Plan
('plan-basic', 'Basic Plan', 'basic', 4.99, 3, '["Basic listing placement", "Standard support", "3 vehicle posts", "Email support", "Basic analytics"]', 1, GETDATE(), GETDATE()),

-- Premium Plan  
('plan-premium', 'Premium Plan', 'premium', 9.99, 10, '["Priority listing placement", "Enhanced vehicle visibility", "Premium support", "Advanced analytics", "10 vehicle posts", "Priority customer support", "Featured listings"]', 1, GETDATE(), GETDATE()),

-- Pro Plan (🔥 HOT ITEM - Most Popular)
('plan-pro', 'Pro Plan', 'pro', 19.99, 25, '["🔥 HOT ITEM - Most Popular", "Top priority placement", "Maximum visibility", "24/7 premium support", "Advanced analytics", "25 vehicle posts", "Custom branding", "Priority customer support", "Featured listings", "Exclusive pro features", "Advanced reporting", "API access"]', 1, GETDATE(), GETDATE());

-- Display success message
PRINT 'Successfully inserted subscription plans data';

-- Verify the data was inserted correctly
SELECT 
    id,
    name,
    planType,
    price,
    durationMonths,
    postCount,
    features,
    isActive,
    createdAt
FROM subscription_plans 
ORDER BY planType, price;

-- Show summary
SELECT 
    planType,
    COUNT(*) as PlanCount,
    MIN(price) as MinPrice,
    MAX(price) as MaxPrice,
    MIN(postCount) as MinPosts,
    MAX(postCount) as MaxPosts
FROM subscription_plans 
WHERE isActive = 1
GROUP BY planType
ORDER BY planType;
