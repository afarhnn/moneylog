"""
Budget service — business logic for budget management.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.repositories.budget_repo import BudgetRepository
from app.repositories.transaction_repo import TransactionRepository


def _compute_usage(budget: Budget, transactions: list[Transaction]) -> dict:
    """Annotate a budget dict with usage/persen/status fields."""
    terpakai = sum(
        t.nominal for t in transactions
        if t.kategori == budget.kategori and t.tipe == "pengeluaran"
    )
    persen = (terpakai / budget.limit_nominal * 100) if budget.limit_nominal > 0 else 0
    if persen >= 100:
        status_label = "danger"
    elif persen >= 80:
        status_label = "warning"
    else:
        status_label = "aman"

    return {
        "id": budget.id,
        "kategori": budget.kategori,
        "limit_nominal": budget.limit_nominal,
        "terpakai": terpakai,
        "sisa": budget.limit_nominal - terpakai,
        "persen": round(persen, 2),
        "status": status_label,
    }


class BudgetService:
    def __init__(self, db: Session) -> None:
        self.repo = BudgetRepository(db)
        self.tx_repo = TransactionRepository(db)

    def get_all(self, user_id: int) -> list[dict]:
        budgets = self.repo.get_all(user_id)
        transactions = self.tx_repo.get_all(user_id)
        return [_compute_usage(b, transactions) for b in budgets]

    def create_or_update(self, user_id: int, kategori: str, limit_nominal: float) -> dict:
        if limit_nominal <= 0:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail="Limit nominal harus lebih dari 0")
        existing = self.repo.get_by_kategori(user_id, kategori)
        if existing:
            budget = self.repo.update_limit(existing, limit_nominal)
        else:
            budget = self.repo.create(user_id, kategori, limit_nominal)
        transactions = self.tx_repo.get_all(user_id)
        return _compute_usage(budget, transactions)

    def delete(self, budget_id: int, user_id: int) -> dict:
        budget = self.repo.get_by_id(budget_id, user_id)
        if not budget:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Budget tidak ditemukan")
        self.repo.delete(budget)
        return {"message": "Budget berhasil dihapus"}
