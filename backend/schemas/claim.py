from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from enum import Enum
import uuid
from .item_data import ItemData

class ClaimStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    DENIED = "DENIED"

class Claim(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    user_id: uuid.UUID  # Foreign Key to User id (KYC ID)
    store_id: uuid.UUID  # Foreign Key to Store id
    email_at_store: str
    status: ClaimStatus = Field(default=ClaimStatus.PENDING)
    claim_data: List[ItemData]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ClaimCreate(BaseModel):
    user_id: uuid.UUID
    store_id: uuid.UUID
    email_at_store: str
    claim_data: List[ItemData]

class ClaimResponse(BaseModel):
    claim_id: uuid.UUID
    user_id: uuid.UUID
    status: ClaimStatus
    risk_score: int
    is_flagged: bool
    message: str

class ClaimUpdateStatus(BaseModel):
    status: ClaimStatus
