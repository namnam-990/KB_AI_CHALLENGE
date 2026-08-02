from fastapi import APIRouter, File, Form, UploadFile

from app.core.security import create_access_token
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    VerifyIdResponse,
    VerifyPhoneRequest,
    VerifyPhoneResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    # TODO: 실제로는 전화번호+인증코드를 검증(SMS 발송/확인 로직)한 뒤 사용자를 조회/생성
    user_id = "u_123"
    token = create_access_token(user_id)
    return LoginResponse(accessToken=token, expiresIn=3600, userId=user_id)


@router.post("/onboarding/verify-id", response_model=VerifyIdResponse)
async def verify_id(image: UploadFile = File(...), language: str = Form("ko")):
    # TODO: OCR로 외국인등록증 진위확인 + 정보 추출 (verification_agent 재사용 검토)
    return VerifyIdResponse(
        verified=True,
        extractedName="NGUYEN VAN A",
        registrationNumber="XXXXXX-XXXXXXX",
        visaType="E-9",
        visaExpiryDate="2027-09-30",
    )


@router.post("/onboarding/verify-phone", response_model=VerifyPhoneResponse)
async def verify_phone(req: VerifyPhoneRequest):
    # TODO: 국내 통신사 본인인증 API 연동 (외국통신사/선불유심 예외처리 포함)
    return VerifyPhoneResponse(sent=True, expiresInSec=180)
