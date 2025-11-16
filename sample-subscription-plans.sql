-- Sample data for subscription_plans table
-- This includes the postCount field for the post count system

-- Clear existing data (optional - only if you want to reset)
-- DELETE FROM subscription_plans;

-- Insert sample subscription plans with post counts
INSERT INTO subscription_plans (id, name, planType, price, durationMonths, postCount, features, isActive, createdAt, updatedAt) VALUES
('plan-monthly-basic', 'Basic Monthly', 'monthly', 4.99, 1, 3, '["Basic listing placement", "Standard support", "3 vehicle posts per month"]', 1, GETDATE(), GETDATE()),

('plan-monthly-premium', 'Premium Monthly', 'monthly', 9.99, 1, 5, '["Priority listing placement", "Enhanced vehicle visibility", "Premium support", "Advanced analytics", "5 vehicle posts per month"]', 1, GETDATE(), GETDATE()),

('plan-monthly-pro', 'Pro Monthly', 'monthly', 19.99, 1, 15, '["Top priority placement", "Maximum visibility", "24/7 premium support", "Advanced analytics", "Custom branding", "15 vehicle posts per month"]', 1, GETDATE(), GETDATE()),

('plan-yearly-basic', 'Basic Yearly', 'yearly', 49.99, 12, 40, '["Basic listing placement", "Standard support", "40 vehicle posts per year", "2 months free (save 17%)"]', 1, GETDATE(), GETDATE()),

('plan-yearly-premium', 'Premium Yearly', 'yearly', 99.99, 12, 60, '["Priority listing placement", "Enhanced vehicle visibility", "Premium support", "Advanced analytics", "60 vehicle posts per year", "2 months free (save 17%)", "Exclusive yearly member benefits"]', 1, GETDATE(), GETDATE()),

('plan-yearly-pro', 'Pro Yearly', 'yearly', 199.99, 12, 200, '["Top priority placement", "Maximum visibility", "24/7 premium support", "Advanced analytics", "Custom branding", "200 vehicle posts per year", "2 months free (save 17%)", "Exclusive yearly member benefits", "Priority customer support"]', 1, GETDATE(), GETDATE()),

('plan-lifetime', 'Lifetime Unlimited', 'yearly', 499.99, 999, 999, '["Unlimited vehicle posts", "Lifetime access", "Top priority placement", "Maximum visibility", "24/7 premium support", "Advanced analytics", "Custom branding", "Exclusive lifetime member benefits", "Priority customer support", "No expiration date"]', 1, GETDATE(), GETDATE());

-- Verify the data was inserted
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
