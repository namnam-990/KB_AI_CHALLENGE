"""기본 골격 서비스(계좌/예적금/카드/대출/증권/송금/환전/투자) 공용 스키마."""

from typing import Literal

from pydantic import BaseModel


# --- 계좌 ---
class Transaction(BaseModel):
    id: str
    date: str
    type: Literal["deposit", "withdrawal"]
    amount: int
    counterparty: str


class AccountResult(BaseModel):
    accountNumber: str
    balance: int
    currency: str
    recentTransactions: list[Transaction]


# --- 예적금 ---
class DepositProduct(BaseModel):
    id: str
    name: str
    maturityDate: str
    currentAmount: int
    targetAmount: int


class DepositListResult(BaseModel):
    products: list[DepositProduct]


class DepositRecommendRequest(BaseModel):
    goalLabel: str
    targetAmount: int
    targetDate: str


class DepositRecommendResult(BaseModel):
    recommendedProduct: str
    monthlyDepositAmount: int
    expectedInterestRate: float


# --- 카드 ---
class Card(BaseModel):
    id: str
    name: str
    type: Literal["check", "credit"]
    monthlySpend: int


class RecommendedCard(BaseModel):
    id: str
    name: str
    reason: str


class CardListResult(BaseModel):
    cards: list[Card]
    recommendedCards: list[RecommendedCard]


# --- 대출 ---
class LoanStatus(BaseModel):
    id: str
    name: str
    remainingPrincipal: int
    nextPaymentDate: str
    progressPercent: int


class LoanListResult(BaseModel):
    loans: list[LoanStatus]


# --- 증권 ---
class SecuritiesStatusResult(BaseModel):
    opened: bool
    residentType: Literal["resident", "non_resident"]
    requiredDocsIfOpening: list[str]


# --- 해외송금 ---
class RemittanceQuoteRequest(BaseModel):
    toCountry: str
    amountKRW: int


class RemittanceOption(BaseModel):
    fee: int
    etaHours: int


class RemittanceQuoteResult(BaseModel):
    exchangeRate: float
    bankOption: RemittanceOption
    fintechOption: RemittanceOption


# --- 환전 ---
class ExchangeRatesResult(BaseModel):
    base: str
    rates: dict[str, float]


# --- 투자 추천 ---
class InvestRecommendRequest(BaseModel):
    riskLevel: Literal["low", "medium", "high"]


class InvestProduct(BaseModel):
    id: str
    name: str
    expectedReturn: float
    riskGrade: str
    reason: str


class InvestRecommendResult(BaseModel):
    products: list[InvestProduct]
