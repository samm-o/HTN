"""
Risk Score Caching Service
Handles background calculation and caching of user risk scores to improve performance
"""

import asyncio
import uuid
from typing import Dict, Optional, Any
from datetime import datetime, timedelta
import json
from core.supabase_client import get_supabase_client
from services.ml_fraud_service import MLFraudService

class RiskScoreCache:
    """
    Manages risk score calculation and caching for all users
    """
    
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ml_fraud_service = MLFraudService()
        self.supabase = get_supabase_client()
        self.last_updated = {}
        self.calculation_in_progress = set()
    
    async def initialize_cache(self):
        """Initialize cache with all users on startup"""
        print("🚀 Starting risk score cache initialization...")
        
        try:
            # Get all users
            users_response = self.supabase.table("users").select("id, full_name, created_at").execute()
            
            if not users_response.data:
                print("No users found to calculate risk scores for")
                return
            
            total_users = len(users_response.data)
            print(f"📊 Calculating risk scores for {total_users} users...")
            
            # Calculate risk scores for all users in batches to avoid overwhelming the system
            batch_size = 5
            for i in range(0, total_users, batch_size):
                batch = users_response.data[i:i + batch_size]
                tasks = []
                
                for user in batch:
                    user_id = user["id"]
                    if user_id not in self.calculation_in_progress:
                        self.calculation_in_progress.add(user_id)
                        tasks.append(self._calculate_user_risk_score(user_id))
                
                # Process batch concurrently
                if tasks:
                    await asyncio.gather(*tasks, return_exceptions=True)
                
                # Small delay between batches to prevent overwhelming the system
                await asyncio.sleep(0.1)
            
            print(f"✅ Risk score cache initialization complete! Cached {len(self.cache)} users")
            
        except Exception as e:
            print(f"❌ Error initializing risk score cache: {e}")
    
    async def _calculate_user_risk_score(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Calculate risk score for a single user"""
        try:
            # Get user's claims
            claims_response = self.supabase.table("claims").select(
                "id, status, created_at, claim_data"
            ).eq("user_id", user_id).execute()
            
            claims = claims_response.data if claims_response.data else []
            
            # If no claims, mark as insufficient data
            if not claims:
                risk_data = {
                    "risk_score": None,  # N/A
                    "is_flagged": False,
                    "insufficient_data": True,
                    "total_claims": 0,
                    "last_calculated": datetime.utcnow().isoformat()
                }
                self.cache[user_id] = risk_data
                self.calculation_in_progress.discard(user_id)
                return risk_data
            
            # Calculate statistics
            total_claims = len(claims)
            pending_claims = len([c for c in claims if c["status"] == "PENDING"])
            approved_claims = len([c for c in claims if c["status"] == "APPROVED"])
            denied_claims = len([c for c in claims if c["status"] == "DENIED"])
            
            # Process claims for ML analysis
            processed_claims = []
            total_value = 0
            
            for claim in claims:
                claim_data = claim.get("claim_data", [])
                if isinstance(claim_data, str):
                    try:
                        claim_data = json.loads(claim_data)
                    except:
                        claim_data = []
                
                if claim_data:
                    claim_value = sum(float(item.get("price", 0)) * int(item.get("quantity", 1)) for item in claim_data)
                    total_value += claim_value
                    processed_claims.append({
                        "items": claim_data,
                        "status": claim["status"],
                        "value": claim_value
                    })
            
            # Calculate risk score using ML fraud detection
            calculated_risk_score = 0
            calculated_is_flagged = False
            
            if processed_claims:
                # Calculate risk score based on all user's claims
                risk_scores = []
                high_risk_claims = 0
                
                for claim in processed_claims:
                    if claim["items"]:
                        # Calculate fraud score for this claim
                        fraud_analysis = await self.ml_fraud_service.calculate_fraud_score(
                            user_id=uuid.UUID(user_id),
                            claim_data=claim["items"]
                        )
                        risk_scores.append(fraud_analysis["fraud_score"])
                        
                        # Count high-risk claims (score > 70)
                        if fraud_analysis["fraud_score"] > 70:
                            high_risk_claims += 1
                
                if risk_scores:
                    # Calculate weighted risk score
                    avg_risk_score = sum(risk_scores) / len(risk_scores)
                    
                    # Apply penalties for patterns
                    penalty_factors = 0
                    
                    # Penalty for high denial rate
                    if total_claims > 0:
                        denial_rate = denied_claims / total_claims
                        if denial_rate > 0.5:  # More than 50% denied
                            penalty_factors += 20
                        elif denial_rate > 0.3:  # More than 30% denied
                            penalty_factors += 10
                    
                    # Penalty for high-value claims
                    if total_claims > 0:
                        avg_claim_value = total_value / total_claims
                        if avg_claim_value > 500:  # High-value claims
                            penalty_factors += 15
                        elif avg_claim_value > 200:  # Medium-value claims
                            penalty_factors += 5
                    
                    # Penalty for frequent claims
                    if total_claims > 10:  # More than 10 claims
                        penalty_factors += 10
                    elif total_claims > 5:  # More than 5 claims
                        penalty_factors += 5
                    
                    # Penalty for high proportion of high-risk claims
                    if total_claims > 0:
                        high_risk_ratio = high_risk_claims / total_claims
                        if high_risk_ratio > 0.5:  # More than 50% high-risk
                            penalty_factors += 25
                        elif high_risk_ratio > 0.3:  # More than 30% high-risk
                            penalty_factors += 15
                    
                    # Calculate final risk score
                    calculated_risk_score = min(100, int(avg_risk_score + penalty_factors))
                    calculated_is_flagged = calculated_risk_score > 75
            
            # Cache the results
            risk_data = {
                "risk_score": calculated_risk_score,
                "is_flagged": calculated_is_flagged,
                "insufficient_data": False,
                "total_claims": total_claims,
                "pending_claims": pending_claims,
                "approved_claims": approved_claims,
                "denied_claims": denied_claims,
                "total_value": total_value,
                "last_calculated": datetime.utcnow().isoformat()
            }
            
            self.cache[user_id] = risk_data
            self.last_updated[user_id] = datetime.utcnow()
            
            # Update database with calculated values
            self.supabase.table("users").update({
                "risk_score": calculated_risk_score,
                "is_flagged": calculated_is_flagged
            }).eq("id", user_id).execute()
            
            self.calculation_in_progress.discard(user_id)
            return risk_data
            
        except Exception as e:
            print(f"Error calculating risk score for user {user_id}: {e}")
            self.calculation_in_progress.discard(user_id)
            return None
    
    async def get_user_risk_score(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get cached risk score for a user"""
        if user_id in self.cache:
            return self.cache[user_id]
        
        # If not in cache and not currently being calculated, calculate it
        if user_id not in self.calculation_in_progress:
            return await self._calculate_user_risk_score(user_id)
        
        return None
    
    async def recalculate_user_risk_score(self, user_id: str):
        """Recalculate risk score for a specific user (when new claim is added)"""
        if user_id not in self.calculation_in_progress:
            await self._calculate_user_risk_score(user_id)
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_users = len(self.cache)
        users_with_data = len([u for u in self.cache.values() if not u.get("insufficient_data", False)])
        users_without_data = total_users - users_with_data
        
        return {
            "total_cached_users": total_users,
            "users_with_risk_scores": users_with_data,
            "users_with_insufficient_data": users_without_data,
            "calculations_in_progress": len(self.calculation_in_progress)
        }

# Global cache instance
risk_score_cache = RiskScoreCache()
