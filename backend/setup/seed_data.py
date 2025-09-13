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
                'id': '550e8400-e29b-41d4-a716-446655440003',
                'full_name': 'Michael Brown',
                'dob': '1988-11-08',
                'risk_score': 85,
                'is_flagged': True
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440004',
                'full_name': 'Emily Davis',
                'dob': '1992-05-30',
                'risk_score': 15,
                'is_flagged': False
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440005',
                'full_name': 'David Wilson',
                'dob': '1987-09-12',
                'risk_score': 70,
                'is_flagged': True
            }
        ]
        users_result = supabase.table('users').insert(users_data).execute()
        print(f"    ✅ Created {len(users_result.data)} users")
        
        # Insert claims with realistic data
        print("  📋 Creating claims...")
        claims_data = [
            # Low risk user - John Smith
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
            
            # Medium risk user - Sarah Johnson
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440002',
                'store_id': stores_result.data[1]['id'],  # Best Buy
                'email_at_store': 'sarah.j@gmail.com',
                'status': 'PENDING',
                'claim_data': [{"item_name": "MacBook Pro 14-inch", "category": "electronics", "price": 1999.99, "quantity": 1}]
            },
            
            # High risk user - Michael Brown (flagged)
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
            
            # Low risk user - Emily Davis
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440004',
                'store_id': stores_result.data[2]['id'],  # Target
                'email_at_store': 'emily.davis@university.edu',
                'status': 'APPROVED',
                'claim_data': [{"item_name": "Textbook - Biology", "category": "books", "price": 89.99, "quantity": 1}]
            },
            
            # High risk user - David Wilson (flagged)
            {
                'user_id': '550e8400-e29b-41d4-a716-446655440005',
                'store_id': stores_result.data[4]['id'],  # Costco
                'email_at_store': 'd.wilson@different.com',
                'status': 'DENIED',
                'claim_data': [{"item_name": "Premium Vitamins", "category": "health", "price": 79.99, "quantity": 3}]
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
