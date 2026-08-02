// FastAPI의 GET /agents/exit-planner 연동.

import { apiFetch } from "../lib/api"

export type Variability = "fixed" | "variable"

export interface CashflowEntry {
  id: string
  label: string
  amountLabel: string
  variability: Variability
}

export interface CashflowAnalysis {
  periodLabel: string
  incomeItems: CashflowEntry[]
  expenseItems: CashflowEntry[]
  monthlyIncomeLabel: string
  monthlyExpenseLabel: string
  monthlyNetSavingsLabel: string
  aiNote: string
}

export type ProductType = "savings" | "investment"

export interface ProductContribution {
  id: string
  name: string
  type: ProductType
  expectedValueLabel: string
  note: string
}

export interface AssetProjection {
  monthsRemaining: number
  currentBalanceLabel: string
  projectedAdditionalSavingsLabel: string
  additionalSavingsRangeLabel: string
  productContributions: ProductContribution[]
  productsSubtotalLabel: string
  projectedTotalLabel: string
}

export type ExitItemStatus = "ready" | "action_needed" | "not_started"

export interface ExitItem {
  id: string
  title: string
  amountLabel: string
  status: ExitItemStatus
  agent: string
  description: string
}

export interface ExitPlanResult {
  departureDateLabel: string
  daysRemaining: number
  estimatedGrandTotalLabel: string
  estimateRangeNote: string
  cashflow: CashflowAnalysis
  projection: AssetProjection
  settlementItems: ExitItem[]
  settlementSubtotalLabel: string
}

export const productTypeMeta: Record<ProductType, string> = {
  savings: "예·적금",
  investment: "투자",
}

export async function fetchExitPlan(): Promise<ExitPlanResult> {
  return apiFetch<ExitPlanResult>("/agents/exit-planner")
}
