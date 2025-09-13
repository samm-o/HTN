from pydantic import BaseModel, EmailStr

class CustomerCreate(BaseModel):
    full_name: str
    dob: str
    id_url: str
    email: EmailStr  # Pydantic will validate this is a proper email format

class CustomerResponse(BaseModel):
    id: str
    created_at: str
    full_name: str
    dob: str
    id_url: str
    email: EmailStr

class CustomerCreateResponse(BaseModel):
    message: str
    customer: CustomerResponse

class CustomerGetResponse(BaseModel):
    message: str
    customer: CustomerResponse