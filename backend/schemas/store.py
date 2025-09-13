from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class Store(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StoreCreate(BaseModel):
    name: str

class StoreResponse(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime
