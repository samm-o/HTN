from pydantic import BaseModel
from typing import List
import uuid
from .kyc import KYCData
from .item_data import ItemData

class ClaimContext(BaseModel):
    store_id: uuid.UUID
    email_at_store: str
    claim_data: List[ItemData]

class ClaimSubmissionPayload(BaseModel):
    kyc_data: KYCData
    claim_context: ClaimContext
