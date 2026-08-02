from typing import Literal

from pydantic import BaseModel


class VerificationResult(BaseModel):
    docType: str
    status: Literal["complete", "missing", "processing"]
    extractedFields: dict
    standardizedDocUrl: str | None = None
    note: str | None = None  # 인식 결과에 대한 1줄 코멘트 (문제가 있을 때 특히 유용)


class CreditFactor(BaseModel):
    label: str
    impact: Literal["positive", "negative"]
    weight: float


class CreditScoreResult(BaseModel):
    score: int
    factors: list[CreditFactor]
