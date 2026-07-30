// 실제로는 FastAPI의 GET /agents/visa-roadmap 응답으로 교체될 목업 데이터입니다.

export type MilestoneStatus = "done" | "current" | "upcoming"

export interface Milestone {
  id: string
  monthLabel: string
  title: string
  description: string
  status: MilestoneStatus
}

export interface RoadmapResult {
  visaType: string
  monthsRemaining: number
  milestones: Milestone[]
}

export async function fetchRoadmap(): Promise<RoadmapResult> {
  // TODO(backend): await fetch(`${API_BASE}/agents/visa-roadmap?visaType=E-9`)
  await new Promise((r) => setTimeout(r, 400))

  return {
    visaType: "E-9 (비전문취업)",
    monthsRemaining: 14,
    milestones: [
      {
        id: "m1",
        monthLabel: "완료",
        title: "주택청약종합저축 가입",
        description: "민영주택 가점을 위해 이미 가입 완료",
        status: "done",
      },
      {
        id: "m2",
        monthLabel: "지금",
        title: "급여이체 이력 쌓기",
        description: "대안 신용평가 점수에 반영되어 대출·카드 승인에 도움",
        status: "current",
      },
      {
        id: "m3",
        monthLabel: "3개월 후",
        title: "거래외국환은행 지정",
        description: "해외송금 한도 상향을 위해 서류 사전 준비 필요",
        status: "upcoming",
      },
      {
        id: "m4",
        monthLabel: "8개월 후",
        title: "비자 연장 서류 준비",
        description: "재직증명서·소득증빙 미리 표준화해두면 지점 방문 1회로 단축",
        status: "upcoming",
      },
      {
        id: "m5",
        monthLabel: "14개월 후 (만료)",
        title: "귀국 정산 플래너 확인",
        description: "퇴직금·연금 반환일시금 절차를 미리 확인하세요",
        status: "upcoming",
      },
    ],
  }
}
