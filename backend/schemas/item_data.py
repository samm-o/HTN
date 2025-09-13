from pydantic import BaseModel, Field
from typing import Optional

class ItemData(BaseModel):
    item_name: str
    category: str
    price: float = Field(gt=0)
    quantity: int = Field(gt=0)
    url: Optional[str] = None

class ItemDataResponse(BaseModel):
    item_name: str
    category: str
    price: float
    quantity: int
    url: Optional[str] = None
    total_value: float = Field(description="Calculated as price * quantity")
    
    @property
    def calculate_total_value(self) -> float:
        return self.price * self.quantity
