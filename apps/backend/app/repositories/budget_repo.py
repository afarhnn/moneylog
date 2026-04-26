"""
Budget repository — all DB access for Budget model.
"""
from sqlalchemy.orm import Session
from app.models.budget import Budget


class BudgetRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_all(self, user_id: int) -> list[Budget]:
        return self.db.query(Budget).filter(Budget.user_id == user_id).all()

    def get_by_id(self, budget_id: int, user_id: int) -> Budget | None:
        return (
            self.db.query(Budget)
            .filter(Budget.id == budget_id, Budget.user_id == user_id)
            .first()
        )

    def get_by_kategori(self, user_id: int, kategori: str) -> Budget | None:
        return (
            self.db.query(Budget)
            .filter(Budget.user_id == user_id, Budget.kategori == kategori)
            .first()
        )

    def create(self, user_id: int, kategori: str, limit_nominal: float) -> Budget:
        obj = Budget(user_id=user_id, kategori=kategori, limit_nominal=limit_nominal)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_limit(self, budget: Budget, limit_nominal: float) -> Budget:
        budget.limit_nominal = limit_nominal
        self.db.commit()
        self.db.refresh(budget)
        return budget

    def delete(self, budget: Budget) -> None:
        self.db.delete(budget)
        self.db.commit()
