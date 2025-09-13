from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
import uuid
from datetime import datetime

from schemas import (
    ClaimSubmissionPayload, ClaimResponse, UserResponse, StoreResponse,
    ClaimStatus, Store
)
from crud.crud_customer import CustomerCRUD
from crud.crud_store import StoreCRUD
from crud.crud_claim import ClaimCRUD
from services.fraud_detection import FraudDetectionService
from core.supabase_client import get_supabase

router = APIRouter(prefix="/api/v1", tags=["bastion"])

# Initialize services
customer_crud = CustomerCRUD()
store_crud = StoreCRUD()
claim_crud = ClaimCRUD()
fraud_service = FraudDetectionService()

@router.post("/claims/submit", response_model=ClaimResponse)
async def submit_claim(payload: ClaimSubmissionPayload):
    """
    Submit a new return claim for fraud detection analysis
    
    This endpoint:
    1. Receives claim data with KYC information
    2. Links the claim to a verified user identity
    3. Calculates fraud risk score
    4. Stores the claim in the database
    5. Returns the analysis results
    """
    try:
        # Extract data from payload
        kyc_data = payload.kyc_data
        claim_context = payload.claim_context
        
        # Generate KYC ID from email (in real implementation, this would come from KYC service)
        # For demo purposes, we'll use a deterministic UUID based on email
        kyc_id = uuid.uuid5(uuid.NAMESPACE_DNS, kyc_data.kyc_email)
        
        # Check if user exists, create if not
        user = await customer_crud.get_user_by_kyc_id(kyc_id)
        if not user:
            user = await customer_crud.create_user(
                kyc_id=kyc_id,
                full_name=kyc_data.full_name,
                dob=kyc_data.dob.isoformat()
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
            user_id=kyc_id,
            claim_data=claim_context.claim_data,
            email_at_store=claim_context.email_at_store,
            store_id=claim_context.store_id
        )
        
        # Determine if user should be flagged
        should_flag = fraud_service.should_flag_user(risk_score, kyc_id)
        
        # Update user's risk score and flagged status
        await customer_crud.update_user_risk_score(kyc_id, risk_score, should_flag)
        
        # Create the claim
        claim = await claim_crud.create_claim(
            user_id=kyc_id,
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
            user_id=kyc_id,
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

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: uuid.UUID):
    """Get user information and statistics"""
    try:
        user_stats = await customer_crud.get_user_stats(user_id)
        return user_stats
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/users/{user_id}/claims")
async def get_user_claims(user_id: uuid.UUID, limit: int = 50):
    """Get all claims for a specific user"""
    try:
        claims = await claim_crud.get_claims_by_user(user_id, limit)
        return {"user_id": user_id, "claims": claims, "total": len(claims)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/claims/{claim_id}")
async def get_claim(claim_id: uuid.UUID):
    """Get specific claim details"""
    try:
        claim = await claim_crud.get_claim_by_id(claim_id)
        if not claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found"
            )
        return claim
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/claims/{claim_id}/status")
async def update_claim_status(claim_id: uuid.UUID, status: ClaimStatus):
    """Update claim status (approve/deny)"""
    try:
        success = await claim_crud.update_claim_status(claim_id, status)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found or update failed"
            )
        return {"claim_id": claim_id, "status": status, "updated_at": datetime.utcnow()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/stores", response_model=List[StoreResponse])
async def get_stores():
    """Get all stores"""
    try:
        stores = await store_crud.get_all_stores()
        return stores
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/stores", response_model=StoreResponse)
async def create_store(name: str):
    """Create a new store"""
    try:
        store = await store_crud.create_store(name)
        return StoreResponse(
            id=uuid.UUID(store['id']),
            name=store['name'],
            created_at=datetime.fromisoformat(store['created_at'].replace('Z', '+00:00'))
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/stores/{store_id}/claims")
async def get_store_claims(store_id: uuid.UUID, limit: int = 50):
    """Get all claims for a specific store"""
    try:
        claims = await claim_crud.get_claims_by_store(store_id, limit)
        return {"store_id": store_id, "claims": claims, "total": len(claims)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/admin/flagged-claims")
async def get_flagged_claims(limit: int = 100):
    """Get claims from flagged users (admin endpoint)"""
    try:
        claims = await claim_crud.get_flagged_claims(limit)
        return {"flagged_claims": claims, "total": len(claims)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Project BASTION API",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }
