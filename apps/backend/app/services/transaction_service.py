"""
Transaction service — business logic for transaction CRUD.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.repositories.transaction_repo import TransactionRepository


class TransactionService:
    def __init__(self, db: Session) -> None:
        self.repo = TransactionRepository(db)

    def get_all(self, user_id: int) -> list[Transaction]:
        return self.repo.get_all(user_id)

    def get_by_id(self, transaction_id: int, user_id: int) -> Transaction:
        obj = self.repo.get_by_id(transaction_id, user_id)
        if not obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Transaksi tidak ditemukan")
        return obj

    def create(self, user_id: int, data: dict) -> Transaction:
        if data.get("nominal", 0) <= 0:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail="Nominal harus lebih dari 0")
        return self.repo.create(user_id, data)

    def update(self, transaction_id: int, user_id: int, data: dict) -> Transaction:
        obj = self.get_by_id(transaction_id, user_id)
        if "nominal" in data and data["nominal"] <= 0:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail="Nominal harus lebih dari 0")
        return self.repo.update(obj, data)

    def delete(self, transaction_id: int, user_id: int) -> dict:
        obj = self.get_by_id(transaction_id, user_id)
        self.repo.delete(obj)
        return {"message": "Transaksi berhasil dihapus"}
