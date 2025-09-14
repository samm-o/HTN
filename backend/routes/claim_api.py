from fastapi import APIRouter, HTTPException, status
import uuid

from schemas.claim_submission import ClaimSubmissionPayload
from schemas.claim import ClaimResponse
from schemas import ClaimStatus
from crud.crud_customer import CustomerCRUD
from crud.crud_store import StoreCRUD
from crud.crud_claim import ClaimCRUD
from services.ml_fraud_service import MLFraudService
from services.risk_score_cache import risk_score_cache

router = APIRouter(prefix="/api/v1/claims", tags=["claims"])

customer_crud = CustomerCRUD()
store_crud = StoreCRUD()
claim_crud = ClaimCRUD()
ml_fraud_service = MLFraudService()

@router.post("/submit", response_model=ClaimResponse)
async def submit_claim(payload: ClaimSubmissionPayload):
    """Submit a new return claim for fraud detection analysis"""
    try:
        # Extract data from payload
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
        
        # Calculate fraud risk score using ML service
        ml_result = await ml_fraud_service.calculate_fraud_score(
            user_id=user_id,
            claim_data=claim_data_dict
        )
        
        risk_score = ml_result["fraud_score"]
        analysis_method = "ML Enhanced"
        
        # Determine if user should be flagged
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
        
        # Determine response message
        if should_flag:
            message = f"Claim submitted - HIGH RISK detected ({analysis_method}: {risk_score}/100). Manual review required."
            claim_status = ClaimStatus.PENDING
        elif risk_score >= 60:
            message = f"Claim submitted - Medium risk detected ({analysis_method}: {risk_score}/100). Additional verification may be required."
            claim_status = ClaimStatus.PENDING
        else:
            message = f"Claim submitted successfully - Low risk detected ({analysis_method}: {risk_score}/100)."
            claim_status = ClaimStatus.PENDING
        
        # Trigger risk score recalculation for this user
        await risk_score_cache.recalculate_user_risk_score(str(user_id))
        
        return ClaimResponse(
            claim_id=uuid.UUID(claim['id']),
            user_id=user_id,
            status=claim_status,
            risk_score=risk_score,
            is_flagged=should_flag,
            message=message
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
