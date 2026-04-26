"""
User repository — all DB access for User model.
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, nama: str, email: str, password: str) -> User:
        user = User(nama=nama, email=email, password=hash_password(password))
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
