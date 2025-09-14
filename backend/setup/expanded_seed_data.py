#!/usr/bin/env python3
"""
Expanded database seeding script for Project BASTION
Creates 80+ claims with staggered dates for realistic charts
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.supabase_client import get_supabase
from datetime import datetime, timedelta
import random

def seed_expanded_data():
    """Seed database with expanded demo data"""
    print("🌱 Seeding database with expanded demo data...")
    
    supabase = get_supabase()
    
    try:
        # Clear existing data
        print("  🧹 Clearing existing data...")
        supabase.table('claims').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('users').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        # Insert stores
        print("  🏪 Creating stores...")
        stores_data = [
            {'name': 'Amazon'}, {'name': 'Best Buy'}, {'name': 'Target'},
            {'name': 'Walmart'}, {'name': 'Costco'}, {'name': 'Canadian Tire'},
            {'name': 'Loblaws'}, {'name': 'Home Depot'}, {'name': 'Shoppers Drug Mart'}
        ]
        stores_result = supabase.table('stores').insert(stores_data).execute()
        
        # Insert 25 users
        print("  👤 Creating users...")
        users_data = []
        for i in range(1, 26):
            risk_score = random.randint(15, 95)
            users_data.append({
                'id': f'550e8400-e29b-41d4-a716-44665544{i:04d}',
                'full_name': f'User {i}',
                'dob': f'198{random.randint(0,9)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}',
                'risk_score': risk_score,
                'is_flagged': risk_score > 70
            })
        users_result = supabase.table('users').insert(users_data).execute()
        
        # Generate 80+ claims with staggered dates
        print("  📋 Creating 80+ claims with staggered dates...")
        
        base_date = datetime.now()
        items_pool = [
            {"item_name": "iPhone 15", "category": "electronics", "price": 999.99},
            {"item_name": "MacBook Pro", "category": "electronics", "price": 1999.99},
            {"item_name": "Nike Shoes", "category": "clothing", "price": 129.99},
            {"item_name": "Winter Jacket", "category": "clothing", "price": 89.99},
            {"item_name": "Python Book", "category": "books", "price": 49.99},
            {"item_name": "Cookbook", "category": "books", "price": 29.99},
            {"item_name": "Vitamins", "category": "health", "price": 39.99},
            {"item_name": "Protein Powder", "category": "health", "price": 59.99},
            {"item_name": "Drill Set", "category": "tools", "price": 149.99},
            {"item_name": "Hammer", "category": "tools", "price": 24.99},
            {"item_name": "Organic Milk", "category": "grocery", "price": 5.99},
            {"item_name": "Bread", "category": "grocery", "price": 3.49},
            {"item_name": "Yoga Mat", "category": "fitness", "price": 34.99},
            {"item_name": "Dumbbells", "category": "fitness", "price": 79.99},
            {"item_name": "Designer Watch", "category": "luxury", "price": 899.99},
            {"item_name": "Gold Necklace", "category": "jewelry", "price": 1299.99},
            {"item_name": "Coffee Maker", "category": "home", "price": 89.99}
        ]
        
        claims_data = []
        
        # Generate claims over last 30 days
        for day_offset in range(-30, 1):
            claim_date = base_date + timedelta(days=day_offset)
            
            # Generate 2-4 claims per day
            daily_claims = random.randint(2, 4)
            
            for _ in range(daily_claims):
                user = random.choice(users_result.data)
                store = random.choice(stores_result.data)
                item = random.choice(items_pool)
                
                # Status based on user risk
                if user['risk_score'] > 70:
                    status = random.choice(['DENIED', 'PENDING', 'DENIED'])  # Mostly denied
                elif user['risk_score'] > 50:
                    status = random.choice(['APPROVED', 'PENDING', 'DENIED'])  # Mixed
                else:
                    status = random.choice(['APPROVED', 'APPROVED', 'PENDING'])  # Mostly approved
                
                claims_data.append({
                    'user_id': user['id'],
                    'store_id': store['id'],
                    'email_at_store': f"user{user['id'][-4:]}@email.com",
                    'status': status,
                    'claim_data': [item],
                    'created_at': claim_date.isoformat()
                })
        
        # Insert all claims
        claims_result = supabase.table('claims').insert(claims_data).execute()
        print(f"    ✅ Created {len(claims_result.data)} claims")
        
        print(f"\n✅ Expanded data seeded successfully!")
        print(f"📊 Summary: {len(stores_result.data)} stores, {len(users_result.data)} users, {len(claims_result.data)} claims")
        
        # Print statistics
        approved = len([c for c in claims_data if c['status'] == 'APPROVED'])
        denied = len([c for c in claims_data if c['status'] == 'DENIED'])
        pending = len([c for c in claims_data if c['status'] == 'PENDING'])
        
        print(f"📈 Claim Status: {approved} approved, {denied} denied, {pending} pending")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        raise

if __name__ == "__main__":
    seed_expanded_data()
