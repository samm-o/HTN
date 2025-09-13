-- Project BASTION Database Schema for Supabase (PostgreSQL)
-- Run these commands in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- DATABASE CLEARING FUNCTIONS
-- =============================================================================

-- Function to clear all demo data (keeps table structure)
CREATE OR REPLACE FUNCTION clear_demo_data()
RETURNS void AS $$
BEGIN
    -- Clear in order to respect foreign key constraints
    DELETE FROM claims;
    DELETE FROM users;
    DELETE FROM stores;
    
    RAISE NOTICE 'Demo data cleared successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to completely reset database (drops and recreates tables)
CREATE OR REPLACE FUNCTION reset_database()
RETURNS void AS $$
BEGIN
    -- Drop tables in reverse dependency order
    DROP TABLE IF EXISTS claims CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS stores CASCADE;
    DROP VIEW IF EXISTS claim_analytics CASCADE;
    
    RAISE NOTICE 'Database reset successfully - tables dropped';
END;
$$ LANGUAGE plpgsql;

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (represents KYC-verified identities)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- This will be the KYC-provided UUID
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email_at_store VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED')),
    claim_data JSONB NOT NULL, -- Stores array of ItemData objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_store_id ON claims(store_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);
CREATE INDEX IF NOT EXISTS idx_users_risk_score ON users(risk_score);
CREATE INDEX IF NOT EXISTS idx_users_is_flagged ON users(is_flagged);

-- =============================================================================
-- DEMO DATA SEEDING
-- =============================================================================

-- Function to seed realistic demo data
CREATE OR REPLACE FUNCTION seed_demo_data()
RETURNS void AS $$
DECLARE
    store_amazon UUID;
    store_bestbuy UUID;
    store_target UUID;
    store_walmart UUID;
    store_costco UUID;
    store_macys UUID;
    store_nordstrom UUID;
    
    user_john UUID := '550e8400-e29b-41d4-a716-446655440001';
    user_sarah UUID := '550e8400-e29b-41d4-a716-446655440002';
    user_mike UUID := '550e8400-e29b-41d4-a716-446655440003';
    user_emily UUID := '550e8400-e29b-41d4-a716-446655440004';
    user_david UUID := '550e8400-e29b-41d4-a716-446655440005';
    user_lisa UUID := '550e8400-e29b-41d4-a716-446655440006';
    user_james UUID := '550e8400-e29b-41d4-a716-446655440007';
    user_anna UUID := '550e8400-e29b-41d4-a716-446655440008';
BEGIN
    -- Clear existing demo data first
    PERFORM clear_demo_data();
    
    -- Insert stores and capture their IDs
    INSERT INTO stores (name) VALUES 
        ('Amazon'),
        ('Best Buy'),
        ('Target'),
        ('Walmart'),
        ('Costco'),
        ('Macy''s'),
        ('Nordstrom')
    RETURNING id INTO store_amazon, store_bestbuy, store_target, store_walmart, store_costco, store_macys, store_nordstrom;
    
    -- Get store IDs (alternative method for multiple stores)
    SELECT id INTO store_amazon FROM stores WHERE name = 'Amazon';
    SELECT id INTO store_bestbuy FROM stores WHERE name = 'Best Buy';
    SELECT id INTO store_target FROM stores WHERE name = 'Target';
    SELECT id INTO store_walmart FROM stores WHERE name = 'Walmart';
    SELECT id INTO store_costco FROM stores WHERE name = 'Costco';
    SELECT id INTO store_macys FROM stores WHERE name = 'Macy''s';
    SELECT id INTO store_nordstrom FROM stores WHERE name = 'Nordstrom';
    
    -- Insert realistic users with varying risk profiles
    INSERT INTO users (id, full_name, dob, risk_score, is_flagged, created_at) VALUES 
        (user_john, 'John Smith', '1985-03-15', 25, false, NOW() - INTERVAL '6 months'),
        (user_sarah, 'Sarah Johnson', '1990-07-22', 45, false, NOW() - INTERVAL '4 months'),
        (user_mike, 'Michael Brown', '1988-11-08', 85, true, NOW() - INTERVAL '8 months'),
        (user_emily, 'Emily Davis', '1992-05-30', 15, false, NOW() - INTERVAL '2 months'),
        (user_david, 'David Wilson', '1987-09-12', 70, true, NOW() - INTERVAL '10 months'),
        (user_lisa, 'Lisa Anderson', '1991-01-25', 35, false, NOW() - INTERVAL '3 months'),
        (user_james, 'James Taylor', '1989-12-03', 90, true, NOW() - INTERVAL '1 year'),
        (user_anna, 'Anna Martinez', '1993-08-17', 20, false, NOW() - INTERVAL '1 month');
    
    -- Insert realistic claims with various scenarios
    
    -- John Smith - Low risk user with normal claims
    INSERT INTO claims (user_id, store_id, email_at_store, status, claim_data, created_at) VALUES 
        (user_john, store_amazon, 'john.smith@email.com', 'APPROVED', 
         '[{"item_name": "Wireless Headphones", "category": "electronics", "price": 79.99, "quantity": 1, "url": "https://amazon.com/headphones"}]',
         NOW() - INTERVAL '2 months'),
        (user_john, store_target, 'john.smith@email.com', 'APPROVED',
         '[{"item_name": "Cotton T-Shirt", "category": "clothing", "price": 19.99, "quantity": 2, "url": "https://target.com/tshirt"}]',
         NOW() - INTERVAL '1 month');
    
    -- Sarah Johnson - Medium risk with some expensive items
    INSERT INTO claims (user_id, store_id, email_at_store, status, claim_data, created_at) VALUES 
        (user_sarah, store_bestbuy, 'sarah.j@gmail.com', 'PENDING',
         '[{"item_name": "MacBook Pro 14-inch", "category": "electronics", "price": 1999.99, "quantity": 1, "url": "https://bestbuy.com/macbook"}]',
         NOW() - INTERVAL '1 week'),
        (user_sarah, store_macys, 'sarah.johnson@work.com', 'APPROVED',
         '[{"item_name": "Designer Handbag", "category": "luxury", "price": 450.00, "quantity": 1, "url": "https://macys.com/handbag"}]',
         NOW() - INTERVAL '3 weeks');
    
    -- Michael Brown - High risk user with suspicious patterns
    INSERT INTO claims (user_id, store_id, email_at_store, status, claim_data, created_at) VALUES 
        (user_mike, store_amazon, 'mike.brown@email.com', 'DENIED',
         '[{"item_name": "iPhone 15 Pro Max", "category": "electronics", "price": 1199.99, "quantity": 1}, {"item_name": "AirPods Pro", "category": "electronics", "price": 249.99, "quantity": 1}]',
         NOW() - INTERVAL '3 days'),
        (user_mike, store_bestbuy, 'michael.b@tempmail.com', 'PENDING',
         '[{"item_name": "Gaming Laptop", "category": "electronics", "price": 2499.99, "quantity": 1}]',
         NOW() - INTERVAL '1 day'),
        (user_mike, store_walmart, 'm.brown123@fakemail.com', 'DENIED',
         '[{"item_name": "Gold Jewelry Set", "category": "jewelry", "price": 899.99, "quantity": 1}]',
         NOW() - INTERVAL '5 days');
    
    -- Emily Davis - New low risk user
    INSERT INTO claims (user_id, store_id, email_at_store, status, claim_data, created_at) VALUES 
        (user_emily, store_target, 'emily.davis@university.edu', 'APPROVED',
         '[{"item_name": "Textbook - Biology", "category": "books", "price": 89.99, "quantity": 1}]',
         NOW() - INTERVAL '2 weeks');
    
    -- David Wilson - Flagged user with multiple store pattern
    INSERT INTO claims (user_id, store_id, email_at_store, status, claim_data, created_at) VALUES 
        (user_david, store_amazon, 'david.wilson@email.com', 'DENIED',
         '[{"item_name": "Smart Watch", "category": "electronics", "price": 399.99, "quantity": 1}]',
         NOW() - INTERVAL '1 week'),
        (user_david, store_costco, 'd.wilson@different.com', 'PENDING',
         '[{"item_name": "Premium Vitamins", "category": "health", "price": 79.99, "quantity": 3}]',
         NOW() - INTERVAL '4 days'),
        (user_david, store_nordstrom, 'davidw@anotheremail.net', 'DENIED',
         '[{"item_name": "Designer Shoes", "category": "luxury", "price": 650.00, "quantity": 1}]',
         NOW() - INTERVAL '2 days');
    
    -- Lisa Anderson - Normal user with clothing focus
    INSERT INTO claims (user_id, store_id, email_at_store, status, claim_data, created_at) VALUES 
        (user_lisa, store_macys, 'lisa.anderson@email.com', 'APPROVED',
         '[{"item_name": "Winter Coat", "category": "clothing", "price": 129.99, "quantity": 1}]',
         NOW() - INTERVAL '3 weeks'),
        (user_lisa, store_nordstrom, 'lisa.anderson@email.com', 'APPROVED',
         '[{"item_name": "Dress Shoes", "category": "clothing", "price": 89.99, "quantity": 1}]',
         NOW() - INTERVAL '1 week');
    
    -- James Taylor - Very high risk with frequent expensive claims
    INSERT INTO claims (user_id, store_id, email_at_store, status, claim_data, created_at) VALUES 
        (user_james, store_bestbuy, 'james.taylor@email.com', 'DENIED',
         '[{"item_name": "4K TV 65-inch", "category": "electronics", "price": 1299.99, "quantity": 1}]',
         NOW() - INTERVAL '2 days'),
        (user_james, store_amazon, 'j.taylor@temp.com', 'DENIED',
         '[{"item_name": "Professional Camera", "category": "electronics", "price": 1899.99, "quantity": 1}]',
         NOW() - INTERVAL '5 days'),
        (user_james, store_costco, 'jtaylor123@fake.org', 'DENIED',
         '[{"item_name": "Diamond Ring", "category": "jewelry", "price": 2999.99, "quantity": 1}]',
         NOW() - INTERVAL '1 week');
    
    -- Anna Martinez - Recent user with normal activity
    INSERT INTO claims (user_id, store_id, email_at_store, status, claim_data, created_at) VALUES 
        (user_anna, store_target, 'anna.martinez@email.com', 'APPROVED',
         '[{"item_name": "Kitchen Appliance", "category": "home", "price": 49.99, "quantity": 1}]',
         NOW() - INTERVAL '5 days');
    
    RAISE NOTICE 'Demo data seeded successfully with % stores, % users, and % claims', 
        (SELECT COUNT(*) FROM stores),
        (SELECT COUNT(*) FROM users), 
        (SELECT COUNT(*) FROM claims);
END;
$$ LANGUAGE plpgsql;

-- Create a view for claim analytics
CREATE OR REPLACE VIEW claim_analytics AS
SELECT 
    c.id as claim_id,
    c.user_id,
    u.full_name,
    u.risk_score,
    u.is_flagged,
    c.store_id,
    s.name as store_name,
    c.email_at_store,
    c.status,
    c.created_at,
    jsonb_array_length(c.claim_data) as item_count,
    (
        SELECT SUM((item->>'price')::NUMERIC * (item->>'quantity')::NUMERIC)
        FROM jsonb_array_elements(c.claim_data) AS item
    ) as total_claim_value
FROM claims c
JOIN users u ON c.user_id = u.id
JOIN stores s ON c.store_id = s.id;

-- =============================================================================
-- UTILITY FUNCTIONS FOR DATABASE MANAGEMENT
-- =============================================================================

-- Function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE(
    table_name TEXT,
    record_count BIGINT,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'stores'::TEXT,
        (SELECT COUNT(*) FROM stores),
        (SELECT MAX(created_at) FROM stores)
    UNION ALL
    SELECT 
        'users'::TEXT,
        (SELECT COUNT(*) FROM users),
        (SELECT MAX(created_at) FROM users)
    UNION ALL
    SELECT 
        'claims'::TEXT,
        (SELECT COUNT(*) FROM claims),
        (SELECT MAX(created_at) FROM claims);
END;
$$ LANGUAGE plpgsql;

-- Function to create a quick demo environment (combines table creation and seeding)
CREATE OR REPLACE FUNCTION setup_demo_environment()
RETURNS void AS $$
BEGIN
    -- Seed the demo data
    PERFORM seed_demo_data();
    
    -- Display statistics
    RAISE NOTICE 'Demo environment setup complete!';
    RAISE NOTICE 'Use SELECT * FROM get_database_stats(); to see current data counts';
    RAISE NOTICE 'Use SELECT * FROM claim_analytics; to see detailed claim analysis';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- QUICK COMMANDS FOR EASY DATABASE MANAGEMENT
-- =============================================================================

/*
USAGE INSTRUCTIONS:

1. To set up everything with demo data:
   SELECT setup_demo_environment();

2. To clear all data but keep tables:
   SELECT clear_demo_data();

3. To completely reset and start over:
   SELECT reset_database();
   -- Then re-run the table creation commands above

4. To add fresh demo data:
   SELECT seed_demo_data();

5. To check current data:
   SELECT * FROM get_database_stats();

6. To view detailed analytics:
   SELECT * FROM claim_analytics ORDER BY created_at DESC;

7. To see flagged users and their claims:
   SELECT * FROM claim_analytics WHERE is_flagged = true ORDER BY risk_score DESC;

8. To see high-risk claims:
   SELECT * FROM claim_analytics WHERE risk_score > 70 ORDER BY risk_score DESC;
*/
