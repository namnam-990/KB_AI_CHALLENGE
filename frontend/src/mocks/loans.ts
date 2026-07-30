// 실제로는 FastAPI의 GET /loans/status 응답으로 교체될 목업 데이터입니다.

export interface LoanStatus {
  hasActiveLoan: boolean
  productName?: string
  remainingPrincipalLabel?: string
  nextPaymentDateLabel?: string
  nextPaymentAmountLabel?: string
  progressPercent?: number
}

export async function fetchLoanStatus(): Promise<LoanStatus> {
  // TODO(backend): await fetch(`${API_BASE}/loans/status`)
  await new Promise((r) => setTimeout(r, 400))

  return {
    hasActiveLoan: true,
    productName: "KB 외국인 전세자금대출",
    remainingPrincipalLabel: "42,000,000원",
    nextPaymentDateLabel: "2026.08.25",
    nextPaymentAmountLabel: "186,400원",
    progressPercent: 34,
  }
}
