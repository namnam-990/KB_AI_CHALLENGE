"""증빙 자동화 에이전트: 서류 이미지 -> OCR -> LLM으로 은행 표준 양식 변환.

TODO:
- OCR 엔진 연동 (Upstage/Naver Clova OCR 등 한국어 특화 API 검토)
- LLM 프롬프트로 추출 필드 표준화 + 서식 매핑
- 표준화된 문서를 스토리지(S3 등)에 저장 후 URL 반환
"""

from fastapi import UploadFile

from app.schemas.verification import VerificationResult


async def run_verification(user_id: str) -> VerificationResult:
    """다른 서비스(예: 승인 시뮬레이터)에서 내부적으로 호출하는 용도."""
    # TODO: 사용자의 최근 업로드 서류들을 조회해서 검증 상태를 종합 반환
    return VerificationResult(
        docType="employment_cert",
        status="complete",
        extractedFields={},
        standardizedDocUrl=None,
    )


async def run_verification_on_upload(user_id: str, image: UploadFile, doc_type: str) -> VerificationResult:
    """/agents/verification 엔드포인트에서 직접 호출."""
    # TODO: image.read()로 바이트를 읽어 OCR -> LLM 파이프라인 실행
    return VerificationResult(
        docType=doc_type,
        status="processing",
        extractedFields={},
        standardizedDocUrl=None,
    )
