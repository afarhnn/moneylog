from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.budget import Budget
from app.models.transaction import Transaction, TipeTransaksi
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetWithUsage
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budget"])

@router.post("/", response_model=BudgetResponse)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Cek apakah kategori udah ada
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.kategori == budget.kategori
    ).first()
    
    if existing:
        existing.limit_nominal = budget.limit_nominal
        db.commit()
        db.refresh(existing)
        return existing
    
    new_budget = Budget(
        user_id=current_user.id,
        kategori=budget.kategori,
        limit_nominal=budget.limit_nominal
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.get("/", response_model=List[BudgetWithUsage])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    
    result = []
    for budget in budgets:
        terpakai = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.kategori == budget.kategori,
            Transaction.tipe == TipeTransaksi.pengeluaran
        ).all()
        
        total_terpakai = sum(t.nominal for t in terpakai)
        sisa = max(budget.limit_nominal - total_terpakai, 0)
        persen = min((total_terpakai / budget.limit_nominal) * 100, 100) if budget.limit_nominal > 0 else 0
        
        if persen >= 100:
            status = "danger"
        elif persen >= 75:
            status = "warning"
        else:
            status = "aman"
        
        result.append(BudgetWithUsage(
            id=budget.id,
            kategori=budget.kategori,
            limit_nominal=budget.limit_nominal,
            terpakai=total_terpakai,
            sisa=sisa,
            persen=persen,
            status=status
        ))
    
    return result

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget tidak ditemukan")
    db.delete(budget)
    db.commit()
    return {"message": "Budget berhasil dihapus"}