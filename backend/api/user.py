from fastapi import APIRouter, HTTPException, status, Query
from schemas.user import UserCreate, UserResponse, UserCreateResponse, UserGetResponse
from crud.crud_user import user_crud
from pydantic import EmailStr

router = APIRouter(prefix="/api/v1", tags=["users"])

@router.post("/users", response_model=UserCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate) -> UserCreateResponse:
    """Create a new user"""
    # Check if user with email already exists
    existing_user = await user_crud.get_user_by_email(user.email)
    if existing_user["success"] and existing_user["data"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create the user
    result = await user_crud.create_user(user)
    
    if result["success"]:
        return UserCreateResponse(
            message=result["message"],
            user=UserResponse(**result["data"])
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["message"]
        )

@router.get("/users/{user_id}", response_model=UserGetResponse)
async def get_user(user_id: str) -> UserGetResponse:
    """Get a user by ID"""
    result = await user_crud.get_user_by_id(user_id)
    
    if result["success"] and result["data"]:
        return UserGetResponse(
            message=result["message"],
            user=UserResponse(**result["data"])
        )
    elif result["success"] and not result["data"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["message"]
        )

@router.get("/users/by-email", response_model=UserGetResponse)
async def get_user_by_email(email: EmailStr = Query(..., description="User email address")) -> UserGetResponse:
    """Get a user by email address"""
    result = await user_crud.get_user_by_email(email)
    
    if result["success"] and result["data"]:
        return UserGetResponse(
            message=result["message"],
            user=UserResponse(**result["data"])
        )
    elif result["success"] and not result["data"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["message"]
        )
