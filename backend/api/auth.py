from fastapi import APIRouter, HTTPException, status
from schemas.user import UserRegister, UserLogin, LoginResponse, Token, UserResponse
from crud.crud_user import user_crud
from core.security import create_access_token
from datetime import timedelta

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister) -> LoginResponse:
    """Register a new user"""
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
        # Create access token
        access_token = create_access_token(
            data={"sub": result["data"]["email"], "user_id": result["data"]["id"]}
        )
        
        return LoginResponse(
            message="User registered successfully",
            token=Token(access_token=access_token, token_type="bearer"),
            user=UserResponse(**result["data"])
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["message"]
        )

@router.post("/login", response_model=LoginResponse)
async def login(user_credentials: UserLogin) -> LoginResponse:
    """Login user"""
    # Authenticate user
    result = await user_crud.authenticate_user(user_credentials.email, user_credentials.password)
    
    if result["success"]:
        # Create access token
        access_token = create_access_token(
            data={"sub": result["data"]["email"], "user_id": result["data"]["id"]}
        )
        
        return LoginResponse(
            message="Login successful",
            token=Token(access_token=access_token, token_type="bearer"),
            user=UserResponse(**result["data"])
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result["message"]
        )
