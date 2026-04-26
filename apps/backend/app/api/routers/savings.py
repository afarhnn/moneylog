from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.savings import (
    SavingsWalletCreate, SavingsWalletResponse,
    SavingsGoalCreate, SavingsGoalResponse,
    ContributionCreate, ContributionResponse
)
from app.services.savings_service import SavingsService

router = APIRouter(prefix="/savings", tags=["Savings"])

@router.post("/wallets", response_model=SavingsWalletResponse)
def create_wallet(
    wallet: SavingsWalletCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SavingsService(db).create_wallet(current_user.id, wallet)

@router.get("/wallets", response_model=List[SavingsWalletResponse])
def get_wallets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SavingsService(db).get_wallets(current_user.id)

@router.post("/goals", response_model=SavingsGoalResponse)
def create_goal(
    goal: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SavingsService(db).create_goal(current_user.id, goal)

@router.post("/contributions", response_model=ContributionResponse)
def add_contribution(
    contribution: ContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SavingsService(db).add_contribution(current_user.id, contribution)
