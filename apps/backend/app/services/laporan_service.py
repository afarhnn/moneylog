"""
Laporan service — monthly report business logic.
"""
from calendar import month_name
from sqlalchemy.orm import Session

from app.repositories.transaction_repo import TransactionRepository


class LaporanService:
    def __init__(self, db: Session) -> None:
        self.repo = TransactionRepository(db)

    def get_semua_bulan(self, user_id: int) -> list[dict]:
        """Return list of months that have at least one transaction."""
        transactions = self.repo.get_all(user_id)
        seen: set[tuple] = set()
        result = []
        for t in sorted(transactions, key=lambda x: x.tanggal, reverse=True):
            key = (t.tanggal.year, t.tanggal.month)
            if key not in seen:
                seen.add(key)
                bln_idx = t.tanggal.month
                result.append({
                    "bulan": bln_idx,
                    "tahun": t.tanggal.year,
                    "nama_bulan": f"{month_name[bln_idx]} {t.tanggal.year}",
                })
        return result

    def get_bulanan(self, user_id: int, bulan: int, tahun: int) -> dict:
        """Return full monthly report for a given month/year."""
        transactions = self.repo.get_by_month(user_id, bulan, tahun)

        total_pemasukan = sum(t.nominal for t in transactions if t.tipe == "pemasukan")
        total_pengeluaran = sum(t.nominal for t in transactions if t.tipe == "pengeluaran")
        saldo = total_pemasukan - total_pengeluaran
        rasio = round((saldo / total_pemasukan * 100), 1) if total_pemasukan > 0 else 0.0

        # Pengeluaran grouped by kategori
        kategori_map: dict[str, float] = {}
        for t in transactions:
            if t.tipe == "pengeluaran":
                kategori_map[t.kategori] = kategori_map.get(t.kategori, 0) + t.nominal

        kategori_pengeluaran = []
        for kat, nominal in sorted(kategori_map.items(), key=lambda x: -x[1]):
            persen = round(nominal / total_pengeluaran * 100, 1) if total_pengeluaran > 0 else 0
            kategori_pengeluaran.append({
                "kategori": kat,
                "nominal": nominal,
                "persen": persen,
            })

        # Top 5 largest transactions
        transaksi_terbesar = sorted(transactions, key=lambda x: -x.nominal)[:5]

        return {
            "bulan": bulan,
            "tahun": tahun,
            "total_pemasukan": total_pemasukan,
            "total_pengeluaran": total_pengeluaran,
            "saldo": saldo,
            "rasio_tabungan": rasio,
            "kategori_pengeluaran": kategori_pengeluaran,
            "transaksi_terbesar": [
                {
                    "judul": t.judul,
                    "nominal": t.nominal,
                    "tipe": t.tipe,
                    "tanggal": str(t.tanggal.date()),
                }
                for t in transaksi_terbesar
            ],
        }
