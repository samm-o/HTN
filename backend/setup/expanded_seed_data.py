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
        # Realistic fraud-prone items with proper distribution
        # 45% Technology, 27% Apparel, 15% Jewelry, 8% Furniture, 5% Other
        technology_items = [
            {"item_name": "iPhone 15 Pro Max", "category": "technology", "price": 1199.99},
            {"item_name": "iPhone 14 Pro", "category": "technology", "price": 999.99},
            {"item_name": "Samsung Galaxy S24 Ultra", "category": "technology", "price": 1299.99},
            {"item_name": "MacBook Pro 16-inch", "category": "technology", "price": 2499.99},
            {"item_name": "MacBook Air M2", "category": "technology", "price": 1199.99},
            {"item_name": "iPad Pro 12.9-inch", "category": "technology", "price": 1099.99},
            {"item_name": "AirPods Pro 2", "category": "technology", "price": 249.99},
            {"item_name": "Sony WH-1000XM5", "category": "technology", "price": 399.99},
            {"item_name": "PlayStation 5", "category": "technology", "price": 499.99},
            {"item_name": "Xbox Series X", "category": "technology", "price": 499.99},
            {"item_name": "Nintendo Switch OLED", "category": "technology", "price": 349.99},
            {"item_name": "Apple Watch Ultra 2", "category": "technology", "price": 799.99},
            {"item_name": "Samsung 65\" QLED TV", "category": "technology", "price": 1299.99},
            {"item_name": "Canon EOS R5", "category": "technology", "price": 3899.99},
            {"item_name": "Sony A7R V", "category": "technology", "price": 3898.99},
            {"item_name": "DJI Mini 4 Pro", "category": "technology", "price": 759.99},
            {"item_name": "Gaming Laptop RTX 4080", "category": "technology", "price": 2299.99},
            {"item_name": "Surface Pro 9", "category": "technology", "price": 999.99}
        ]
        
        apparel_items = [
            {"item_name": "Air Jordan 1 Retro High", "category": "apparel", "price": 170.00},
            {"item_name": "Nike Dunk Low", "category": "apparel", "price": 100.00},
            {"item_name": "Yeezy Boost 350 V2", "category": "apparel", "price": 220.00},
            {"item_name": "Off-White Hoodie", "category": "apparel", "price": 595.00},
            {"item_name": "Supreme Box Logo Tee", "category": "apparel", "price": 198.00},
            {"item_name": "Canada Goose Parka", "category": "apparel", "price": 1295.00},
            {"item_name": "Stone Island Jacket", "category": "apparel", "price": 675.00},
            {"item_name": "Balenciaga Triple S", "category": "apparel", "price": 1050.00},
            {"item_name": "Golden Goose Sneakers", "category": "apparel", "price": 495.00},
            {"item_name": "Moncler Down Jacket", "category": "apparel", "price": 1590.00},
            {"item_name": "Travis Scott Jordan 1", "category": "apparel", "price": 1500.00},
            {"item_name": "Fear of God Essentials Hoodie", "category": "apparel", "price": 100.00}
        ]
        
        jewelry_items = [
            {"item_name": "Rolex Submariner", "category": "jewelry", "price": 8100.00},
            {"item_name": "Cartier Love Bracelet", "category": "jewelry", "price": 6300.00},
            {"item_name": "Tiffany & Co. Engagement Ring", "category": "jewelry", "price": 5200.00},
            {"item_name": "Apple Watch Hermès", "category": "jewelry", "price": 1299.00},
            {"item_name": "Pandora Charm Bracelet", "category": "jewelry", "price": 299.99},
            {"item_name": "14K Gold Chain Necklace", "category": "jewelry", "price": 899.99},
            {"item_name": "Diamond Stud Earrings", "category": "jewelry", "price": 1599.99},
            {"item_name": "Omega Speedmaster", "category": "jewelry", "price": 5350.00}
        ]
        
        furniture_items = [
            {"item_name": "Herman Miller Aeron Chair", "category": "furniture", "price": 1395.00},
            {"item_name": "West Elm Mid-Century Sofa", "category": "furniture", "price": 1299.00},
            {"item_name": "Restoration Hardware Dining Table", "category": "furniture", "price": 2495.00},
            {"item_name": "CB2 Velvet Sectional", "category": "furniture", "price": 1899.00}
        ]
        
        other_items = [
            {"item_name": "Dyson V15 Detect", "category": "home", "price": 749.99},
            {"item_name": "KitchenAid Stand Mixer", "category": "home", "price": 379.99},
            {"item_name": "Vitamix Blender", "category": "home", "price": 549.95}
        ]
        
        # Create weighted item pool based on fraud distribution
        items_pool = (
            technology_items * 9 +  # 45% weight
            apparel_items * 5 +     # 27% weight  
            jewelry_items * 3 +     # 15% weight
            furniture_items * 2 +   # 8% weight
            other_items * 1         # 5% weight
        )
        
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
                
                # Realistic fraud patterns based on item value and user risk
                item_value = item['price']
                user_risk = user['risk_score']
                
                # High-value items (>$1000) are more likely to be flagged
                high_value_item = item_value > 1000
                
                # Status logic based on realistic fraud detection patterns
                if user_risk > 70:  # High risk users
                    if high_value_item:
                        # High risk + high value = almost always denied
                        status = random.choices(['APPROVED', 'DENIED', 'PENDING'], weights=[5, 80, 15])[0]
                    else:
                        # High risk + lower value = mostly denied but some slip through
                        status = random.choices(['APPROVED', 'DENIED', 'PENDING'], weights=[15, 70, 15])[0]
                elif user_risk > 50:  # Medium risk users
                    if high_value_item:
                        # Medium risk + high value = careful review
                        status = random.choices(['APPROVED', 'DENIED', 'PENDING'], weights=[40, 35, 25])[0]
                    else:
                        # Medium risk + lower value = mostly approved
                        status = random.choices(['APPROVED', 'DENIED', 'PENDING'], weights=[70, 20, 10])[0]
                else:  # Low risk users
                    if high_value_item:
                        # Low risk + high value = some scrutiny but mostly approved
                        status = random.choices(['APPROVED', 'DENIED', 'PENDING'], weights=[75, 10, 15])[0]
                    else:
                        # Low risk + lower value = almost always approved
                        status = random.choices(['APPROVED', 'DENIED', 'PENDING'], weights=[90, 5, 5])[0]
                
                # Generate realistic email patterns for fraudsters
                if user_risk > 70:
                    # High risk users often use suspicious email patterns
                    email_patterns = [
                        f"user{user['id'][-4:]}@tempmail.com",
                        f"buyer{random.randint(100,999)}@gmail.com", 
                        f"customer{user['id'][-3:]}@yahoo.com",
                        f"temp{random.randint(10,99)}@outlook.com"
                    ]
                    email = random.choice(email_patterns)
                else:
                    # Low/medium risk users have normal emails
                    email = f"user{user['id'][-4:]}@email.com"
                
                claims_data.append({
                    'user_id': user['id'],
                    'store_id': store['id'],
                    'email_at_store': email,
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
