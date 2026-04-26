from sqlalchemy.orm import Session
from app.repositories.savings_repository import SavingsRepository
from app.schemas.savings import SavingsWalletCreate, SavingsGoalCreate, ContributionCreate
from fastapi import HTTPException

class SavingsService:
    def __init__(self, db: Session):
        self.repository = SavingsRepository(db)
        self.db = db

    def create_wallet(self, user_id: int, wallet_data: SavingsWalletCreate):
        return self.repository.create_wallet(user_id, wallet_data.name)

    def get_wallets(self, user_id: int):
        return self.repository.get_wallets(user_id)

    def create_goal(self, user_id: int, goal_data: SavingsGoalCreate):
        # Verify wallet ownership
        wallet = self.repository.get_wallet(goal_data.wallet_id, user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet tidak ditemukan")
        
        return self.repository.create_goal(
            goal_data.wallet_id,
            goal_data.title,
            goal_data.target_amount,
            goal_data.image_url,
            goal_data.deadline
        )

    def add_contribution(self, user_id: int, contribution_data: ContributionCreate):
        goal = self.repository.get_goal(contribution_data.goal_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Target tidak ditemukan")
        
        # Verify wallet ownership through goal
        wallet = self.repository.get_wallet(goal.wallet_id, user_id)
        if not wallet:
            raise HTTPException(status_code=403, detail="Akses ditolak")

        # Start transaction
        try:
            # 1. Create contribution
            contribution = self.repository.create_contribution(
                contribution_data.goal_id,
                contribution_data.amount,
                contribution_data.note
            )
            
            # 2. Update goal current_amount
            self.repository.update_goal_amount(contribution_data.goal_id, contribution_data.amount)
            
            # 3. Update wallet balance
            wallet.balance += contribution_data.amount
            self.db.commit()
            
            return contribution
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    def delete_wallet(self, user_id: int, wallet_id: int):
        wallet = self.repository.get_wallet(wallet_id, user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet tidak ditemukan")
        self.repository.delete_wallet(wallet_id, user_id)
        return {"message": "Wallet berhasil dihapus"}
