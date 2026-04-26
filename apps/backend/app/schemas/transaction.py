from pydantic import BaseModel
from datetime import datetime
from app.models.transaction import TipeTransaksi
from typing import Optional

class TransactionCreate(BaseModel):
    judul: str
    nominal: float
    tipe: TipeTransaksi
    kategori: str
    catatan: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    judul: str
    nominal: float
    tipe: TipeTransaksi
    kategori: str
    catatan: Optional[str]
    tanggal: datetime

    class Config:
        from_attributes = True