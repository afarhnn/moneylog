import enum

from sqlalchemy import Column, Date, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base

class TipeTransaksi(enum.Enum):
    pemasukan = "pemasukan"
    pengeluaran = "pengeluaran"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    judul = Column(String(100), nullable=False)
    nominal = Column(Float, nullable=False)
    tipe = Column(Enum(TipeTransaksi, native_enum=False), nullable=False)
    kategori = Column(String(50), nullable=False)
    catatan = Column(String(255), nullable=True)
    tanggal = Column(Date, nullable=False, server_default=func.current_date())