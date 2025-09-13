from fastapi import APIRouter, HTTPException, status
import uuid

from schemas import UserResponse
from crud.crud_customer import CustomerCRUD

router = APIRouter(prefix="/api/v1/users", tags=["users"])

# Initialize services
customer_crud = CustomerCRUD()

@router.get("/{user_id}", response_model=UserResponse)
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

@router.get("/{user_id}/claims")
async def get_user_claims(user_id: uuid.UUID, limit: int = 50):
    """Get all claims for a specific user"""
    try:
        from crud.crud_claim import ClaimCRUD
        claim_crud = ClaimCRUD()
        claims = await claim_crud.get_claims_by_user(user_id, limit)
        return {"user_id": user_id, "claims": claims, "total": len(claims)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
