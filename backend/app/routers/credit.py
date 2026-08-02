"""공통 인프라 에이전트: 대안 신용평가."""

from fastapi import APIRouter, Depends

from app.core.security import CurrentUser, get_current_user
from app.schemas.verification import CreditScoreResult
from app.services.credit_agent import calculate_credit_score

router = APIRouter(prefix="/agents", tags=["infra-agents"])


@router.post("/credit-score", response_model=CreditScoreResult)
async def credit_score(user: CurrentUser = Depends(get_current_user)):
    return await calculate_credit_score(user_id=user.id)
