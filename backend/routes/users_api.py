from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from core.supabase_client import get_supabase_client
from services.risk_score_cache import risk_score_cache

router = APIRouter(prefix="/api/v1/admin/users", tags=["admin-users"])

@router.get("/list")
async def get_users_list(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Get paginated list of users with dispute statistics"""
    supabase = get_supabase_client()
    
    try:
        # Calculate offset for pagination
        offset = (page - 1) * limit
        
        # Get users with basic info (no email column exists)
        users_response = supabase.table("users").select("id, full_name, created_at, risk_score, is_flagged").range(offset, offset + limit - 1).execute()
        
        if not users_response.data:
            return {
                "users": [],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": 0,
                    "pages": 0
                }
            }
        
        # Get total count for pagination
        count_response = supabase.table("users").select("id", count="exact").execute()
        total_users = count_response.count if count_response.count else 0
        
        # For each user, get their cached risk scores and basic statistics
        users_with_stats = []
        
        for user in users_response.data:
            user_id = user["id"]
            
            # Get cached risk score data
            cached_data = await risk_score_cache.get_user_risk_score(user_id)
            
            if cached_data:
                # Use cached data
                risk_score = cached_data.get("risk_score")
                is_flagged = cached_data.get("is_flagged", False)
                total_disputes = cached_data.get("total_claims", 0)
                pending_disputes = cached_data.get("pending_claims", 0)
                approved_disputes = cached_data.get("approved_claims", 0)
                denied_disputes = cached_data.get("denied_claims", 0)
                
                # Get last activity from claims
                claims_response = supabase.table("claims").select("created_at").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
                last_activity = claims_response.data[0]["created_at"] if claims_response.data else None
            else:
                # Fallback to database values if cache miss
                claims_response = supabase.table("claims").select("id, status, created_at").eq("user_id", user_id).execute()
                claims = claims_response.data if claims_response.data else []
                
                risk_score = user["risk_score"] if claims else None  # N/A if no claims
                is_flagged = user["is_flagged"] if claims else False
                total_disputes = len(claims)
                pending_disputes = len([c for c in claims if c["status"] == "PENDING"])
                approved_disputes = len([c for c in claims if c["status"] == "APPROVED"])
                denied_disputes = len([c for c in claims if c["status"] == "DENIED"])
                last_activity = max(claim["created_at"] for claim in claims) if claims else None
            
            users_with_stats.append({
                "id": user_id,
                "full_name": user["full_name"],
                "created_at": user["created_at"],
                "risk_score": risk_score,  # Can be None for N/A
                "is_flagged": is_flagged,
                "total_disputes": total_disputes,
                "pending_disputes": pending_disputes,
                "approved_disputes": approved_disputes,
                "denied_disputes": denied_disputes,
                "last_activity": last_activity
            })
        
        return {
            "users": users_with_stats,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_users,
                "pages": (total_users + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users list: {str(e)}")

@router.get("/{user_id}/details")
async def get_user_details(user_id: str):
    """Get detailed user information with dispute history"""
    supabase = get_supabase_client()
    
    try:
        # Get user basic information
        user_response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_response.data[0]
        
        # Get user's claims with store information
        claims_response = supabase.table("claims").select("""
            id, status, created_at, claim_data,
            stores (name)
        """).eq("user_id", user_id).order("created_at", desc=True).execute()
        
        claims = claims_response.data if claims_response.data else []
        
        # Process claims to extract item information
        processed_claims = []
        for claim in claims:
            claim_items = claim.get("claim_data", [])
            if isinstance(claim_items, str):
                import json
                claim_items = json.loads(claim_items)
            
            processed_claims.append({
                "id": claim["id"],
                "status": claim["status"],
                "created_at": claim["created_at"],
                "store_name": claim["stores"]["name"] if claim.get("stores") else "Unknown",
                "items": claim_items,
                "total_value": sum(float(item.get("price", 0)) * int(item.get("quantity", 1)) for item in claim_items)
            })
        
        # Calculate user statistics
        total_claims = len(claims)
        pending_claims = len([c for c in claims if c["status"] == "PENDING"])
        approved_claims = len([c for c in claims if c["status"] == "APPROVED"])
        denied_claims = len([c for c in claims if c["status"] == "DENIED"])
        
        total_value = sum(claim["total_value"] for claim in processed_claims)
        
        # Get cached risk score data
        cached_data = await risk_score_cache.get_user_risk_score(user_id)
        
        if cached_data:
            # Use cached data
            calculated_risk_score = cached_data.get("risk_score")
            calculated_is_flagged = cached_data.get("is_flagged", False)
        else:
            # Fallback to database values if cache miss
            calculated_risk_score = user["risk_score"] if processed_claims else None  # N/A if no claims
            calculated_is_flagged = user["is_flagged"] if processed_claims else False
        
        return {
            "user": {
                "id": user["id"],
                "full_name": user["full_name"],
                "created_at": user["created_at"],
                "risk_score": calculated_risk_score,  # Can be None for N/A
                "is_flagged": calculated_is_flagged,
                "total_claims": total_claims,
                "pending_claims": pending_claims,
                "approved_claims": approved_claims,
                "denied_claims": denied_claims,
                "total_claim_value": total_value
            },
            "claims": processed_claims
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user details: {str(e)}")

@router.get("/{user_id}/disputes")
async def get_user_disputes(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50)
):
    """Get paginated dispute history for a specific user"""
    supabase = get_supabase_client()
    
    try:
        # Validate UUID format
        try:
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Get user's claims with pagination
        claims_response = supabase.table("claims").select(
            "id, status, risk_score, is_flagged, created_at, claim_data, store_id"
        ).eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        claims = claims_response.data if claims_response.data else []
        
        # Get total count
        count_response = supabase.table("claims").select("id", count="exact").eq("user_id", user_id).execute()
        total_disputes = count_response.count if count_response.count else 0
        
        # Get store information
        store_ids = list(set(claim.get('store_id') for claim in claims if claim.get('store_id')))
        stores_map = {}
        
        if store_ids:
            stores_response = supabase.table("stores").select(
                "id, name"
            ).in_("id", store_ids).execute()
            
            if stores_response.data:
                stores_map = {store['id']: store['name'] for store in stores_response.data}
        
        # Format disputes
        disputes = []
        for claim in claims:
            claim_date = claim.get('created_at', '')
            try:
                formatted_date = datetime.fromisoformat(
                    claim_date.replace('Z', '+00:00')
                ).strftime("%Y-%m-%d")
            except:
                formatted_date = "2024-01-15"
            
            # Extract categories from claim_data
            claim_data = claim.get('claim_data', [])
            categories = set()
            
            if isinstance(claim_data, list):
                for item in claim_data:
                    if isinstance(item, dict) and 'category' in item:
                        categories.add(item['category'].title())
            
            disputes.append({
                "date": formatted_date,
                "company": stores_map.get(claim.get('store_id'), 'Unknown Store'),
                "category": ', '.join(categories) if categories else 'Unknown',
                "itemLink": f"https://example-store.com/claim/{claim['id']}"
            })
        
        return {
            "disputes": disputes,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_disputes,
                "totalPages": (total_disputes + limit - 1) // limit
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user disputes: {str(e)}")
