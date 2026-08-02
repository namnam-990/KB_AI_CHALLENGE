from typing import Literal

from pydantic import BaseModel

CategoryTag = Literal["savings", "bond", "gold", "tech-stock", "fund"]


class InvestSurveyAnswers(BaseModel):
    purposes: list[Literal["safe", "moderate", "aggressive", "unsure"]]
    horizon: Literal["short", "mid", "long"]
    lossTolerance: Literal["low", "mid", "high"]
    experiences: list[Literal["home-stock", "home-commodity", "kr-invest", "none"]]
    liquidityNeed: Literal["not-needed", "maybe", "needed-soon"]
    monthlyBudget: Literal["u5", "5to20", "20to50", "over50"]


class InvestSurveySubmitResult(BaseModel):
    received: bool = True


class RecommendedProduct(BaseModel):
    id: str
    name: str
    expectedReturnLabel: str
    riskBadge: Literal["안전", "중위험", "고위험"]
    note: str


class RecommendationCategory(BaseModel):
    id: CategoryTag
    title: str
    allocationPercent: int
    reason: str
    products: list[RecommendedProduct]


class PersonalizedInvestResult(BaseModel):
    nationality: str
    nationalityIsFallback: bool
    nationalityInsight: str
    riskTier: Literal["conservative", "moderate", "aggressive"]
    riskTierLabel: str
    riskTierSummary: str
    monthlyBudgetLabel: str
    categories: list[RecommendationCategory]
    portfolioNote: str
