from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.database import get_db
from app.models.transaction import Transaction, TipeTransaksi
from app.models.user import User
from app.utils.dependencies import get_current_user
from datetime import datetime

router = APIRouter(prefix="/laporan", tags=["Laporan"])

@router.get("/bulanan")
def get_laporan_bulanan(
    bulan: int = None,
    tahun: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Default bulan & tahun sekarang
    now = datetime.now()
    bulan = bulan or now.month
    tahun = tahun or now.year

    # Ambil transaksi bulan ini
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        extract('month', Transaction.tanggal) == bulan,
        extract('year', Transaction.tanggal) == tahun
    ).all()

    # Hitung total
    total_pemasukan = sum(t.nominal for t in transactions if t.tipe == TipeTransaksi.pemasukan)
    total_pengeluaran = sum(t.nominal for t in transactions if t.tipe == TipeTransaksi.pengeluaran)
    saldo = total_pemasukan - total_pengeluaran

    # Pengeluaran per kategori
    kategori_pengeluaran = {}
    for t in transactions:
        if t.tipe == TipeTransaksi.pengeluaran:
            if t.kategori not in kategori_pengeluaran:
                kategori_pengeluaran[t.kategori] = 0
            kategori_pengeluaran[t.kategori] += t.nominal

    # Pemasukan per kategori
    kategori_pemasukan = {}
    for t in transactions:
        if t.tipe == TipeTransaksi.pemasukan:
            if t.kategori not in kategori_pemasukan:
                kategori_pemasukan[t.kategori] = 0
            kategori_pemasukan[t.kategori] += t.nominal

    # Transaksi terbesar
    transaksi_terbesar = sorted(transactions, key=lambda t: t.nominal, reverse=True)[:5]

    return {
        "bulan": bulan,
        "tahun": tahun,
        "nama_bulan": datetime(tahun, bulan, 1).strftime("%B %Y"),
        "total_transaksi": len(transactions),
        "total_pemasukan": total_pemasukan,
        "total_pengeluaran": total_pengeluaran,
        "saldo": saldo,
        "rasio_tabungan": round(((total_pemasukan - total_pengeluaran) / total_pemasukan * 100), 1) if total_pemasukan > 0 else 0,
        "kategori_pengeluaran": [
            {"kategori": k, "nominal": v, "persen": round(v / total_pengeluaran * 100, 1) if total_pengeluaran > 0 else 0}
            for k, v in sorted(kategori_pengeluaran.items(), key=lambda x: x[1], reverse=True)
        ],
        "kategori_pemasukan": [
            {"kategori": k, "nominal": v}
            for k, v in sorted(kategori_pemasukan.items(), key=lambda x: x[1], reverse=True)
        ],
        "transaksi_terbesar": [
            {
                "judul": t.judul,
                "nominal": t.nominal,
                "tipe": t.tipe.value,
                "kategori": t.kategori,
                "tanggal": t.tanggal.strftime("%d %B %Y")
            }
            for t in transaksi_terbesar
        ]
    }

@router.get("/semua-bulan")
def get_semua_bulan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()

    bulan_data = {}
    for t in transactions:
        key = f"{t.tanggal.year}-{t.tanggal.month:02d}"
        if key not in bulan_data:
            bulan_data[key] = {
                "bulan": t.tanggal.month,
                "tahun": t.tanggal.year,
                "nama_bulan": t.tanggal.strftime("%B %Y"),
                "pemasukan": 0,
                "pengeluaran": 0
            }
        if t.tipe == TipeTransaksi.pemasukan:
            bulan_data[key]["pemasukan"] += t.nominal
        else:
            bulan_data[key]["pengeluaran"] += t.nominal

    result = sorted(bulan_data.values(), key=lambda x: (x["tahun"], x["bulan"]), reverse=True)
    return result