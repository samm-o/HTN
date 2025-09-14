from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid
from core.supabase_client import get_supabase_client

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.get("/dashboard-metrics")
async def get_dashboard_metrics(
    time_range: str = Query("7d", regex="^(7d|1m|3m|1y)$")
):
    """Get dashboard metrics for different time ranges"""
    supabase = get_supabase_client()
    
    # Calculate date range
    now = datetime.utcnow()
    if time_range == "7d":
        start_date = now - timedelta(days=7)
        date_format = "Mon DD"
    elif time_range == "1m":
        start_date = now - timedelta(days=30)
        date_format = "Mon DD"
    elif time_range == "3m":
        start_date = now - timedelta(days=90)
        date_format = "Mon DD"
    else:  # 1y
        start_date = now - timedelta(days=365)
        date_format = "QQ YYYY"
    
    try:
        # Get claims data with user info for the time period
        claims_response = supabase.table("claims").select(
            "id, created_at, status, claim_data, users!inner(risk_score, is_flagged)"
        ).gte("created_at", start_date.isoformat()).execute()
        
        claims = claims_response.data if claims_response.data else []
        
        # Process data for charts
        suspicious_disputes = []
        approved_disputes = []
        
        # Group by date periods
        date_groups = {}
        for claim in claims:
            claim_date = datetime.fromisoformat(claim['created_at'].replace('Z', '+00:00'))
            
            if time_range == "7d":
                date_key = claim_date.strftime("%b %d")
            elif time_range == "1m":
                # Group by week
                week_start = claim_date - timedelta(days=claim_date.weekday())
                date_key = week_start.strftime("%b %d")
            elif time_range == "3m":
                # Group by 2 weeks (14 days)
                days_since_epoch = (claim_date.replace(tzinfo=None) - datetime(1970, 1, 1)).days
                week_group = days_since_epoch // 14
                week_start = datetime(1970, 1, 1) + timedelta(days=week_group * 14)
                date_key = week_start.strftime("%b %d")
            else:  # 1y
                # Group by month
                date_key = claim_date.strftime("%b %Y")
            
            if date_key not in date_groups:
                date_groups[date_key] = {"suspicious": 0, "approved": 0}
            
            # All disputes are suspicious disputes
            date_groups[date_key]["suspicious"] += 1
            
            if claim.get('status') == 'APPROVED':
                date_groups[date_key]["approved"] += 1
        
        # Convert to chart format
        for date_key, counts in date_groups.items():
            suspicious_disputes.append({"date": date_key, "value": counts["suspicious"]})
            approved_disputes.append({"date": date_key, "value": counts["approved"]})
        
        # Sort by date
        suspicious_disputes.sort(key=lambda x: x["date"])
        approved_disputes.sort(key=lambda x: x["date"])
        
        return {
            "suspiciousDisputes": suspicious_disputes,
            "approvedDisputes": approved_disputes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard metrics: {str(e)}")

@router.get("/category-distribution")
async def get_category_distribution():
    """Get distribution of disputes by category"""
    supabase = get_supabase_client()
    
    try:
        # Get all claims with category data
        claims_response = supabase.table("claims").select("claim_data").execute()
        claims = claims_response.data if claims_response.data else []
        
        category_counts = {}
        total_items = 0
        
        for claim in claims:
            claim_data = claim.get('claim_data', [])
            if isinstance(claim_data, list):
                for item in claim_data:
                    if isinstance(item, dict) and 'category' in item:
                        category = item['category'].title()
                        category_counts[category] = category_counts.get(category, 0) + 1
                        total_items += 1
        
        # Convert to percentage and format for frontend
        category_data = []
        colors = [
            'hsl(var(--chart-1))',
            'hsl(var(--chart-2))', 
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))',
            'hsl(var(--chart-5))'
        ]
        
        for i, (category, count) in enumerate(sorted(category_counts.items(), key=lambda x: x[1], reverse=True)):
            percentage = round((count / total_items) * 100) if total_items > 0 else 0
            category_data.append({
                "name": category,
                "value": percentage,
                "color": colors[i % len(colors)]
            })
        
        return category_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch category distribution: {str(e)}")

@router.get("/top-disputed-items")
async def get_top_disputed_items(limit: int = Query(5, ge=1, le=20)):
    """Get most disputed items"""
    supabase = get_supabase_client()
    
    try:
        # Get all claims with item data
        claims_response = supabase.table("claims").select("claim_data, created_at").execute()
        claims = claims_response.data if claims_response.data else []
        
        item_disputes = {}
        
        for claim in claims:
            claim_data = claim.get('claim_data', [])
            claim_date = claim.get('created_at', '')
            
            if isinstance(claim_data, list):
                for item in claim_data:
                    if isinstance(item, dict) and 'item_name' in item:
                        item_name = item['item_name']
                        category = item.get('category', 'Unknown').title()
                        
                        if item_name not in item_disputes:
                            item_disputes[item_name] = {
                                "item": item_name,
                                "category": category,
                                "disputes": 0,
                                "lastDispute": claim_date,
                                "productLink": f"https://example.com/products/{item_name.lower().replace(' ', '-')}"
                            }
                        
                        item_disputes[item_name]["disputes"] += 1
                        # Keep the most recent dispute date
                        if claim_date > item_disputes[item_name]["lastDispute"]:
                            item_disputes[item_name]["lastDispute"] = claim_date
        
        # Sort by dispute count and return top items
        top_items = sorted(item_disputes.values(), key=lambda x: x["disputes"], reverse=True)[:limit]
        
        # Format dates
        for item in top_items:
            if item["lastDispute"]:
                try:
                    date_obj = datetime.fromisoformat(item["lastDispute"].replace('Z', '+00:00'))
                    item["lastDispute"] = date_obj.strftime("%Y-%m-%d")
                except:
                    item["lastDispute"] = "2024-01-15"
        
        return top_items
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top disputed items: {str(e)}")

@router.get("/summary-stats")
async def get_summary_stats(time_range: str = Query("7d", regex="^(7d|1m|3m|1y)$")):
    """Get summary statistics for the dashboard"""
    supabase = get_supabase_client()
    
    # Calculate date range
    now = datetime.utcnow()
    if time_range == "7d":
        start_date = now - timedelta(days=7)
    elif time_range == "1m":
        start_date = now - timedelta(days=30)
    elif time_range == "3m":
        start_date = now - timedelta(days=90)
    else:  # 1y
        start_date = now - timedelta(days=365)
    
    try:
        # Get claims for the period
        claims_response = supabase.table("claims").select(
            "id, status"
        ).gte("created_at", start_date.isoformat()).execute()
        
        claims = claims_response.data if claims_response.data else []
        
        # Total disputes = ALL claims (suspicious disputes is actually total disputes)
        total_disputes = len(claims)
        
        # Approved disputes = only APPROVED claims
        total_approved = sum(1 for claim in claims if claim.get('status') == 'APPROVED')
        
        # Approval rate = (approved / total) * 100% (will always be <= 100%)
        approval_rate = (total_approved / total_disputes * 100) if total_disputes > 0 else 0
        
        return {
            "totalSuspiciousDisputes": total_disputes,  # This is actually total disputes
            "totalApprovedDisputes": total_approved,
            "approvalRate": round(approval_rate, 1)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch summary stats: {str(e)}")
