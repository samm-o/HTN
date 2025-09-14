#!/usr/bin/env python3
"""
Simple database seeding script for Project BASTION
Works directly with Supabase tables
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.supabase_client import get_supabase

def seed_demo_data():
    """Seed database with demo data using direct table operations"""
    print("🌱 Seeding database with demo data...")
    
    supabase = get_supabase()
    
    try:
        # Clear existing data (in reverse order due to foreign keys)
        print("  🧹 Clearing existing data...")
        supabase.table('claims').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('users').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        # Insert stores
        print("  🏪 Creating stores...")
        stores_data = [
            {'name': 'Amazon'},
            {'name': 'Best Buy'},
            {'name': 'Target'},
            {'name': 'Walmart'},
            {'name': 'Costco'},
            {'name': 'Canadian Tire'},
            {'name': 'Loblaws'}
        ]
        stores_result = supabase.table('stores').insert(stores_data).execute()
        print(f"    ✅ Created {len(stores_result.data)} stores")
        
        # Insert users with fixed UUIDs for consistency
        print("  👤 Creating users...")
        users_data = [
            # Low risk users
            {
                'id': '550e8400-e29b-41d4-a716-446655440001',
                'full_name': 'John Smith',
                'dob': '1985-03-15',
                'risk_score': 25,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440002',
                'full_name': 'Sarah Johnson',
                'dob': '1990-07-22',
                'risk_score': 45,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440004',
                'full_name': 'Emily Davis',
                'dob': '1992-05-30',
                'risk_score': 15,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440006',
                'full_name': 'Lisa Anderson',
                'dob': '1991-01-25',
                'risk_score': 35,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440008',
                'full_name': 'Anna Martinez',
                'dob': '1993-08-17',
                'risk_score': 20,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440009',
                'full_name': 'Robert Chen',
                'dob': '1986-12-10',
                'risk_score': 30,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440010',
                'full_name': 'Jessica Williams',
                'dob': '1989-04-03',
                'risk_score': 40,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440011',
                'full_name': 'Kevin Thompson',
                'dob': '1994-09-28',
                'risk_score': 28,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440012',
                'full_name': 'Amanda Rodriguez',
                'dob': '1987-06-14',
                'risk_score': 35,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440013',
                'full_name': 'Mark Johnson',
                'dob': '1990-11-22',
                'risk_score': 42,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440014',
                'full_name': 'Rachel Green',
                'dob': '1988-02-18',
                'risk_score': 38,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440015',
                'full_name': 'Daniel Lee',
                'dob': '1992-08-05',
                'risk_score': 32,
                'is_flagged': False
            },
            # Medium risk users
            {
                'id': '550e8400-e29b-41d4-a716-446655440016',
                'full_name': 'Michelle Parker',
                'dob': '1985-10-12',
                'risk_score': 55,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440017',
                'full_name': 'Christopher Moore',
                'dob': '1991-03-27',
                'risk_score': 60,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440018',
                'full_name': 'Stephanie Clark',
                'dob': '1989-07-15',
                'risk_score': 58,
                'is_flagged': False
            },
            # High risk users (flagged)
            {
                'id': '550e8400-e29b-41d4-a716-446655440003',
                'full_name': 'Michael Brown',
                'dob': '1988-11-08',
                'risk_score': 85,
                'is_flagged': True
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440005',
                'full_name': 'David Wilson',
                'dob': '1987-09-12',
                'risk_score': 70,
                'is_flagged': True
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440007',
                'full_name': 'James Taylor',
                'dob': '1989-12-03',
                'risk_score': 90,
                'is_flagged': True
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440019',
                'full_name': 'Alexander Black',
                'dob': '1984-05-20',
                'risk_score': 78,
                'is_flagged': True
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440020',
                'full_name': 'Victoria Stone',
                'dob': '1986-01-08',
                'risk_score': 82,
                'is_flagged': True
            }
        ]
        users_result = supabase.table('users').insert(users_data).execute()
        print(f"    ✅ Created {len(users_result.data)} users")
        
        # Insert claims with realistic data and staggered dates
        print("  📋 Creating claims...")
        from datetime import datetime, timedelta
        
        # Generate dates over the last 30 days for realistic chart data
        base_date = datetime.now()
        date_offsets = [
            -30, -29, -28, -27, -26, -25, -24, -23, -22, -21,  # Week 1
            -20, -19, -18, -17, -16, -15, -14, -13, -12, -11,  # Week 2
            -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0         # Weeks 3-4
        ]
        
        claims_data = [
            # Low risk users - approved claims
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440001',
                'store_id': stores_result.data[0]['id'],  # Amazon
                'email_at_store': 'john.smith@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Wireless Headphones", "category": "electronics", "price": 79.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440001',
                'store_id': stores_result.data[2]['id'],  # Target
                'email_at_store': 'john.smith@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Cotton T-Shirt", "category": "clothing", "price": 19.99, "quantity": 2}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440004',
                'store_id': stores_result.data[2]['id'],  # Target
                'email_at_store': 'emily.davis@university.edu',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Textbook - Biology", "category": "books", "price": 89.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440006',
                'store_id': stores_result.data[3]['id'],  # Walmart
                'email_at_store': 'lisa.anderson@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Winter Coat", "category": "clothing", "price": 129.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440008',
                'store_id': stores_result.data[2]['id'],  # Target
                'email_at_store': 'anna.martinez@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Kitchen Appliance", "category": "home", "price": 49.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440009',
                'store_id': stores_result.data[0]['id'],  # Amazon
                'email_at_store': 'robert.chen@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Bluetooth Speaker", "category": "electronics", "price": 59.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440010',
                'store_id': stores_result.data[1]['id'],  # Best Buy
                'email_at_store': 'jessica.williams@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Tablet Case", "category": "electronics", "price": 29.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440011',
                'store_id': stores_result.data[4]['id'],  # Costco
                'email_at_store': 'kevin.thompson@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Protein Powder", "category": "health", "price": 39.99, "quantity": 2}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440012',
                'store_id': stores_result.data[5]['id'],  # Canadian Tire
                'email_at_store': 'amanda.rodriguez@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Tool Set", "category": "tools", "price": 89.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440013',
                'store_id': stores_result.data[6]['id'],  # Loblaws
                'email_at_store': 'mark.johnson@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Organic Food Bundle", "category": "grocery", "price": 67.50, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440014',
                'store_id': stores_result.data[0]['id'],  # Amazon
                'email_at_store': 'rachel.green@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Yoga Mat", "category": "fitness", "price": 34.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440015',
                'store_id': stores_result.data[1]['id'],  # Best Buy
                'email_at_store': 'daniel.lee@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "USB Cable", "category": "electronics", "price": 15.99, "quantity": 3}]
            },
            
            # Medium risk users - mixed status
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440002',
                'store_id': stores_result.data[1]['id'],  # Best Buy
                'email_at_store': 'sarah.j@gmail.com',
                'status': 'PENDING',
                'claim_data': [{"item_name": "MacBook Pro 14-inch", "category": "electronics", "price": 1999.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440016',
                'store_id': stores_result.data[0]['id'],  # Amazon
                'email_at_store': 'michelle.parker@email.com',
                'status': 'PENDING',
                'claim_data': [{"item_name": "Smart Watch", "category": "electronics", "price": 299.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440017',
                'store_id': stores_result.data[2]['id'],  # Target
                'email_at_store': 'christopher.moore@email.com',
                'status': 'DENIED',
                'claim_data': [{"item_name": "Designer Sunglasses", "category": "luxury", "price": 189.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440018',
                'store_id': stores_result.data[3]['id'],  # Walmart
                'email_at_store': 'stephanie.clark@email.com',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Coffee Maker", "category": "home", "price": 79.99, "quantity": 1}]
            },
            
            # High risk users (flagged) - mostly denied/pending
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440003',
                'store_id': stores_result.data[0]['id'],  # Amazon
                'email_at_store': 'mike.brown@email.com',
                'status': 'DENIED',
                'claim_data': [
                    {"item_name": "iPhone 15 Pro Max", "category": "electronics", "price": 1199.99, "quantity": 1},
                    {"item_name": "AirPods Pro", "category": "electronics", "price": 249.99, "quantity": 1}
                ]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440003',
                'store_id': stores_result.data[1]['id'],  # Best Buy
                'email_at_store': 'michael.b@tempmail.com',
                'status': 'PENDING',
                'claim_data': [{"item_name": "Gaming Laptop", "category": "electronics", "price": 2499.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440005',
                'store_id': stores_result.data[4]['id'],  # Costco
                'email_at_store': 'd.wilson@different.com',
                'status': 'DENIED',
                'claim_data': [{"item_name": "Premium Vitamins", "category": "health", "price": 79.99, "quantity": 3}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440005',
                'store_id': stores_result.data[0]['id'],  # Amazon
                'email_at_store': 'david.wilson@email.com',
                'status': 'DENIED',
                'claim_data': [{"item_name": "Smart TV 65-inch", "category": "electronics", "price": 899.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440007',
                'store_id': stores_result.data[1]['id'],  # Best Buy
                'email_at_store': 'james.taylor@email.com',
                'status': 'DENIED',
                'claim_data': [{"item_name": "4K TV 65-inch", "category": "electronics", "price": 1299.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440007',
                'store_id': stores_result.data[0]['id'],  # Amazon
                'email_at_store': 'j.taylor@temp.com',
                'status': 'DENIED',
                'claim_data': [{"item_name": "Professional Camera", "category": "electronics", "price": 1899.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440007',
                'store_id': stores_result.data[4]['id'],  # Costco
                'email_at_store': 'jtaylor123@fake.org',
                'status': 'DENIED',
                'claim_data': [{"item_name": "Diamond Ring", "category": "jewelry", "price": 2999.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440019',
                'store_id': stores_result.data[0]['id'],  # Amazon
                'email_at_store': 'alex.black@suspicious.com',
                'status': 'DENIED',
                'claim_data': [{"item_name": "Luxury Watch", "category": "luxury", "price": 1599.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440019',
                'store_id': stores_result.data[2]['id'],  # Target
                'email_at_store': 'alexander.b@temp.net',
                'status': 'PENDING',
                'claim_data': [{"item_name": "Power Tools Set", "category": "tools", "price": 459.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440020',
                'store_id': stores_result.data[1]['id'],  # Best Buy
                'email_at_store': 'victoria.stone@fake.com',
                'status': 'DENIED',
                'claim_data': [{"item_name": "Gaming Console", "category": "electronics", "price": 499.99, "quantity": 1}]
            },
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440020',
                'store_id': stores_result.data[3]['id'],  # Walmart
                'email_at_store': 'v.stone@different.org',
                'status': 'PENDING',
                'claim_data': [{"item_name": "Designer Handbag", "category": "luxury", "price": 389.99, "quantity": 1}]
            }
        ]
        
        claims_result = supabase.table('claims').insert(claims_data).execute()
        print(f"    ✅ Created {len(claims_result.data)} claims")
        
        print("\n✅ Demo data seeded successfully!")
        print(f"📊 Summary: {len(stores_result.data)} stores, {len(users_result.data)} users, {len(claims_result.data)} claims")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        raise

def clear_demo_data():
    """Clear all demo data from the database"""
    print("🧹 Clearing demo data...")
    
    try:
        supabase = get_supabase()
        
        # Clear in reverse order due to foreign key constraints
        supabase.table('claims').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('users').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        print("✅ Demo data cleared successfully!")
        
    except Exception as e:
        print(f"❌ Error clearing data: {e}")
        raise

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "clear":
        clear_demo_data()
    else:
        seed_demo_data()
