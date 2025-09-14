#!/usr/bin/env python3
"""
Realistic database seeding script for Project BASTION
Creates realistic company profile data with proper metrics
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.supabase_client import get_supabase
from datetime import datetime, timedelta
import random

def seed_realistic_data():
    """Seed database with realistic demo data for company profiles"""
    print("🌱 Seeding database with realistic company profile data...")
    
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
        
        # Insert 30 users with realistic risk distribution
        print("  👤 Creating users...")
        users_data = []
        
        # 70% low risk (15-45), 20% medium risk (46-70), 10% high risk (71-90)
        risk_distribution = (
            [random.randint(15, 45) for _ in range(21)] +  # 21 low risk
            [random.randint(46, 70) for _ in range(6)] +   # 6 medium risk  
            [random.randint(71, 90) for _ in range(3)]     # 3 high risk
        )
        
        for i in range(1, 31):
            risk_score = risk_distribution[i-1]
            users_data.append({
                'id': f'550e8400-e29b-41d4-a716-44665544{i:04d}',
                'full_name': f'User {i}',
                'dob': f'198{random.randint(0,9)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}',
                'risk_score': risk_score,
                'is_flagged': risk_score > 70
            })
        users_result = supabase.table('users').insert(users_data).execute()
        
        # Generate realistic claims with proper date distribution
        print("  📋 Creating realistic claims...")
        
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
            {"item_name": "Coffee Maker", "category": "home", "price": 89.99}
        ]
        
        claims_data = []
        
        # Generate claims for last 30 days with realistic patterns
        for day_offset in range(-30, 1):
            claim_date = base_date + timedelta(days=day_offset)
            
            # More claims on weekdays, fewer on weekends
            if claim_date.weekday() < 5:  # Monday-Friday
                daily_claims = random.randint(3, 6)
            else:  # Weekend
                daily_claims = random.randint(1, 3)
            
            for _ in range(daily_claims):
                user = random.choice(users_result.data)
                store = random.choice(stores_result.data)
                item = random.choice(items_pool)
                
                # Realistic status distribution based on user risk
                if user['risk_score'] > 70:  # High risk - mostly denied
                    status = random.choices(['APPROVED', 'DENIED', 'PENDING'], weights=[10, 70, 20])[0]
                elif user['risk_score'] > 50:  # Medium risk - mixed
                    status = random.choices(['APPROVED', 'DENIED', 'PENDING'], weights=[60, 25, 15])[0]
                else:  # Low risk - mostly approved
                    status = random.choices(['APPROVED', 'DENIED', 'PENDING'], weights=[85, 5, 10])[0]
                
                claims_data.append({
                    'user_id': user['id'],
                    'store_id': store['id'],
                    'email_at_store': f"user{user['id'][-4:]}@email.com",
                    'status': status,
                    'claim_data': [item],
                    'created_at': claim_date.isoformat()
                })
        
        # Add specific data for last 7 days to ensure realistic company profile
        print("  📊 Adding specific 7-day data for company profile...")
        
        # Clear last 7 days and add controlled data
        seven_days_ago = base_date - timedelta(days=7)
        recent_claims = [c for c in claims_data if datetime.fromisoformat(c['created_at']) >= seven_days_ago]
        older_claims = [c for c in claims_data if datetime.fromisoformat(c['created_at']) < seven_days_ago]
        
        # Create realistic 7-day data
        # Target: 25 approved, 12 suspicious (denied/pending), ~68% approval rate
        seven_day_claims = []
        
        # Generate exactly 37 claims over 7 days (25 approved + 12 suspicious)
        for day_offset in range(-7, 0):
            claim_date = base_date + timedelta(days=day_offset)
            
            # Distribute claims across days (4-6 per day)
            if day_offset == -7:  # Day 1
                daily_approved = 4
                daily_suspicious = 2
            elif day_offset == -6:  # Day 2
                daily_approved = 3
                daily_suspicious = 2
            elif day_offset == -5:  # Day 3
                daily_approved = 4
                daily_suspicious = 1
            elif day_offset == -4:  # Day 4
                daily_approved = 3
                daily_suspicious = 2
            elif day_offset == -3:  # Day 5
                daily_approved = 4
                daily_suspicious = 2
            elif day_offset == -2:  # Day 6
                daily_approved = 3
                daily_suspicious = 1
            else:  # Day 7 (yesterday)
                daily_approved = 4
                daily_suspicious = 2
            
            # Add approved claims
            for _ in range(daily_approved):
                user = random.choice([u for u in users_result.data if u['risk_score'] <= 50])
                store = random.choice(stores_result.data)
                item = random.choice(items_pool)
                
                seven_day_claims.append({
                    'user_id': user['id'],
                    'store_id': store['id'],
                    'email_at_store': f"user{user['id'][-4:]}@email.com",
                    'status': 'APPROVED',
                    'claim_data': [item],
                    'created_at': claim_date.isoformat()
                })
            
            # Add suspicious claims (mix of denied and pending)
            for i in range(daily_suspicious):
                user = random.choice([u for u in users_result.data if u['risk_score'] > 60])
                store = random.choice(stores_result.data)
                item = random.choice(items_pool)
                
                # Mix of denied and pending for suspicious
                status = 'DENIED' if i % 2 == 0 else 'PENDING'
                
                seven_day_claims.append({
                    'user_id': user['id'],
                    'store_id': store['id'],
                    'email_at_store': f"user{user['id'][-4:]}@email.com",
                    'status': status,
                    'claim_data': [item],
                    'created_at': claim_date.isoformat()
                })
        
        # Combine older claims with new 7-day data
        final_claims = older_claims + seven_day_claims
        
        # Insert all claims
        claims_result = supabase.table('claims').insert(final_claims).execute()
        print(f"    ✅ Created {len(claims_result.data)} claims")
        
        print(f"\n✅ Realistic data seeded successfully!")
        print(f"📊 Summary: {len(stores_result.data)} stores, {len(users_result.data)} users, {len(claims_result.data)} claims")
        
        # Print 7-day statistics for verification
        seven_day_approved = len([c for c in seven_day_claims if c['status'] == 'APPROVED'])
        seven_day_denied = len([c for c in seven_day_claims if c['status'] == 'DENIED'])
        seven_day_pending = len([c for c in seven_day_claims if c['status'] == 'PENDING'])
        seven_day_suspicious = seven_day_denied + seven_day_pending
        seven_day_total = len(seven_day_claims)
        approval_rate = (seven_day_approved / seven_day_total) * 100
        
        print(f"\n📈 Last 7 Days Statistics:")
        print(f"   • Total Claims: {seven_day_total}")
        print(f"   • Approved: {seven_day_approved}")
        print(f"   • Suspicious (Denied + Pending): {seven_day_suspicious}")
        print(f"   • Approval Rate: {approval_rate:.1f}%")
        
        # Print overall statistics
        all_approved = len([c for c in final_claims if c['status'] == 'APPROVED'])
        all_denied = len([c for c in final_claims if c['status'] == 'DENIED'])
        all_pending = len([c for c in final_claims if c['status'] == 'PENDING'])
        
        print(f"\n📈 Overall Statistics:")
        print(f"   • Total Claims: {len(final_claims)}")
        print(f"   • Approved: {all_approved}")
        print(f"   • Denied: {all_denied}")
        print(f"   • Pending: {all_pending}")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        raise

if __name__ == "__main__":
    seed_realistic_data()
