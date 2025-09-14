import os
import cohere
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import uuid
from collections import Counter
from .cohere_scorer import CohereEnhancedFraudDetector
from crud.crud_customer import CustomerCRUD
from crud.crud_claim import ClaimCRUD
from core.supabase_client import get_supabase

# Load environment variables
load_dotenv()

class MLFraudService:
    """
    ML-powered fraud detection service using Cohere's AI models.
    Replaces the traditional fraud_detection.py with advanced behavioral analysis.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.client = cohere.ClientV2(api_key=api_key or os.getenv("COHERE_API_KEY"))
        self.customer_crud = CustomerCRUD()
        self.claim_crud = ClaimCRUD()
        self.supabase = get_supabase()
        
        # Fraud pattern templates for Cohere reranking
        self.fraud_patterns = [
            "Customer returns expensive items frequently claiming defects or wrong size",
            "Multiple returns of same product category within short time period",
            "High-value returns with vague or inconsistent return reasons",
            "Returns concentrated on single store despite shopping at multiple locations", 
            "Unusual email usage patterns with multiple different addresses",
            "Returns of high-risk categories like electronics, jewelry, or luxury items",
            "Rapid succession of returns after account creation",
            "Returns that significantly exceed customer's historical spending patterns",
            "Bulk quantity returns significantly higher than normal purchase patterns",
            "Suspicious round number quantities like 10, 15, 20 items per return"
        ]
    
    async def calculate_fraud_score(self, user_id: uuid.UUID, claim_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate comprehensive fraud score using ML analysis
        
        Args:
            user_id: UUID of the user to analyze
            claim_data: Current claim items and details
            
        Returns:
            Dict with fraud_score, confidence, risk_factors, and recommendations
        """
        # Fetch real user and historical data
        user_data = await self._get_user_data(user_id)
        if not user_data:
            raise ValueError(f"User {user_id} not found in database")
        
        historical_data = await self._get_historical_data(user_id)
        
        # Generate behavior description for AI analysis
        behavior_description = self._generate_behavior_description(user_data, claim_data, historical_data)
        
        # Use Cohere AI to identify fraud patterns
        fraud_indicators = await self._analyze_fraud_patterns(behavior_description)
        
        # Calculate base score using traditional factors
        base_score = self._calculate_base_score(user_data, claim_data, historical_data)
        
        # Apply AI-enhanced adjustments
        enhanced_score = self._apply_ai_adjustments(base_score, fraud_indicators)
        
        return {
            "fraud_score": min(100, max(0, enhanced_score)),
            "confidence": self._calculate_confidence(fraud_indicators),
            "risk_factors": fraud_indicators,
            "recommendations": self._generate_recommendations(enhanced_score, fraud_indicators),
            "behavior_analysis": behavior_description,
            "user_profile": user_data,
            "historical_summary": self._summarize_historical_data(historical_data)
        }
    
    async def should_flag_user(self, fraud_score: int, user_id: uuid.UUID) -> bool:
        """Determine if user should be flagged based on ML analysis"""
        if fraud_score >= 85:
            return True
        
        # Check existing flag status for lower threshold
        try:
            user = await self.customer_crud.get_user_by_kyc_id(user_id)
            if user and user.get('is_flagged'):
                return fraud_score >= 60
        except Exception:
            pass
        
        return fraud_score >= 75
    
    async def _get_user_data(self, user_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        """Fetch user data from database"""
        try:
            user = await self.customer_crud.get_user_by_kyc_id(user_id)
            if not user:
                return None
            
            return {
                "risk_score": user.get("risk_score", 0),
                "is_flagged": user.get("is_flagged", False),
                "total_claims": user.get("total_claims", 0),
                "created_at": user.get("created_at"),
                "email": user.get("email"),
                "name": user.get("name")
            }
        except Exception as e:
            print(f"Error fetching user data: {e}")
            return None
    
    async def _get_historical_data(self, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        """Fetch historical claims data from database"""
        try:
            claims = await self.claim_crud.get_claims_by_user(user_id, limit=100)
            
            historical_data = []
            for claim in claims:
                historical_data.append({
                    "created_at": claim.get("created_at"),
                    "claim_data": claim.get("claim_data", []),
                    "status": claim.get("status"),
                    "store_id": claim.get("store_id"),
                    "email_at_store": claim.get("email_at_store")
                })
            
            return historical_data
        except Exception as e:
            print(f"Error fetching historical data: {e}")
            return []
    
    def _generate_behavior_description(self, user_data: Dict[str, Any], 
                                     claim_data: List[Dict[str, Any]], 
                                     historical_data: List[Dict[str, Any]]) -> str:
        """Generate natural language description for AI analysis"""
        total_claims = len(historical_data)
        current_value = sum(item.get('price', 0) * item.get('quantity', 1) for item in claim_data)
        avg_historical_value = self._calculate_average_claim_value(historical_data)
        categories = [item.get('category', '') for item in claim_data]
        
        recent_claims = [claim for claim in historical_data 
                        if self._is_recent(claim.get('created_at', ''))]
        
        return f"""
        Customer Profile Analysis:
        - Total historical returns: {total_claims}
        - Current return value: ${current_value:.2f}
        - Average historical return value: ${avg_historical_value:.2f}
        - Current return categories: {', '.join(set(categories))}
        - Recent returns (30 days): {len(recent_claims)}
        - Current risk score: {user_data.get('risk_score', 0)}
        - Previously flagged: {'Yes' if user_data.get('is_flagged') else 'No'}
        - Return frequency pattern: {self._analyze_frequency_pattern(historical_data)}
        """.strip()
    
    async def _analyze_fraud_patterns(self, behavior_description: str) -> List[Dict[str, Any]]:
        """Use Cohere AI to identify relevant fraud patterns"""
        try:
            response = self.client.rerank(
                model="rerank-v3.5",
                query=behavior_description,
                documents=self.fraud_patterns,
                top_n=5,
                max_tokens_per_doc=4096
            )
            
            indicators = []
            for result in response.results:
                indicators.append({
                    "pattern": self.fraud_patterns[result.index],
                    "relevance_score": result.relevance_score,
                    "risk_weight": self._pattern_to_risk_weight(result.index)
                })
            
            return indicators
            
        except Exception as e:
            print(f"Cohere API Error: {str(e)}")
            return self._fallback_pattern_analysis(behavior_description)
    
    def _calculate_base_score(self, user_data: Dict[str, Any], 
                            claim_data: List[Dict[str, Any]], 
                            historical_data: List[Dict[str, Any]]) -> int:
        """Calculate base fraud score using traditional factors"""
        factors = []
        
        # Frequency factor (30%)
        recent_claims = len([c for c in historical_data if self._is_recent(c.get('created_at', ''))])
        frequency_score = min(100, recent_claims * 20)
        factors.append(('frequency', frequency_score, 0.30))
        
        # Value deviation factor (25%)
        current_value = sum(item.get('price', 0) * item.get('quantity', 1) for item in claim_data)
        avg_value = self._calculate_average_claim_value(historical_data)
        if avg_value > 0:
            deviation_ratio = current_value / avg_value
            value_score = min(100, max(0, (deviation_ratio - 1) * 30))
        else:
            value_score = 30 if current_value > 500 else 10
        factors.append(('value_deviation', value_score, 0.25))
        
        # Category risk factor (25%)
        high_risk_categories = {'electronics', 'jewelry', 'luxury', 'designer', 'gaming'}
        categories = [item.get('category', '').lower() for item in claim_data]
        high_risk_ratio = sum(1 for cat in categories if cat in high_risk_categories) / max(1, len(categories))
        category_score = high_risk_ratio * 80
        factors.append(('category_risk', category_score, 0.25))
        
        # Historical risk factor (20%)
        historical_score = user_data.get('risk_score', 0)
        factors.append(('historical_risk', historical_score, 0.20))
        
        return int(sum(score * weight for _, score, weight in factors))
    
    def _apply_ai_adjustments(self, base_score: int, fraud_indicators: List[Dict[str, Any]]) -> int:
        """Apply AI insights to adjust base score"""
        if not fraud_indicators:
            return base_score
        
        ai_adjustment = 0
        total_relevance = sum(indicator['relevance_score'] for indicator in fraud_indicators)
        
        for indicator in fraud_indicators:
            weight = indicator['relevance_score'] / max(total_relevance, 0.1)
            risk_impact = indicator['risk_weight'] * weight
            ai_adjustment += risk_impact
        
        adjustment = max(-20, min(20, ai_adjustment))
        return base_score + int(adjustment)
    
    def _calculate_confidence(self, fraud_indicators: List[Dict[str, Any]]) -> float:
        """Calculate confidence score based on pattern strength"""
        if not fraud_indicators:
            return 0.5
        
        avg_relevance = sum(i['relevance_score'] for i in fraud_indicators) / len(fraud_indicators)
        return min(1.0, max(0.0, avg_relevance))
    
    def _generate_recommendations(self, fraud_score: int, fraud_indicators: List[Dict[str, Any]]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if fraud_score >= 80:
            recommendations.append("🚨 HIGH RISK: Recommend manual review and additional verification")
        elif fraud_score >= 60:
            recommendations.append("⚠️ MEDIUM RISK: Flag for closer monitoring")
        elif fraud_score >= 40:
            recommendations.append("📊 LOW-MEDIUM RISK: Monitor for patterns")
        else:
            recommendations.append("✅ LOW RISK: Standard processing recommended")
        
        # Pattern-specific recommendations
        for indicator in fraud_indicators[:3]:
            if indicator['relevance_score'] > 0.7:
                if 'expensive items frequently' in indicator['pattern']:
                    recommendations.append("💡 Consider implementing purchase history verification")
                elif 'multiple returns' in indicator['pattern']:
                    recommendations.append("💡 Review return frequency limits for this customer")
        
        return recommendations
    
    def _summarize_historical_data(self, historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create summary of historical data"""
        if not historical_data:
            return {
                "total_claims": 0,
                "total_value": 0,
                "avg_claim_value": 0,
                "most_common_categories": [],
                "recent_claims_30d": 0
            }
        
        total_value = 0
        categories = []
        recent_claims = 0
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        for claim in historical_data:
            claim_items = claim.get("claim_data", [])
            
            for item in claim_items:
                item_value = item.get("price", 0) * item.get("quantity", 1)
                total_value += item_value
                categories.append(item.get("category", "unknown"))
            
            try:
                claim_date = datetime.fromisoformat(claim.get("created_at", "").replace('Z', '+00:00'))
                if claim_date >= thirty_days_ago:
                    recent_claims += 1
            except:
                pass
        
        category_counts = Counter(categories)
        most_common_categories = [{"category": cat, "count": count} 
                                for cat, count in category_counts.most_common(5)]
        
        return {
            "total_claims": len(historical_data),
            "total_value": round(total_value, 2),
            "avg_claim_value": round(total_value / len(historical_data), 2) if historical_data else 0,
            "most_common_categories": most_common_categories,
            "recent_claims_30d": recent_claims
        }
    
    # Helper methods
    def _calculate_average_claim_value(self, historical_data: List[Dict[str, Any]]) -> float:
        """Calculate average historical claim value"""
        if not historical_data:
            return 0
        
        total_value = 0
        for claim in historical_data:
            claim_items = claim.get('claim_data', [])
            for item in claim_items:
                total_value += item.get('price', 0) * item.get('quantity', 1)
        
        return total_value / len(historical_data)
    
    def _is_recent(self, date_str: str, days: int = 30) -> bool:
        """Check if date is within recent period"""
        try:
            claim_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return (datetime.now(timezone.utc) - claim_date).days <= days
        except:
            return False
    
    def _analyze_frequency_pattern(self, historical_data: List[Dict[str, Any]]) -> str:
        """Analyze return frequency pattern"""
        if len(historical_data) <= 1:
            return "New customer"
        elif len(historical_data) <= 3:
            return "Occasional returner"
        elif len(historical_data) <= 10:
            return "Regular returner"
        else:
            return "Frequent returner"
    
    def _pattern_to_risk_weight(self, pattern_index: int) -> int:
        """Map fraud pattern index to risk weight"""
        risk_weights = [25, 20, 30, 15, 10, 25, 20, 15, 15, 20]
        return risk_weights[pattern_index] if pattern_index < len(risk_weights) else 15
    
    def _fallback_pattern_analysis(self, behavior_description: str) -> List[Dict[str, Any]]:
        """Fallback pattern analysis if Cohere API fails"""
        indicators = []
        
        if "frequent" in behavior_description.lower() or "multiple" in behavior_description.lower():
            indicators.append({
                "pattern": "High frequency return pattern detected",
                "relevance_score": 0.8,
                "risk_weight": 25
            })
        
        if "expensive" in behavior_description.lower() or "high" in behavior_description.lower():
            indicators.append({
                "pattern": "High-value return pattern detected", 
                "relevance_score": 0.7,
                "risk_weight": 20
            })
        
        return indicators
