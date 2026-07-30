// 실제로는 FastAPI의 예·적금 상품/목표추천 에이전트 응답으로 교체될 목업 데이터입니다.

export interface DepositProduct {
  id: string
  name: string
  maturityLabel: string
  currentAmountLabel: string
  progressPercent: number
}

export interface GoalRecommendation {
  goalLabel: string
  productName: string
  monthlyAmountLabel: string
  expectedRateLabel: string
}

export interface DepositsResult {
  products: DepositProduct[]
  recommendation: GoalRecommendation
}

export async function fetchDeposits(): Promise<DepositsResult> {
  // TODO(backend): await fetch(`${API_BASE}/deposits`)
  await new Promise((r) => setTimeout(r, 400))

  return {
    products: [
      {
        id: "d1",
        name: "KB 국민 첫재테크 적금",
        maturityLabel: "2027.03.15 만기",
        currentAmountLabel: "3,120,000원",
        progressPercent: 62,
      },
      {
        id: "d2",
        name: "KB 외국인 우대 정기예금",
        maturityLabel: "2026.11.02 만기",
        currentAmountLabel: "5,000,000원",
        progressPercent: 88,
      },
    ],
    recommendation: {
      goalLabel: "3년 뒤 귀국자금 5,000만원 모으기",
      productName: "KB 자유적립식 목돈마련 적금",
      monthlyAmountLabel: "월 1,320,000원 납입 시 달성 가능",
      expectedRateLabel: "연 3.8% (우대금리 적용 시)",
    },
  }
}

export async function fetchGoalRecommendation(goalAmountManwon: number, months: number): Promise<GoalRecommendation> {
  // TODO(backend): await fetch(`${API_BASE}/agents/deposit-goal`, { method: "POST", body: JSON.stringify({ goalAmountManwon, months }) })
  await new Promise((r) => setTimeout(r, 500))

  const safeMonths = months > 0 ? months : 1
  const monthly = Math.round((goalAmountManwon * 10000) / safeMonths)

  return {
    goalLabel: `${safeMonths}개월 뒤 ${goalAmountManwon.toLocaleString()}만원 모으기`,
    productName: "KB 자유적립식 목돈마련 적금",
    monthlyAmountLabel: `월 ${monthly.toLocaleString()}원 납입 시 달성 가능`,
    expectedRateLabel: "연 3.8% (우대금리 적용 시)",
  }
}
