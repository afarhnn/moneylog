from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Cek apakah email sudah terdaftar
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email sudah terdaftar"
        )
    
    # Simpan user baru ke database
    new_user = User(
        nama=user.nama,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # ambil data terbaru dari database
    
    # Return manual biar id keambil dengan bener
    return UserResponse(
        id=new_user.id,
        nama=new_user.nama,
        email=new_user.email
    )

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Cari user berdasarkan email
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Email atau password salah"
        )
    
    # Verifikasi password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Email atau password salah"
        )
    
    # Bikin token JWT
    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "nama": db_user.nama
    }