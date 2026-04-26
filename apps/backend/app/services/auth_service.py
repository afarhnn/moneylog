"""
Auth service — business logic for registration and login.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.repositories.user_repo import UserRepository


class AuthService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def register(self, nama: str, email: str, password: str) -> dict:
        if len(password) < 6:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password minimal 6 karakter",
            )
        if self.repo.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email sudah terdaftar",
            )
        user = self.repo.create(nama=nama, email=email, password=password)
        return {"message": "Registrasi berhasil", "user_id": user.id}

    def login(self, email: str, password: str) -> dict:
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email atau password salah",
            )
        token = create_access_token({"user_id": user.id})
        return {"access_token": token, "token_type": "bearer", "nama": user.nama}
