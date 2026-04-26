"""
AI service — OpenRouter integration for financial insight.
"""
import logging

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.transaction_repo import TransactionRepository

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self, db: Session) -> None:
        self.repo = TransactionRepository(db)

    def get_insight(self, user_id: int) -> dict:
        if not settings.OPENROUTER_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service belum dikonfigurasi. Hubungi administrator.",
            )

        transactions = self.repo.get_all(user_id)
        if not transactions:
            return {"insight": "Belum ada transaksi untuk dianalisis. Tambahkan beberapa transaksi terlebih dahulu."}

        # Build summary for AI prompt
        pemasukan = sum(t.nominal for t in transactions if t.tipe == "pemasukan")
        pengeluaran = sum(t.nominal for t in transactions if t.tipe == "pengeluaran")
        saldo = pemasukan - pengeluaran

        kategori_map: dict[str, float] = {}
        for t in transactions:
            if t.tipe == "pengeluaran":
                kategori_map[t.kategori] = kategori_map.get(t.kategori, 0) + t.nominal
        top_kategori = sorted(kategori_map.items(), key=lambda x: -x[1])[:5]

        summary_lines = [
            f"- Total Pemasukan: Rp{pemasukan:,.0f}",
            f"- Total Pengeluaran: Rp{pengeluaran:,.0f}",
            f"- Saldo Bersih: Rp{saldo:,.0f}",
            f"- Jumlah Transaksi: {len(transactions)}",
            "- Top Kategori Pengeluaran:",
            *[f"  * {k}: Rp{v:,.0f}" for k, v in top_kategori],
        ]

        prompt = (
            "Kamu adalah analis keuangan pribadi yang berpengalaman. "
            "Berikan analisis mendalam dan actionable berdasarkan data keuangan berikut:\n\n"
            + "\n".join(summary_lines)
            + "\n\nBerikan:\n"
            "1. Penilaian kondisi keuangan saat ini\n"
            "2. Kebiasaan pengeluaran yang perlu diperhatikan\n"
            "3. Minimal 3 saran konkret untuk meningkatkan kondisi keuangan\n"
            "4. Target realistis untuk bulan depan\n\n"
            "Gunakan Bahasa Indonesia yang ramah dan mudah dipahami."
        )

        try:
            response = httpx.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "HTTP-Referer": settings.AI_SITE_URL,
                    "X-Title": settings.AI_SITE_NAME,
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.AI_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=60.0,
            )
            response.raise_for_status()
            data = response.json()
            insight_text = data["choices"][0]["message"]["content"]
            return {"insight": insight_text}

        except httpx.TimeoutException:
            logger.error("OpenRouter request timed out for user %s", user_id)
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="AI response timeout. Coba lagi dalam beberapa detik.",
            )
        except httpx.HTTPStatusError as exc:
            logger.error("OpenRouter HTTP error %s for user %s", exc.response.status_code, user_id)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gagal menghubungi AI service. Coba lagi.",
            )
        except Exception as exc:
            logger.exception("Unexpected AI error for user %s: %s", user_id, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Terjadi kesalahan internal pada AI service.",
            )
