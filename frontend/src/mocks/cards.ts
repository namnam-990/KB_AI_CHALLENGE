// 실제로는 FastAPI의 GET /cards 응답으로 교체될 목업 데이터입니다.

export interface OwnedCard {
  id: string
  name: string
  type: "check" | "credit"
  lastUsedLabel: string
}

export interface RecommendedCard {
  id: string
  name: string
  benefit: string
  eligibleLabel: string
}

export interface CardsResult {
  ownedCards: OwnedCard[]
  monthlySpendLabel: string
  monthlyTopCategory: string
  recommendations: RecommendedCard[]
}

export async function fetchCards(): Promise<CardsResult> {
  // TODO(backend): await fetch(`${API_BASE}/cards`)
  await new Promise((r) => setTimeout(r, 400))

  return {
    ownedCards: [{ id: "c1", name: "KB 외국인 체크카드", type: "check", lastUsedLabel: "오늘 12:40 사용" }],
    monthlySpendLabel: "428,900원",
    monthlyTopCategory: "생활/마트 (41%)",
    recommendations: [
      {
        id: "r1",
        name: "KB 국민 헤이영 카드",
        benefit: "편의점·통신비 10% 할인",
        eligibleLabel: "승인 시뮬레이터 기준 보완 필요 (신용점수 개선 후 재시도 추천)",
      },
      {
        id: "r2",
        name: "KB 외국인 전용 체크카드 Plus",
        benefit: "해외송금 수수료 월 1회 면제",
        eligibleLabel: "즉시 신청 가능",
      },
    ],
  }
}
