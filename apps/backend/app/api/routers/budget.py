"""
Budget router — thin endpoint layer, delegates to BudgetService.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["Budgets"])


class BudgetIn(BaseModel):
    kategori: str
    limit_nominal: float


@router.get("/")
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BudgetService(db).get_all(current_user.id)


@router.post("/", status_code=201)
def create_budget(
    payload: BudgetIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BudgetService(db).create_or_update(
        current_user.id, payload.kategori, payload.limit_nominal
    )


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BudgetService(db).delete(budget_id, current_user.id)
