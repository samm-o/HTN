from pydantic import BaseModel
from typing import List
import uuid
from .item_data import ItemData

class ClaimContext(BaseModel):
    store_id: uuid.UUID
    email_at_store: str
    claim_data: List[ItemData]

class ClaimSubmissionPayload(BaseModel):
    user_id: uuid.UUID
    claim_context: ClaimContext
