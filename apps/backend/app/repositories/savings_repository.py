from sqlalchemy.orm import Session
from app.models.savings import SavingsWallet, SavingsGoal, Contribution
from typing import List, Optional

class SavingsRepository:
    def __init__(self, db: Session):
        self.db = db

    # Wallets
    def create_wallet(self, user_id: int, name: str) -> SavingsWallet:
        wallet = SavingsWallet(user_id=user_id, name=name)
        self.db.add(wallet)
        self.db.commit()
        self.db.refresh(wallet)
        return wallet

    def get_wallets(self, user_id: int) -> List[SavingsWallet]:
        return self.db.query(SavingsWallet).filter(SavingsWallet.user_id == user_id).all()

    def get_wallet(self, wallet_id: int, user_id: int) -> Optional[SavingsWallet]:
        return self.db.query(SavingsWallet).filter(SavingsWallet.id == wallet_id, SavingsWallet.user_id == user_id).first()

    def delete_wallet(self, wallet_id: int, user_id: int):
        wallet = self.get_wallet(wallet_id, user_id)
        if wallet:
            self.db.delete(wallet)
            self.db.commit()

    # Goals
    def create_goal(self, wallet_id: int, title: str, target_amount: float, image_url: Optional[str], deadline: Optional[str]) -> SavingsGoal:
        goal = SavingsGoal(
            wallet_id=wallet_id,
            title=title,
            target_amount=target_amount,
            image_url=image_url,
            deadline=deadline
        )
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def get_goal(self, goal_id: int) -> Optional[SavingsGoal]:
        return self.db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()

    def update_goal_amount(self, goal_id: int, amount: float):
        goal = self.get_goal(goal_id)
        if goal:
            goal.current_amount += amount
            if goal.current_amount >= goal.target_amount:
                goal.is_achieved = 1
            self.db.commit()

    # Contributions
    def create_contribution(self, goal_id: int, amount: float, note: Optional[str]) -> Contribution:
        contribution = Contribution(goal_id=goal_id, amount=amount, note=note)
        self.db.add(contribution)
        self.db.commit()
        self.db.refresh(contribution)
        return contribution
