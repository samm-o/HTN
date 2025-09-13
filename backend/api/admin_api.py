from fastapi import APIRouter, HTTPException, status
import uuid
from datetime import datetime

from schemas import ClaimStatus
from crud.crud_claim import ClaimCRUD

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

# Initialize services
claim_crud = ClaimCRUD()

@router.get("/flagged-claims")
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

@router.get("/{claim_id}")
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

@router.put("/{claim_id}/status")
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

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Project BASTION API",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }
