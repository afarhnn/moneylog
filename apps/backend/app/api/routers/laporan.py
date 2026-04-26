"""
Laporan router — thin endpoint layer, delegates to LaporanService.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.laporan_service import LaporanService

router = APIRouter(prefix="/laporan", tags=["Laporan"])


@router.get("/semua-bulan")
def semua_bulan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LaporanService(db).get_semua_bulan(current_user.id)


@router.get("/bulanan")
def laporan_bulanan(
    bulan: int,
    tahun: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LaporanService(db).get_bulanan(current_user.id, bulan, tahun)
