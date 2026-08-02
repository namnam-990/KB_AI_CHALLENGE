"""증빙 자동화 에이전트: 서류 이미지를 Gemini 멀티모달로 직접 분석해 은행 표준 필드로 추출.

TODO:
- 표준화된 문서를 스토리지(S3 등)에 저장 후 URL 반환 (지금은 None 고정)
- 문서 유형(docType)별 프롬프트/추출 필드 스펙을 더 세분화
"""

import logging
from typing import Literal

from fastapi import UploadFile
from pydantic import BaseModel

from app.core.gemini import generate_structured_from_image
from app.schemas.verification import VerificationResult

logger = logging.getLogger(__name__)


class _ExtractedField(BaseModel):
    key: str
    value: str


class _DocumentExtraction(BaseModel):
    status: Literal["complete", "missing", "processing"]
    extractedFields: list[_ExtractedField]
    note: str


def _build_prompt(doc_type: str) -> str:
    return (
        f"다음 이미지는 한국 은행 대출/카드 심사에 제출된 '{doc_type}' 서류 사진이야. "
        "이미지에서 읽을 수 있는 정보를 은행 표준 양식 필드명(예: name, registrationNumber, "
        "employerName, monthlyIncome, issueDate 등 문서에 맞는 필드)으로 추출해서 JSON으로 줘. "
        "글자가 흐릿하거나 필수 정보가 안 보이면 status를 'processing'으로, "
        "서류 자체가 요청한 종류와 다르거나 위변조가 의심되면 'missing'으로, "
        "정상적으로 모든 핵심 정보를 읽었으면 'complete'로 표시해줘. "
        "note에는 사용자에게 보여줄 1줄짜리 코멘트를 한국어 존댓말로 써줘 — "
        "문제가 있으면 어떤 부분이 왜 안 읽혔는지, 어떻게 다시 찍으면 좋을지 구체적으로, "
        "문제가 없으면 짧은 확인 문구로."
    )


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
    """/agents/verification 엔드포인트에서 직접 호출. 업로드 이미지를 Gemini 멀티모달로 분석."""
    image_bytes = await image.read()
    mime_type = image.content_type or "image/jpeg"

    try:
        extraction = generate_structured_from_image(
            prompt=_build_prompt(doc_type),
            image_bytes=image_bytes,
            mime_type=mime_type,
            response_model=_DocumentExtraction,
        )
        status = extraction.status
        extracted_fields = {f.key: f.value for f in extraction.extractedFields}
        note = extraction.note
    except Exception:
        logger.exception("Gemini 서류 인식 실패 — 처리 중 상태로 폴백")
        status = "processing"
        extracted_fields = {}
        note = "서류 인식 중 문제가 발생했어요. 잠시 후 다시 시도해주세요."

    return VerificationResult(
        docType=doc_type,
        status=status,
        extractedFields=extracted_fields,
        standardizedDocUrl=None,
        note=note,
    )
