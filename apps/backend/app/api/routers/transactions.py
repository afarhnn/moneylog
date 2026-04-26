"""
Transactions router — thin endpoint layer, delegates to TransactionService.
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


class TransactionIn(BaseModel):
    judul: str
    nominal: float
    tipe: str  # "pemasukan" | "pengeluaran"
    kategori: str
    catatan: Optional[str] = None
    tanggal: Optional[date] = None


class TransactionUpdate(BaseModel):
    judul: Optional[str] = None
    nominal: Optional[float] = None
    tipe: Optional[str] = None
    kategori: Optional[str] = None
    catatan: Optional[str] = None
    tanggal: Optional[date] = None


@router.get("/")
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = TransactionService(db)
    return svc.get_all(current_user.id)


@router.get("/{transaction_id}")
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TransactionService(db).get_by_id(transaction_id, current_user.id)


@router.post("/", status_code=201)
def create_transaction(
    payload: TransactionIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude_none=True)
    if "tanggal" not in data:
        data["tanggal"] = date.today()
    return TransactionService(db).create(current_user.id, data)


@router.put("/{transaction_id}")
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude_none=True)
    return TransactionService(db).update(transaction_id, current_user.id, data)


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TransactionService(db).delete(transaction_id, current_user.id)
