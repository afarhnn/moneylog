"""
Security utilities: password hashing and JWT token management.
"""
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import JWTError, jwt

from app.core.config import settings

_ph = PasswordHasher()


# ─────────────────────────── Password ────────────────────────────

def hash_password(plain: str) -> str:
    """Return Argon2 hash of a plaintext password."""
    return _ph.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches *hashed*."""
    try:
        return _ph.verify(hashed, plain)
    except VerifyMismatchError:
        return False


# ─────────────────────────── JWT ─────────────────────────────────

def create_access_token(data: dict) -> str:
    """Create a signed JWT access token with expiry."""
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload["exp"] = expire
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    Raises JWTError if invalid or expired.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
