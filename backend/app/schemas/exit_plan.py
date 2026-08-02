from typing import Literal

from pydantic import BaseModel


class CashflowEntry(BaseModel):
    id: str
    label: str
    amountLabel: str
    variability: Literal["fixed", "variable"]


class CashflowAnalysis(BaseModel):
    periodLabel: str
    incomeItems: list[CashflowEntry]
    expenseItems: list[CashflowEntry]
    monthlyIncomeLabel: str
    monthlyExpenseLabel: str
    monthlyNetSavingsLabel: str
    aiNote: str


class ProductContribution(BaseModel):
    id: str
    name: str
    type: Literal["savings", "investment"]
    expectedValueLabel: str
    note: str


class AssetProjection(BaseModel):
    monthsRemaining: int
    currentBalanceLabel: str
    projectedAdditionalSavingsLabel: str
    additionalSavingsRangeLabel: str
    productContributions: list[ProductContribution]
    productsSubtotalLabel: str
    projectedTotalLabel: str


class ExitItem(BaseModel):
    id: str
    title: str
    amountLabel: str
    status: Literal["ready", "action_needed", "not_started"]
    agent: str
    description: str


class ExitPlanResult(BaseModel):
    departureDateLabel: str
    daysRemaining: int
    estimatedGrandTotalLabel: str
    estimateRangeNote: str
    cashflow: CashflowAnalysis
    projection: AssetProjection
    settlementItems: list[ExitItem]
    settlementSubtotalLabel: str
