"""
AI router — thin endpoint layer, delegates to AIService.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/insight")
def get_insight(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AIService(db).get_insight(current_user.id)
