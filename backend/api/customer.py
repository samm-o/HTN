from fastapi import APIRouter, HTTPException, status, Query
from schemas.user import CustomerCreate, CustomerResponse, CustomerCreateResponse, CustomerGetResponse
from crud.crud_customer import customer_crud
from pydantic import EmailStr

router = APIRouter(prefix="/api/v1", tags=["customers"])

@router.post("/customers", response_model=CustomerCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(customer: CustomerCreate) -> CustomerCreateResponse:
    """Create a new customer"""
    # Check if customer with email already exists
    existing_customer = await customer_crud.get_customer_by_email(customer.email)
    if existing_customer["success"] and existing_customer["data"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer with this email already exists"
        )
    
    # Create the customer
    result = await customer_crud.create_customer(customer)
    
    if result["success"]:
        return CustomerCreateResponse(
            message=result["message"],
            customer=CustomerResponse(**result["data"])
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["message"]
        )

@router.get("/customers/{customer_id}", response_model=CustomerGetResponse)
async def get_customer(customer_id: str) -> CustomerGetResponse:
    """Get a customer by ID"""
    result = await customer_crud.get_customer_by_id(customer_id)
    
    if result["success"] and result["data"]:
        return CustomerGetResponse(
            message=result["message"],
            customer=CustomerResponse(**result["data"])
        )
    elif result["success"] and not result["data"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["message"]
        )

@router.get("/customers/by-email", response_model=CustomerGetResponse)
async def get_customer_by_email(email: EmailStr = Query(..., description="Customer email address")) -> CustomerGetResponse:
    """Get a customer by email address"""
    result = await customer_crud.get_customer_by_email(email)
    
    if result["success"] and result["data"]:
        return CustomerGetResponse(
            message=result["message"],
            customer=CustomerResponse(**result["data"])
        )
    elif result["success"] and not result["data"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["message"]
        )
