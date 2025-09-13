from pydantic import BaseModel
from datetime import date

class KYCData(BaseModel):
    full_name: str
    dob: date
    kyc_email: str

class KYCResponse(BaseModel):
    kyc_id: str
    full_name: str
    dob: date
    verified: bool = True
