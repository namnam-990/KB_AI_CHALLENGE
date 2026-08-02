// 실제로는 FastAPI의 GET /agents/exit-planner 응답으로 교체될 목업 데이터입니다.
// TODO(backend): 아래 전체를 실제 계좌 거래내역 분석 + 정산 계산 결과로 교체

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
  // TODO(backend): await fetch(`${API_BASE}/agents/exit-planner`)
  await new Promise((r) => setTimeout(r, 400))

  return {
    departureDateLabel: "2027년 9월 30일",
    daysRemaining: 424,
    estimatedGrandTotalLabel: "약 3,570만원",
    estimateRangeNote: "변동 소득·지출 패턴을 반영하면 약 3,360만원 ~ 3,780만원 사이로 예상돼요",

    cashflow: {
      periodLabel: "최근 6개월 입출금 내역 기준",
      incomeItems: [
        { id: "salary", label: "급여", amountLabel: "월 245만원", variability: "fixed" },
        { id: "side-income", label: "초과근무·부수입", amountLabel: "월 평균 18만원", variability: "variable" },
      ],
      expenseItems: [
        { id: "rent", label: "월세", amountLabel: "월 45만원", variability: "fixed" },
        { id: "telecom", label: "통신비", amountLabel: "월 5.8만원", variability: "fixed" },
        { id: "insurance", label: "4대보험·개인보험료", amountLabel: "월 12만원", variability: "fixed" },
        { id: "savings-auto-transfer", label: "적금 자동이체", amountLabel: "월 20만원", variability: "fixed" },
        { id: "living-cost", label: "생활비·식비", amountLabel: "월 평균 70만원 (±15만원)", variability: "variable" },
        { id: "remittance", label: "가족 생활비 송금", amountLabel: "월 평균 50만원 (±20만원)", variability: "variable" },
      ],
      monthlyIncomeLabel: "263만원",
      monthlyExpenseLabel: "203만원",
      monthlyNetSavingsLabel: "약 60만원",
      aiNote:
        "생활비와 가족 송금은 매달 변동폭이 있어, 이 변동성을 반영해 예상 저축액을 범위로 계산했어요. 급여이체가 꾸준히 유지되고 있어 소득 예측 신뢰도는 높은 편이에요.",
    },

    projection: {
      monthsRemaining: 14,
      currentBalanceLabel: "340만원",
      projectedAdditionalSavingsLabel: "약 840만원",
      additionalSavingsRangeLabel: "변동성 반영 시 630만원 ~ 1,050만원",
      productContributions: [
        {
          id: "installment-savings",
          name: "KB 자유적립적금",
          type: "savings",
          expectedValueLabel: "약 286만원",
          note: "월 20만원 납입 중 · 귀국 예정일에 맞춰 만기 도래",
        },
        {
          id: "cma-bond",
          name: "KB CMA·채권형 상품",
          type: "investment",
          expectedValueLabel: "약 165만원",
          note: "낮은 리스크로 운용 중 · 연 4%대 수익률 가정",
        },
        {
          id: "etf",
          name: "ETF 분산투자",
          type: "investment",
          expectedValueLabel: "약 100만원",
          note: "시장 상황에 따라 평가금액이 달라질 수 있어요",
        },
      ],
      productsSubtotalLabel: "약 551만원",
      projectedTotalLabel: "약 1,730만원",
    },

    settlementItems: [
      {
        id: "e1",
        title: "퇴직금 정산",
        amountLabel: "약 920만원",
        status: "ready",
        agent: "퇴직금 계산 에이전트",
        description: "근속기간과 급여 이력 기반 자동 계산 완료",
      },
      {
        id: "e2",
        title: "출국만기보험금",
        amountLabel: "약 610만원",
        status: "action_needed",
        agent: "보험금 안내 에이전트",
        description: "출국 예정일 확정 후 청구 가능 — 여권 사본 추가 필요",
      },
      {
        id: "e3",
        title: "국민연금 반환일시금",
        amountLabel: "약 280만원",
        status: "action_needed",
        agent: "연금 반환 안내 에이전트",
        description: "본국이 사회보장협정 체결국인지 확인 중",
      },
      {
        id: "e4",
        title: "귀국비용보험금",
        amountLabel: "약 30만원",
        status: "not_started",
        agent: "보험금 안내 에이전트",
        description: "출국 30일 전부터 신청 가능",
      },
      {
        id: "e5",
        title: "잔여 자산 해외 반출",
        amountLabel: "위 예상 자산에 포함",
        status: "not_started",
        agent: "자산 반출 안내 에이전트",
        description: "출국 전 해외송금 한도·서류를 미리 확인하세요 (금액은 위 예상 자산 항목에 이미 포함됨)",
      },
    ],
    settlementSubtotalLabel: "약 1,840만원",
  }
}
