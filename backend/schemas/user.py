from pydantic import BaseModel, Field
from datetime import datetime, date
import uuid

class User(BaseModel):
    id: uuid.UUID  # This is the KYC-provided UUID
    full_name: str
    dob: date
    risk_score: int = Field(default=0, ge=0, le=100)  # Percentage 0-100
    is_flagged: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    id: uuid.UUID  # KYC-provided UUID
    full_name: str
    dob: date

class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    risk_score: int
    is_flagged: bool
    total_claims: int

class UserUpdate(BaseModel):
    risk_score: int = Field(ge=0, le=100)
    is_flagged: bool
