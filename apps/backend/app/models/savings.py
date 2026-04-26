from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class SavingsWallet(Base):
    __tablename__ = "savings_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="savings_wallets")
    goals = relationship("SavingsGoal", back_populates="wallet", cascade="all, delete-orphan")

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("savings_wallets.id"))
    title = Column(String(100), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    image_url = Column(String(255), nullable=True)
    deadline = Column(Date, nullable=True)
    is_achieved = Column(Integer, default=0) # 0: active, 1: achieved
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("SavingsWallet", back_populates="goals")
    contributions = relationship("Contribution", back_populates="goal", cascade="all, delete-orphan")

class Contribution(Base):
    __tablename__ = "savings_contributions"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("savings_goals.id"))
    amount = Column(Float, nullable=False)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    goal = relationship("SavingsGoal", back_populates="contributions")
