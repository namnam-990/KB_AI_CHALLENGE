from typing import Literal

from pydantic import BaseModel


class SimulatorRequest(BaseModel):
    productType: Literal["loan", "card"]


class RequiredDoc(BaseModel):
    id: str
    label: str
    status: Literal["complete", "missing", "processing"]
    hint: str
    optional: bool | None = None
    aiFeedback: str | None = None  # 서류별 인라인 AI 피드백 (1~3줄)


class LoanOffer(BaseModel):
    id: str
    productName: str
    interestRate: str
    maxAmount: str
    tier: Literal["recommended", "eligible", "conditional"]
    note: str


class CardInsight(BaseModel):
    approvalLikelihoodLabel: str
    approvalLikelihoodPercent: int
    recommendedLimit: str
    limitRange: str
    note: str


class SimulatorResult(BaseModel):
    productName: str
    approvalScore: int
    approvalLabel: str
    altCreditScore: int
    requiredDocs: list[RequiredDoc]
    nextAction: str
    creditScoreTip: str  # 하단 종합 AI 피드백: 신용점수를 올리기 좋은 전략
    loanOffers: list[LoanOffer] | None = None  # productType == "loan"일 때만
    cardInsight: CardInsight | None = None  # productType == "card"일 때만
