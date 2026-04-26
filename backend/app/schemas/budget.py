from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BudgetCreate(BaseModel):
    kategori: str
    limit_nominal: float

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    kategori: str
    limit_nominal: float
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetWithUsage(BaseModel):
    id: int
    kategori: str
    limit_nominal: float
    terpakai: float
    sisa: float
    persen: float
    status: str