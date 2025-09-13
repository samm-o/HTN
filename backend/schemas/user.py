from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    full_name: str
    dob: str
    address: str
    email: EmailStr  # Pydantic will validate this is a proper email format
    phone_number: str

class UserResponse(BaseModel):
    id: str
    created_at: str
    full_name: str
    dob: str
    address: str
    email: EmailStr
    phone_number: str
    risk_level: str

class UserCreateResponse(BaseModel):
    message: str
    user: UserResponse

class UserGetResponse(BaseModel):
    message: str
    user: UserResponse