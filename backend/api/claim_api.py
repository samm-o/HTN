from fastapi import APIRouter, HTTPException, status
import uuid
from datetime import datetime

from schemas import ClaimSubmissionPayload, ClaimResponse, ClaimStatus
from crud.crud_customer import CustomerCRUD
from crud.crud_store import StoreCRUD
from crud.crud_claim import ClaimCRUD
from services.fraud_detection import FraudDetectionService

router = APIRouter(prefix="/api/v1/claims", tags=["claims"])

# Initialize services
customer_crud = CustomerCRUD()
store_crud = StoreCRUD()
claim_crud = ClaimCRUD()
fraud_service = FraudDetectionService()

@router.post("/submit", response_model=ClaimResponse)
async def submit_claim(payload: ClaimSubmissionPayload):
    """
    Submit a new return claim for fraud detection analysis
    
    This endpoint:
    1. Receives claim data with user ID
    2. Links the claim to an existing user identity
    3. Calculates fraud risk score
    4. Stores the claim in the database
    5. Returns the analysis results
    """
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
        
        # Calculate fraud risk score
        risk_score = fraud_service.calculate_risk_score(
            user_id=user_id,
            claim_data=claim_context.claim_data,
            email_at_store=claim_context.email_at_store,
            store_id=claim_context.store_id
        )
        
        # Determine if user should be flagged
        should_flag = fraud_service.should_flag_user(risk_score, user_id)
        
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
            message = "Claim submitted - HIGH RISK detected. Manual review required."
            claim_status = ClaimStatus.PENDING
        elif risk_score >= 50:
            message = "Claim submitted - Medium risk detected. Additional verification may be required."
            claim_status = ClaimStatus.PENDING
        else:
            message = "Claim submitted successfully - Low risk detected."
            claim_status = ClaimStatus.PENDING
        
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
