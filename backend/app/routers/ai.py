from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.utils.dependencies import get_current_user
from dotenv import load_dotenv
import httpx
import os

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Insight"])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

@router.get("/insight")
async def get_insight(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ambil semua transaksi user
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()

    if not transactions:
        return {"insight": "Belum ada transaksi. Mulai catat keuangan kamu dulu ya!"}

    # Susun ringkasan transaksi buat dikirim ke AI
    total_pemasukan = sum(t.nominal for t in transactions if t.tipe.value == "pemasukan")
    total_pengeluaran = sum(t.nominal for t in transactions if t.tipe.value == "pengeluaran")
    saldo = total_pemasukan - total_pengeluaran

    # Ringkasan per kategori
    kategori_pengeluaran = {}
    for t in transactions:
        if t.tipe.value == "pengeluaran":
            if t.kategori not in kategori_pengeluaran:
                kategori_pengeluaran[t.kategori] = 0
            kategori_pengeluaran[t.kategori] += t.nominal

    # Format data transaksi
    transaksi_text = "\n".join([
        f"- {t.judul} | {t.tipe.value} | Rp{t.nominal:,.0f} | kategori: {t.kategori}"
        for t in transactions[-20:]  # ambil 20 transaksi terakhir
    ])

    kategori_text = "\n".join([
        f"- {k}: Rp{v:,.0f}" for k, v in kategori_pengeluaran.items()
    ])

    prompt = f"""Kamu adalah asisten keuangan pribadi yang friendly dan berbicara bahasa Indonesia.

Berikut data keuangan user:
- Total Pemasukan: Rp{total_pemasukan:,.0f}
- Total Pengeluaran: Rp{total_pengeluaran:,.0f}
- Saldo: Rp{saldo:,.0f}

Pengeluaran per kategori:
{kategori_text}

20 Transaksi terakhir:
{transaksi_text}

Berikan analisis keuangan yang:
1. Ringkas dan mudah dipahami (max 5 poin)
2. Kasih 1-2 saran konkret buat hemat
3. Apresiasi kalau kondisi keuangannya bagus
4. Gunakan emoji biar lebih menarik
5. Bahasa santai tapi informatif
"""

   # Kirim ke OpenRouter
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "stepfun/step-3.5-flash:free",
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=30.0
        )
        data = response.json()
        
        # Debug — liat response asli dari OpenRouter
        print("OpenRouter response:", data)
        
        if "choices" not in data:
            return {"insight": f"Error dari OpenRouter: {data}"}
            
        insight = data["choices"][0]["message"]["content"]

    return {"insight": insight}