from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    full_name: str
    dob: str
    email: EmailStr  # Pydantic will validate this is a proper email format
    password: str

class UserResponse(BaseModel):
    id: str
    created_at: str
    full_name: str
    dob: str
    email: EmailStr

class UserCreateResponse(BaseModel):
    message: str
    user: UserResponse

class UserGetResponse(BaseModel):
    message: str
    user: UserResponse

# Authentication schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
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
    user: UserResponse