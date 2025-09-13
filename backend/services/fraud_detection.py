from typing import List, Dict, Any
from datetime import datetime, timedelta
from schemas import ItemData, User, Claim
from core.supabase_client import get_supabase
import uuid

class FraudDetectionService:
    def __init__(self):
        self.supabase = get_supabase()
    
    def calculate_risk_score(self, user_id: uuid.UUID, claim_data: List[ItemData], 
                           email_at_store: str, store_id: uuid.UUID) -> int:
        """
        Calculate fraud risk score based on multiple factors
        Returns score from 0-100 (percentage)
        """
        risk_factors = []
        
        # Factor 1: Claim frequency (30%)
        frequency_score = self._calculate_frequency_risk(user_id)
        risk_factors.append(('frequency', frequency_score, 0.30))
        
        # Factor 2: Claim value (25%)
        value_score = self._calculate_value_risk(claim_data, user_id)
        risk_factors.append(('value', value_score, 0.25))
        
        # Factor 3: Email pattern analysis (20%)
        email_score = self._calculate_email_risk(user_id, email_at_store)
        risk_factors.append(('email', email_score, 0.20))
        
        # Factor 4: Item category risk (15%)
        category_score = self._calculate_category_risk(claim_data)
        risk_factors.append(('category', category_score, 0.15))
        
        # Factor 5: Store-specific patterns (10%)
        store_score = self._calculate_store_risk(user_id, store_id)
        risk_factors.append(('store', store_score, 0.10))
        
        # Calculate weighted score
        total_score = sum(score * weight for _, score, weight in risk_factors)
        
        return min(100, max(0, int(total_score)))
    
    def _calculate_frequency_risk(self, user_id: uuid.UUID) -> int:
        """Calculate risk based on claim frequency"""
        try:
            # Get claims in last 30 days
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            response = self.supabase.table('claims').select('*').eq('user_id', str(user_id)).gte('created_at', thirty_days_ago.isoformat()).execute()
            
            recent_claims = len(response.data) if response.data else 0
            
            # Risk scoring based on frequency
            if recent_claims == 0:
                return 0
            elif recent_claims <= 2:
                return 20
            elif recent_claims <= 5:
                return 50
            elif recent_claims <= 10:
                return 75
            else:
                return 100
                
        except Exception:
            return 30  # Default moderate risk if query fails
    
    def _calculate_value_risk(self, claim_data: List[ItemData], user_id: uuid.UUID) -> int:
        """Calculate risk based on claim value"""
        current_claim_value = sum(item.price * item.quantity for item in claim_data)
        
        try:
            # Get user's historical average claim value
            response = self.supabase.table('claims').select('claim_data').eq('user_id', str(user_id)).execute()
            
            if not response.data:
                # New user - moderate risk for high-value claims
                if current_claim_value > 1000:
                    return 60
                elif current_claim_value > 500:
                    return 30
                else:
                    return 10
            
            # Calculate historical average
            total_value = 0
            claim_count = 0
            
            for claim in response.data:
                if claim.get('claim_data'):
                    for item in claim['claim_data']:
                        total_value += item.get('price', 0) * item.get('quantity', 1)
                    claim_count += 1
            
            if claim_count == 0:
                avg_value = 0
            else:
                avg_value = total_value / claim_count
            
            # Risk based on deviation from average
            if avg_value == 0:
                return 20 if current_claim_value > 500 else 10
            
            ratio = current_claim_value / avg_value
            
            if ratio <= 1.5:
                return 10
            elif ratio <= 3:
                return 30
            elif ratio <= 5:
                return 60
            else:
                return 90
                
        except Exception:
            return 25  # Default moderate risk
    
    def _calculate_email_risk(self, user_id: uuid.UUID, email_at_store: str) -> int:
        """Calculate risk based on email usage patterns"""
        try:
            # Get all emails used by this user
            response = self.supabase.table('claims').select('email_at_store').eq('user_id', str(user_id)).execute()
            
            if not response.data:
                return 10  # New user, low risk
            
            used_emails = set(claim['email_at_store'] for claim in response.data if claim.get('email_at_store'))
            used_emails.add(email_at_store)
            
            # Risk based on number of different emails
            email_count = len(used_emails)
            
            if email_count <= 2:
                return 5
            elif email_count <= 4:
                return 25
            elif email_count <= 6:
                return 50
            else:
                return 80
                
        except Exception:
            return 15  # Default low-moderate risk
    
    def _calculate_category_risk(self, claim_data: List[ItemData]) -> int:
        """Calculate risk based on item categories"""
        high_risk_categories = {'electronics', 'jewelry', 'luxury', 'designer', 'gaming'}
        medium_risk_categories = {'clothing', 'accessories', 'sports', 'beauty'}
        
        categories = [item.category.lower() for item in claim_data]
        
        high_risk_count = sum(1 for cat in categories if cat in high_risk_categories)
        medium_risk_count = sum(1 for cat in categories if cat in medium_risk_categories)
        
        total_items = len(claim_data)
        
        if total_items == 0:
            return 0
        
        high_risk_ratio = high_risk_count / total_items
        medium_risk_ratio = medium_risk_count / total_items
        
        if high_risk_ratio >= 0.8:
            return 70
        elif high_risk_ratio >= 0.5:
            return 50
        elif medium_risk_ratio >= 0.8:
            return 30
        else:
            return 10
    
    def _calculate_store_risk(self, user_id: uuid.UUID, store_id: uuid.UUID) -> int:
        """Calculate risk based on store-specific patterns"""
        try:
            # Get claims from this store by this user
            response = self.supabase.table('claims').select('*').eq('user_id', str(user_id)).eq('store_id', str(store_id)).execute()
            
            store_claims = len(response.data) if response.data else 0
            
            # Get total claims by this user
            total_response = self.supabase.table('claims').select('*').eq('user_id', str(user_id)).execute()
            total_claims = len(total_response.data) if total_response.data else 0
            
            if total_claims == 0:
                return 5  # New user
            
            # Risk if user concentrates claims on single store
            concentration_ratio = store_claims / total_claims
            
            if concentration_ratio >= 0.8 and total_claims >= 5:
                return 60
            elif concentration_ratio >= 0.6 and total_claims >= 3:
                return 40
            else:
                return 10
                
        except Exception:
            return 10  # Default low risk
    
    def should_flag_user(self, risk_score: int, user_id: uuid.UUID) -> bool:
        """Determine if user should be flagged based on risk score and history"""
        # Auto-flag for very high risk scores
        if risk_score >= 85:
            return True
        
        # Check if user has been flagged before
        try:
            response = self.supabase.table('users').select('is_flagged').eq('id', str(user_id)).execute()
            if response.data and response.data[0].get('is_flagged'):
                # Already flagged user - lower threshold
                return risk_score >= 60
        except Exception:
            pass
        
        # Standard flagging threshold
        return risk_score >= 75
