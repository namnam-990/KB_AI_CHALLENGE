// 실제로는 FastAPI의 GET /agents/exit-planner 응답으로 교체될 목업 데이터입니다.

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
  estimatedTotalLabel: string
  items: ExitItem[]
}

export async function fetchExitPlan(): Promise<ExitPlanResult> {
  // TODO(backend): await fetch(`${API_BASE}/agents/exit-planner`)
  await new Promise((r) => setTimeout(r, 400))

  return {
    estimatedTotalLabel: "약 1,840만원 (추정)",
    items: [
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
        amountLabel: "계좌 잔액 전체",
        status: "not_started",
        agent: "자산 반출 안내 에이전트",
        description: "출국 전 해외송금 한도·서류를 미리 확인하세요",
      },
    ],
  }
}
