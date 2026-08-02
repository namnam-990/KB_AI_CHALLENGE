"""공통 인프라 에이전트: 증빙 자동화. 핵심 서비스 내부에서 주로 호출되지만,
디버깅/단독 테스트를 위해 엔드포인트도 열어둠."""

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.core.security import CurrentUser, get_current_user
from app.schemas.verification import VerificationResult
from app.services.verification_agent import run_verification_on_upload

router = APIRouter(prefix="/agents", tags=["infra-agents"])


@router.post("/verification", response_model=VerificationResult)
async def verification(
    image: UploadFile = File(...),
    docType: str = Form(...),
    user: CurrentUser = Depends(get_current_user),
):
    return await run_verification_on_upload(user_id=user.id, image=image, doc_type=docType)
