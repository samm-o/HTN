#!/usr/bin/env python3
"""
Realistic fraud database seeding script for Project BASTION
Creates 365+ claims over last year with fraud-prone items for realistic charts
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.supabase_client import get_supabase
from datetime import datetime, timedelta
import random
import uuid

def seed_data():
    """Seed database with realistic fraud demo data"""
    print("🌱 Seeding database with realistic fraud demo data...")
    
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
        
        # Insert 20 users with realistic distribution
        print("  👤 Creating users...")
        users_data = []
        
        # Create different user types to balance fraud detection
        # 60% normal users (low risk), 25% medium risk, 15% high risk
        for i in range(1, 21):
            if i <= 12:  # First 12 users - normal/low risk (60%)
                risk_score = random.randint(15, 45)
                full_name = f'Normal User {i}'
            elif i <= 17:  # Next 5 users - medium risk (25%)
                risk_score = random.randint(46, 70)
                full_name = f'Medium Risk User {i}'
            else:  # Last 3 users - high risk (15%)
                risk_score = random.randint(71, 90)
                full_name = f'High Risk User {i}'
            
            users_data.append({
                'id': f'550e8400-e29b-41d4-a716-44665544{i:04d}',
                'full_name': full_name,
                'dob': f'198{random.randint(0,9)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}',
                'risk_score': risk_score,
                'is_flagged': risk_score > 70
            })
        users_result = supabase.table('users').insert(users_data).execute()
        
        # Generate 365+ claims with staggered dates over last year
        print("  📋 Creating 365+ claims with staggered dates over last year...")
        
        base_date = datetime.now()
        # Realistic ecommerce items with proper distribution
        # 45% Technology, 35% Apparel, 12% Home, 8% Other
        technology_items = [
            {"item_name": "iPhone 15 Pro", "category": "technology", "price": 999.99},
            {"item_name": "Samsung Galaxy S24", "category": "technology", "price": 799.99},
            {"item_name": "MacBook Air", "category": "technology", "price": 1099.99},
            {"item_name": "iPad", "category": "technology", "price": 329.99},
            {"item_name": "AirPods Pro", "category": "technology", "price": 249.99},
            {"item_name": "Sony Headphones", "category": "technology", "price": 299.99},
            {"item_name": "PlayStation 5", "category": "technology", "price": 499.99},
            {"item_name": "Nintendo Switch", "category": "technology", "price": 299.99},
            {"item_name": "Apple Watch", "category": "technology", "price": 399.99},
            {"item_name": "Samsung 55\" TV", "category": "technology", "price": 649.99},
            {"item_name": "Gaming Laptop", "category": "technology", "price": 1299.99},
            {"item_name": "Tablet", "category": "technology", "price": 199.99}
        ]
        
        apparel_items = [
            {"item_name": "Nike Air Jordans", "category": "apparel", "price": 170.00},
            {"item_name": "Adidas Sneakers", "category": "apparel", "price": 120.00},
            {"item_name": "Designer Hoodie", "category": "apparel", "price": 89.99},
            {"item_name": "Levi's Jeans", "category": "apparel", "price": 79.99},
            {"item_name": "North Face Jacket", "category": "apparel", "price": 199.99},
            {"item_name": "Running Shoes", "category": "apparel", "price": 129.99},
            {"item_name": "Winter Boots", "category": "apparel", "price": 149.99},
            {"item_name": "Dress Shirt", "category": "apparel", "price": 59.99},
            {"item_name": "Yoga Pants", "category": "apparel", "price": 49.99},
            {"item_name": "Baseball Cap", "category": "apparel", "price": 29.99}
        ]
        
        home_items = [
            {"item_name": "Coffee Maker", "category": "home", "price": 129.99},
            {"item_name": "Vacuum Cleaner", "category": "home", "price": 199.99},
            {"item_name": "Air Fryer", "category": "home", "price": 89.99},
            {"item_name": "Blender", "category": "home", "price": 79.99},
            {"item_name": "Bedding Set", "category": "home", "price": 69.99},
            {"item_name": "Kitchen Knife Set", "category": "home", "price": 99.99},
            {"item_name": "Throw Pillows", "category": "home", "price": 39.99},
            {"item_name": "Desk Lamp", "category": "home", "price": 49.99}
        ]
        
        other_items = [
            {"item_name": "Fitness Tracker", "category": "health", "price": 99.99},
            {"item_name": "Protein Powder", "category": "health", "price": 49.99},
            {"item_name": "Board Game", "category": "toys", "price": 34.99},
            {"item_name": "Backpack", "category": "accessories", "price": 59.99},
            {"item_name": "Sunglasses", "category": "accessories", "price": 79.99}
        ]
        
        
        # Add normal everyday items for low-risk users
        normal_items = [
            {"item_name": "Basic T-Shirt", "category": "clothing", "price": 19.99},
            {"item_name": "Jeans", "category": "clothing", "price": 49.99},
            {"item_name": "Coffee Mug", "category": "home", "price": 12.99},
            {"item_name": "Book", "category": "books", "price": 15.99},
            {"item_name": "Phone Charger", "category": "electronics", "price": 24.99},
            {"item_name": "Water Bottle", "category": "home", "price": 18.99},
            {"item_name": "Notebook", "category": "office", "price": 8.99},
            {"item_name": "Pen Set", "category": "office", "price": 12.99},
            {"item_name": "Socks", "category": "clothing", "price": 9.99},
            {"item_name": "Kitchen Towel", "category": "home", "price": 6.99}
        ]
        
        # Create weighted item pools for different user types
        # Fraud items pool (high-risk categories weighted by realistic fraud patterns)
        fraud_items_pool = (
            technology_items * 9 +     # 45% weight
            apparel_items * 7 +        # 35% weight  
            home_items * 2 +           # 12% weight
            other_items * 1            # 8% weight
        )
        
        normal_items_pool = normal_items * 10  # Mostly normal items
        mixed_items_pool = normal_items * 3 + fraud_items_pool  # Mix of both
        
        claims_data = []
        
        # Create a pool of anonymous users for old claims (>90 days ago)
        print("  👻 Creating anonymous users for historical claims...")
        anonymous_users = []
        for i in range(20):  # Create 20 anonymous users to reuse
            anonymous_user_id = str(uuid.uuid4())
            anonymous_user_data = {
                'id': anonymous_user_id,
                'full_name': f'Anonymous User {i + 1}',
                'dob': f'198{random.randint(0,9)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}',
                'risk_score': random.randint(20, 60),  # Mostly normal risk
                'is_flagged': False
            }
            anonymous_users.append(anonymous_user_data)
        
        # Insert all anonymous users at once
        supabase.table('users').insert(anonymous_users).execute()
        
        # Generate claims over last 365 days for better 3m/1y charts
        for day_offset in range(-365, 1):
            claim_date = base_date + timedelta(days=day_offset)
            
            # Variable claim volume based on time period and day of week
            # More recent = more claims, weekdays = more claims
            if day_offset > -30:  # Last 30 days - high volume
                base_claims = random.randint(3, 6)
            elif day_offset > -90:  # 30-90 days ago - medium volume  
                base_claims = random.randint(2, 4)
            elif day_offset > -180:  # 90-180 days ago - lower volume
                base_claims = random.randint(1, 3)
            else:  # 180+ days ago - lowest volume
                base_claims = random.randint(1, 2)
            
            # Weekend adjustment (less activity on weekends)
            if claim_date.weekday() >= 5:  # Saturday/Sunday
                daily_claims = max(1, base_claims - 1)
            else:
                daily_claims = base_claims
            
            for _ in range(daily_claims):
                # For older claims (>90 days), use anonymous users to avoid inflating dispute counts
                if day_offset < -90:
                    # Use one of the pre-created anonymous users
                    user = random.choice(anonymous_users)
                else:
                    # Use real users for recent claims (last 90 days)
                    user = random.choice(users_result.data)
                
                store = random.choice(stores_result.data)
                
                # Select item pool based on user risk and time period
                user_risk = user['risk_score']
                if user_risk <= 45:  # Low risk users
                    item = random.choice(normal_items_pool)
                elif user_risk <= 70:  # Medium risk users  
                    item = random.choice(mixed_items_pool)
                else:  # High risk users
                    item = random.choice(fraud_items_pool)
                
                # Add quantity to item (realistic quantities for different item types)
                if item['item_name'] in ['iPhone 15 Pro', 'MacBook Air', 'iPad', 'AirPods Pro', 'Samsung 55" TV', 'Gaming Laptop']:
                    # Electronics - usually 1-2 items
                    quantity = random.choices([1, 2], weights=[80, 20])[0]
                elif item['item_name'] in ['Nike Air Jordans', 'Adidas Sneakers', 'Designer Hoodie', 'North Face Jacket']:
                    # Fashion items - 1-3 items
                    quantity = random.choices([1, 2, 3], weights=[60, 30, 10])[0]
                elif item['item_name'] in ['Coffee Maker', 'Vacuum Cleaner', 'Air Fryer', 'Blender']:
                    # Home items - usually 1 item
                    quantity = 1
                else:
                    # Normal items - 1-5 items
                    quantity = random.choices([1, 2, 3, 4, 5], weights=[40, 30, 15, 10, 5])[0]
                
                # Add quantity to item data
                item_with_quantity = {
                    **item,
                    'quantity': quantity
                }
                
                # Realistic fraud patterns based on item value and user risk
                item_value = item['price'] * quantity
                
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
                
                # For all users (real and anonymous), use their ID directly
                user_id = user['id']
                
                claims_data.append({
                    'user_id': user_id,
                    'store_id': store['id'],
                    'email_at_store': email,
                    'status': status,
                    'claim_data': [item_with_quantity],
                    'created_at': claim_date.isoformat()
                })
        
        # Insert all claims
        claims_result = supabase.table('claims').insert(claims_data).execute()
        print(f"    ✅ Created {len(claims_result.data)} claims")
        
        print(f"\n✅ Realistic fraud data seeded successfully!")
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
    seed_data()
