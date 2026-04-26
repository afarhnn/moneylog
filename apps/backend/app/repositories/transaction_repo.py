"""
Transaction repository — all DB access for Transaction model.
"""
from sqlalchemy.orm import Session
from app.models.transaction import Transaction


class TransactionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_all(self, user_id: int) -> list[Transaction]:
        return (
            self.db.query(Transaction)
            .filter(Transaction.user_id == user_id)
            .order_by(Transaction.tanggal.desc())
            .all()
        )

    def get_by_id(self, transaction_id: int, user_id: int) -> Transaction | None:
        return (
            self.db.query(Transaction)
            .filter(Transaction.id == transaction_id, Transaction.user_id == user_id)
            .first()
        )

    def get_by_month(self, user_id: int, bulan: int, tahun: int) -> list[Transaction]:
        from sqlalchemy import extract
        return (
            self.db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                extract("month", Transaction.tanggal) == bulan,
                extract("year", Transaction.tanggal) == tahun,
            )
            .order_by(Transaction.tanggal.desc())
            .all()
        )

    def create(self, user_id: int, data: dict) -> Transaction:
        obj = Transaction(user_id=user_id, **data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, transaction: Transaction, data: dict) -> Transaction:
        for key, value in data.items():
            setattr(transaction, key, value)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def delete(self, transaction: Transaction) -> None:
        self.db.delete(transaction)
        self.db.commit()
