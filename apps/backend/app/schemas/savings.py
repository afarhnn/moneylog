from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class ContributionBase(BaseModel):
    amount: float
    note: Optional[str] = None

class ContributionCreate(ContributionBase):
    goal_id: int

class ContributionResponse(ContributionBase):
    id: int
    goal_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SavingsGoalBase(BaseModel):
    title: str
    target_amount: float
    image_url: Optional[str] = None
    deadline: Optional[date] = None

class SavingsGoalCreate(SavingsGoalBase):
    wallet_id: int

class SavingsGoalResponse(SavingsGoalBase):
    id: int
    wallet_id: int
    current_amount: float
    is_achieved: int
    created_at: datetime
    contributions: List[ContributionResponse] = []

    class Config:
        from_attributes = True

class SavingsWalletBase(BaseModel):
    name: str

class SavingsWalletCreate(SavingsWalletBase):
    pass

class SavingsWalletResponse(SavingsWalletBase):
    id: int
    balance: float
    created_at: datetime
    goals: List[SavingsGoalResponse] = []

    class Config:
        from_attributes = True
