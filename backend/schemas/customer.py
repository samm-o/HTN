from pydantic import BaseModel, EmailStr

class CustomerCreate(BaseModel):
    full_name: str
    dob: str
    email: EmailStr  # Pydantic will validate this is a proper email format
    password: str

class CustomerResponse(BaseModel):
    id: str
    created_at: str
    full_name: str
    dob: str
    email: EmailStr

class CustomerCreateResponse(BaseModel):
    message: str
    customer: CustomerResponse

class CustomerGetResponse(BaseModel):
    message: str
    customer: CustomerResponse

# Authentication schemas
class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class CustomerRegister(BaseModel):
    full_name: str
    dob: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginResponse(BaseModel):
    message: str
    token: Token
    customer: CustomerResponse
