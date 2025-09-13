import os
import cohere
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, UTC
import uuid

class CohereEnhancedFraudDetector:
    """
    Enhanced fraud detection using Cohere's rerank API to analyze purchase patterns
    and behavioral indicators for more accurate fraud likelihood scoring.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.client = cohere.ClientV2(api_key=api_key)
        
        # Fraud pattern templates for reranking
        self.fraud_patterns = [
            "Customer returns expensive items frequently claiming defects or wrong size",
            "Multiple returns of same product category within short time period",
            "High-value returns with vague or inconsistent return reasons",
            "Returns concentrated on single store despite shopping at multiple locations", 
            "Unusual email usage patterns with multiple different addresses",
            "Returns of high-risk categories like electronics, jewelry, or luxury items",
            "Rapid succession of returns after account creation",
            "Returns that significantly exceed customer's historical spending patterns",
            "Seasonal return spikes during holiday periods or sales events",
            "Payment method patterns associated with higher fraud risk",
            "Bulk quantity returns significantly higher than normal purchase patterns",
            "Suspicious round number quantities like 10, 15, 20 items per return",
            "Multiple high-quantity items returned simultaneously"
        ]
    
    def calculate_enhanced_fraud_score(self, 
                                     user_data: Dict[str, Any],
                                     claim_data: List[Dict[str, Any]], 
                                     historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate fraud likelihood score /100 using Cohere rerank API
        
        Args:
            user_data: Customer profile data (risk_score, is_flagged, etc.)
            claim_data: Current return claim items and details
            historical_data: Previous claims and purchase history
            
        Returns:
            Dict with fraud_score, confidence, risk_factors, and recommendations
        """
        
        # Generate customer behavior description
        behavior_description = self._generate_behavior_description(
            user_data, claim_data, historical_data
        )
        
        # Use Cohere rerank to identify most relevant fraud patterns
        fraud_indicators = self._analyze_fraud_patterns(behavior_description)
        
        # Calculate base score from traditional factors
        base_score = self._calculate_base_score(user_data, claim_data, historical_data)
        
        # Apply Cohere-enhanced adjustments
        enhanced_score = self._apply_ai_adjustments(base_score, fraud_indicators)
        
        return {
            "fraud_score": min(100, max(0, enhanced_score)),
            "confidence": self._calculate_confidence(fraud_indicators),
            "risk_factors": fraud_indicators,
            "recommendations": self._generate_recommendations(enhanced_score, fraud_indicators),
            "behavior_analysis": behavior_description
        }
    
    def _generate_behavior_description(self, 
                                     user_data: Dict[str, Any],
                                     claim_data: List[Dict[str, Any]], 
                                     historical_data: List[Dict[str, Any]]) -> str:
        """Generate natural language description of customer behavior"""
        
        # Extract key metrics
        total_claims = len(historical_data)
        current_value = sum(item.get('price', 0) * item.get('quantity', 1) for item in claim_data)
        avg_historical_value = self._calculate_average_claim_value(historical_data)
        categories = [item.get('category', '') for item in claim_data]
        
        # Recent activity analysis
        recent_claims = [claim for claim in historical_data 
                        if self._is_recent(claim.get('created_at', ''))]
        
        description = f"""
        Customer Profile Analysis:
        - Total historical returns: {total_claims}
        - Current return value: ${current_value:.2f}
        - Average historical return value: ${avg_historical_value:.2f}
        - Current return categories: {', '.join(set(categories))}
        - Recent returns (30 days): {len(recent_claims)}
        - Current risk score: {user_data.get('risk_score', 0)}
        - Previously flagged: {'Yes' if user_data.get('is_flagged') else 'No'}
        - Return frequency pattern: {self._analyze_frequency_pattern(historical_data)}
        """
        
        return description.strip()
    
    def _analyze_fraud_patterns(self, behavior_description: str) -> List[Dict[str, Any]]:
        """Use Cohere rerank to identify relevant fraud patterns"""
        try:
            print(f"🔍 Analyzing behavior with Cohere API...")
            print(f"📝 Behavior description: {behavior_description[:200]}...")
            
            # Use rerank API to find most relevant fraud patterns
            response = self.client.rerank(
                model="rerank-v3.5",
                query=behavior_description,
                documents=self.fraud_patterns,
                top_n=5,
                max_tokens_per_doc=4096
            )
            
            print(f"✅ Cohere API response received with {len(response.results)} results")
            
            indicators = []
            for result in response.results:
                indicators.append({
                    "pattern": self.fraud_patterns[result.index],
                    "relevance_score": result.relevance_score,
                    "risk_weight": self._pattern_to_risk_weight(result.index)
                })
            
            return indicators
            
        except Exception as e:
            print(f"❌ Cohere API Error: {str(e)}")
            print("🔄 Falling back to rule-based analysis...")
            # Fallback to rule-based analysis if Cohere fails
            return self._fallback_pattern_analysis(behavior_description)
    
    def _calculate_base_score(self, 
                            user_data: Dict[str, Any],
                            claim_data: List[Dict[str, Any]], 
                            historical_data: List[Dict[str, Any]]) -> int:
        """Calculate base fraud score using traditional factors"""
        
        factors = []
        
        # 1. Frequency factor (25%)
        recent_claims = len([c for c in historical_data if self._is_recent(c.get('created_at', ''))])
        frequency_score = min(100, recent_claims * 20)  # 20 points per recent claim
        factors.append(('frequency', frequency_score, 0.25))
        
        # 2. Value deviation factor (25%)
        current_value = sum(item.get('price', 0) * item.get('quantity', 1) for item in claim_data)
        avg_value = self._calculate_average_claim_value(historical_data)
        if avg_value > 0:
            deviation_ratio = current_value / avg_value
            value_score = min(100, max(0, (deviation_ratio - 1) * 30))
        else:
            value_score = 30 if current_value > 500 else 10
        factors.append(('value_deviation', value_score, 0.25))
        
        # 3. Category risk factor (20%)
        high_risk_categories = {'electronics', 'jewelry', 'luxury', 'designer', 'gaming'}
        categories = [item.get('category', '').lower() for item in claim_data]
        high_risk_ratio = sum(1 for cat in categories if cat in high_risk_categories) / max(1, len(categories))
        category_score = high_risk_ratio * 80
        factors.append(('category_risk', category_score, 0.20))
        
        # 4. Historical risk factor (20%)
        historical_score = user_data.get('risk_score', 0)
        factors.append(('historical_risk', historical_score, 0.20))
        
        # 5. Quantity pattern factor (15%)
        quantity_score = self._calculate_quantity_risk(claim_data, historical_data)
        factors.append(('quantity_pattern', quantity_score, 0.15))
        
        # Email pattern factor removed - not using email data
        
        # Debug output with detailed calculations
        current_quantities = [item.get('quantity', 1) for item in claim_data]
        print(f"\n📊 Base Score Calculation:")
        print(f"  Current claim value: ${current_value:.2f}")
        print(f"  Current quantities: {current_quantities}")
        print(f"  Average historical value: ${avg_value:.2f}")
        print(f"  Recent claims (30 days): {recent_claims}")
        print(f"  Categories: {categories}")
        print(f"  High-risk category ratio: {high_risk_ratio:.2f}")
        
        # Detailed factor explanations
        print(f"\n🔍 Factor Calculations:")
        print(f"  1. Frequency: {recent_claims} recent claims × 20 = {frequency_score}")
        if avg_value > 0:
            deviation_ratio = current_value / avg_value
            print(f"  2. Value deviation: ${current_value:.2f} / ${avg_value:.2f} = {deviation_ratio:.3f} → {value_score}")
        else:
            print(f"  2. Value deviation: No history, current ${current_value:.2f} → {value_score}")
        print(f"  3. Category risk: {high_risk_ratio:.2f} high-risk ratio × 80 = {category_score}")
        print(f"  4. Historical risk: User risk score = {historical_score}")
        print(f"  5. Quantity risk: {quantity_score} (see quantity analysis)")
        
        for factor_name, score, weight in factors:
            weighted = score * weight
            print(f"  {factor_name}: {score:.1f} × {weight:.2f} = {weighted:.1f}")
        
        # Calculate weighted score
        base_score = sum(score * weight for _, score, weight in factors)
        print(f"  Total base score: {base_score:.1f}")
        return int(base_score)
    
    def _calculate_quantity_risk(self, claim_data: List[Dict[str, Any]], historical_data: List[Dict[str, Any]]) -> int:
        """Calculate risk based on quantity patterns"""
        current_quantities = [item.get('quantity', 1) for item in claim_data]
        total_current_qty = sum(current_quantities)
        max_current_qty = max(current_quantities) if current_quantities else 1
        
        # Calculate historical quantity patterns
        historical_quantities = []
        for claim in historical_data:
            claim_items = claim.get('claim_data', [])
            for item in claim_items:
                historical_quantities.append(item.get('quantity', 1))
        
        if not historical_quantities:
            # New customer - flag high quantities
            if max_current_qty >= 10:
                return 80  # Very suspicious for new customer
            elif max_current_qty >= 5:
                return 50
            elif total_current_qty >= 8:
                return 40
            else:
                return 10
        
        avg_historical_qty = sum(historical_quantities) / len(historical_quantities)
        max_historical_qty = max(historical_quantities)
        
        risk_score = 0
        
        # 1. Unusual high quantities compared to history
        if max_current_qty > max_historical_qty * 3:
            risk_score += 40
        elif max_current_qty > max_historical_qty * 2:
            risk_score += 25
        
        # 2. Total quantity spike
        if total_current_qty > avg_historical_qty * 5:
            risk_score += 30
        elif total_current_qty > avg_historical_qty * 3:
            risk_score += 20
        
        # 3. Bulk return patterns (multiple high-quantity items)
        high_qty_items = sum(1 for qty in current_quantities if qty >= 5)
        if high_qty_items >= 3:
            risk_score += 25
        elif high_qty_items >= 2:
            risk_score += 15
        
        # 4. Suspicious round numbers (often fake)
        round_numbers = sum(1 for qty in current_quantities if qty % 5 == 0 and qty >= 10)
        if round_numbers >= 2:
            risk_score += 15
        
        return min(100, risk_score)
    
    def _apply_ai_adjustments(self, base_score: int, fraud_indicators: List[Dict[str, Any]]) -> int:
        """Apply Cohere AI insights to adjust base score"""
        
        if not fraud_indicators:
            return base_score
        
        # Calculate AI adjustment based on pattern relevance
        ai_adjustment = 0
        total_relevance = sum(indicator['relevance_score'] for indicator in fraud_indicators)
        
        for indicator in fraud_indicators:
            weight = indicator['relevance_score'] / max(total_relevance, 0.1)
            risk_impact = indicator['risk_weight'] * weight
            ai_adjustment += risk_impact
        
        # Apply adjustment (max ±20 points)
        adjustment = max(-20, min(20, ai_adjustment))
        return base_score + int(adjustment)
    
    def _pattern_to_risk_weight(self, pattern_index: int) -> int:
        """Map fraud pattern index to risk weight"""
        risk_weights = [25, 20, 30, 15, 10, 25, 20, 15, 10, 15]  # Corresponding to fraud_patterns
        return risk_weights[pattern_index] if pattern_index < len(risk_weights) else 15
    
    def _calculate_confidence(self, fraud_indicators: List[Dict[str, Any]]) -> float:
        """Calculate confidence score based on pattern strength"""
        if not fraud_indicators:
            return 0.5
        
        avg_relevance = sum(i['relevance_score'] for i in fraud_indicators) / len(fraud_indicators)
        return min(1.0, max(0.0, avg_relevance))
    
    def _generate_recommendations(self, fraud_score: int, fraud_indicators: List[Dict[str, Any]]) -> List[str]:
        """Generate actionable recommendations based on fraud analysis"""
        recommendations = []
        
        if fraud_score >= 80:
            recommendations.append("🚨 HIGH RISK: Recommend manual review and additional verification")
            recommendations.append("Consider requiring additional documentation for this return")
        elif fraud_score >= 60:
            recommendations.append("⚠️ MEDIUM RISK: Flag for closer monitoring")
            recommendations.append("Consider implementing stricter return policy for this customer")
        elif fraud_score >= 40:
            recommendations.append("📊 LOW-MEDIUM RISK: Monitor for patterns")
        else:
            recommendations.append("✅ LOW RISK: Standard processing recommended")
            recommendations.append("Consider offering loyalty rewards to retain good customer")
        
        # Pattern-specific recommendations
        for indicator in fraud_indicators[:3]:  # Top 3 patterns
            if indicator['relevance_score'] > 0.7:
                if 'expensive items frequently' in indicator['pattern']:
                    recommendations.append("💡 Consider implementing purchase history verification")
                elif 'multiple returns' in indicator['pattern']:
                    recommendations.append("💡 Review return frequency limits for this customer")
                elif 'high-value returns' in indicator['pattern']:
                    recommendations.append("💡 Require receipt verification for high-value returns")
        
        return recommendations
    
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
            return (datetime.now(UTC) - claim_date).days <= days
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
    
    def _fallback_pattern_analysis(self, behavior_description: str) -> List[Dict[str, Any]]:
        """Fallback pattern analysis if Cohere API fails"""
        indicators = []
        
        # Simple keyword-based pattern matching
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


def analyze_customer_fraud_risk(customer_id: str, 
                              current_claim: List[Dict],
                              user_data: Dict[str, Any],
                              historical_data: List[Dict[str, Any]],
                              api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Main function to analyze fraud risk for a customer's return claim
    
    Args:
        customer_id: UUID of the customer
        current_claim: List of items being returned
        user_data: Customer profile data (risk_score, is_flagged, etc.)
        historical_data: Previous claims and purchase history
        api_key: Cohere API key (optional, can use env var)
    
    Returns:
        Comprehensive fraud analysis results
    """
    detector = CohereEnhancedFraudDetector(api_key)
    return detector.calculate_enhanced_fraud_score(user_data, current_claim, historical_data)


if __name__ == "__main__":
    # Example usage - matches ItemData schema from backend/schemas/item_data.py
    sample_claim = [
        {
            "item_name": "shirt",
            "category": "clothing", 
            "price": 12.99,
            "quantity": 1,
            "url": None
        }
    ]
    
    # Example user data
    user_data = {
        "risk_score": 45,
        "is_flagged": False,
        "total_claims": 3
    }
    
    # Example historical data
    historical_data = [
        {
            "created_at": "2024-08-15T10:00:00Z",
            "claim_data": [{"price": 299.99, "quantity": 1, "category": "electronics"}]
        },
        {
            "created_at": "2024-09-01T14:30:00Z", 
            "claim_data": [{"price": 89.99, "quantity": 2, "category": "clothing"}]
        }
    ]
    
    result = analyze_customer_fraud_risk(
        "test-customer-123", 
        sample_claim, 
        user_data,
        historical_data,
        os.getenv("COHERE_API_KEY")
    )
    
    print("")
    print("=" * 50)
    print(f"Fraud Score: {result['fraud_score']}/100")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"\n Risk Factors:")
    for factor in result['risk_factors']:
        print(f"  • {factor['pattern']} (Relevance: {factor['relevance_score']:.2f})")
    
    print(f"\n💡 Recommendations:")
    for rec in result['recommendations']:
        print(f"  {rec}")