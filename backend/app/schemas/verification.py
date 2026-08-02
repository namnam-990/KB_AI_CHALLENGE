from typing import Literal

from pydantic import BaseModel


class VerificationResult(BaseModel):
    docType: str
    status: Literal["complete", "missing", "processing"]
    extractedFields: dict
    standardizedDocUrl: str | None = None


class CreditFactor(BaseModel):
    label: str
    impact: Literal["positive", "negative"]
    weight: float


class CreditScoreResult(BaseModel):
    score: int
    factors: list[CreditFactor]
