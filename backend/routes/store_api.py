from fastapi import APIRouter, HTTPException, status
from typing import List
import uuid
from datetime import datetime

from schemas import StoreResponse
from crud.crud_store import StoreCRUD

router = APIRouter(prefix="/api/v1/stores", tags=["stores"])

# Initialize services
store_crud = StoreCRUD()

@router.get("", response_model=List[StoreResponse])
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

@router.post("", response_model=StoreResponse)
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

@router.get("/{store_id}/claims")
async def get_store_claims(store_id: uuid.UUID, limit: int = 50):
    """Get all claims for a specific store"""
    try:
        from crud.crud_claim import ClaimCRUD
        claim_crud = ClaimCRUD()
        claims = await claim_crud.get_claims_by_store(store_id, limit)
        return {"store_id": store_id, "claims": claims, "total": len(claims)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
