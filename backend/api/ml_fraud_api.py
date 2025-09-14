from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any, Optional
import uuid
from pydantic import BaseModel

from schemas import ItemData, ClaimSubmissionPayload, ClaimResponse, ClaimStatus
from crud.crud_customer import CustomerCRUD
from crud.crud_store import StoreCRUD
from crud.crud_claim import ClaimCRUD
from services.ml_fraud_service import MLFraudService

router = APIRouter(prefix="/api/v1/ml-fraud", tags=["ml-fraud"])

# Initialize services
customer_crud = CustomerCRUD()
store_crud = StoreCRUD()
claim_crud = ClaimCRUD()
ml_fraud_service = MLFraudService()

class MLFraudAnalysisRequest(BaseModel):
    user_id: uuid.UUID
    claim_data: List[ItemData]
    store_id: Optional[uuid.UUID] = None

class MLFraudAnalysisResponse(BaseModel):
    fraud_score: int
    confidence: float
    risk_factors: List[Dict[str, Any]]
    recommendations: List[str]
    behavior_analysis: str
    user_profile: Dict[str, Any]
    historical_summary: Dict[str, Any]

@router.post("/analyze", response_model=MLFraudAnalysisResponse)
async def analyze_ml_fraud_risk(request: MLFraudAnalysisRequest):
    """
    Analyze fraud risk using Cohere ML enhanced detection
    """
    try:
        # Convert claim_data to format expected by ML service
        claim_data_dict = [
            {
                "item_name": item.item_name,
                "category": item.category,
                "price": item.price,
                "quantity": item.quantity,
                "url": item.url
            }
            for item in request.claim_data
        ]
        
        result = await ml_fraud_service.calculate_fraud_score(
            user_id=request.user_id,
            claim_data=claim_data_dict
        )
        
        return MLFraudAnalysisResponse(**result)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ML fraud analysis failed: {str(e)}"
        )

@router.post("/submit-with-ml", response_model=ClaimResponse)
async def submit_claim_with_ml_analysis(payload: ClaimSubmissionPayload):
    """
    Submit a claim with enhanced ML fraud detection
    """
    try:
        user_id = payload.user_id
        claim_context = payload.claim_context
        
        # Check if user exists
        user = await customer_crud.get_user_by_kyc_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        # Verify store exists
        store = await store_crud.get_store_by_id(claim_context.store_id)
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Store with ID {claim_context.store_id} not found"
            )
        
        # Convert claim data for ML analysis
        claim_data_dict = [
            {
                "item_name": item.item_name,
                "category": item.category,
                "price": item.price,
                "quantity": item.quantity,
                "url": item.url
            }
            for item in claim_context.claim_data
        ]
        
        # Run ML fraud analysis
        ml_result = await ml_fraud_service.calculate_fraud_score(
            user_id=user_id,
            claim_data=claim_data_dict
        )
        
        risk_score = ml_result["fraud_score"]
        
        # Determine if user should be flagged using ML service
        should_flag = await ml_fraud_service.should_flag_user(risk_score, user_id)
        
        # Update user's risk score and flagged status
        await customer_crud.update_user_risk_score(user_id, risk_score, should_flag)
        
        # Create the claim
        claim = await claim_crud.create_claim(
            user_id=user_id,
            store_id=claim_context.store_id,
            email_at_store=claim_context.email_at_store,
            claim_data=claim_context.claim_data
        )
        
        # Generate response message
        if should_flag:
            message = f"Claim submitted - HIGH RISK detected (ML Score: {risk_score}/100, Confidence: {ml_result['confidence']:.1%}). Manual review required."
            claim_status = ClaimStatus.PENDING
        elif risk_score >= 60:
            message = f"Claim submitted - Medium risk detected (ML Score: {risk_score}/100). Additional verification may be required."
            claim_status = ClaimStatus.PENDING
        else:
            message = f"Claim submitted successfully - Low risk detected (ML Score: {risk_score}/100)."
            claim_status = ClaimStatus.PENDING
        
        return ClaimResponse(
            claim_id=uuid.UUID(claim['id']),
            user_id=user_id,
            status=claim_status,
            risk_score=risk_score,
            is_flagged=should_flag,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/user/{user_id}/risk-profile")
async def get_user_risk_profile(user_id: uuid.UUID):
    """
    Get comprehensive risk profile for a user using ML analysis
    """
    try:
        user = await customer_crud.get_user_by_kyc_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
            
        # Get historical data
        claims = await claim_crud.get_claims_by_user(user_id, limit=100)
        
        # Create user profile summary
        user_profile = {
            "risk_score": user.get("risk_score", 0),
            "is_flagged": user.get("is_flagged", False),
            "total_claims": user.get("total_claims", 0),
            "created_at": user.get("created_at"),
            "email": user.get("email"),
            "name": user.get("name")
        }
        
        # Create historical summary
        historical_summary = _create_historical_summary(claims)
        
        return {
            "user_id": str(user_id),
            "user_profile": user_profile,
            "historical_summary": historical_summary,
            "risk_indicators": {
                "current_risk_score": user_profile["risk_score"],
                "is_flagged": user_profile["is_flagged"],
                "claim_frequency": _get_claim_frequency(historical_summary["recent_claims_30d"]),
                "avg_claim_value": historical_summary["avg_claim_value"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user risk profile: {str(e)}"
        )

def _create_historical_summary(claims: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Create summary from claims data"""
    if not claims:
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
    
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    for claim in claims:
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
    
    from collections import Counter
    category_counts = Counter(categories)
    most_common_categories = [{"category": cat, "count": count} 
                            for cat, count in category_counts.most_common(5)]
    
    return {
        "total_claims": len(claims),
        "total_value": round(total_value, 2),
        "avg_claim_value": round(total_value / len(claims), 2) if claims else 0,
        "most_common_categories": most_common_categories,
        "recent_claims_30d": recent_claims
    }

def _get_claim_frequency(recent_claims: int) -> str:
    """Convert recent claims count to frequency description"""
    if recent_claims > 5:
        return "High"
    elif recent_claims > 2:
        return "Medium"
    else:
        return "Low"

