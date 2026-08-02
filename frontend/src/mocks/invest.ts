// 실제로는 FastAPI의 투자성향 진단/상품추천 에이전트 응답으로 교체될 목업 데이터입니다.

export type RiskLevel = "low" | "medium" | "high"

export interface InvestProduct {
  id: string
  name: string
  expectedReturnLabel: string
  riskBadge: string
  reason: string
}

export async function fetchInvestRecommendations(risk: RiskLevel): Promise<InvestProduct[]> {
  // TODO(backend): await fetch(`${API_BASE}/invest/recommend`, { method: "POST", body: JSON.stringify({ riskLevel: risk }) })
  // 주의: `/agents/invest-recommend`는 국적+설문 기반 "맞춤형 투자 추천"(personalizedInvest.ts) 전용 엔드포인트라 이 페이지와는 다름
  await new Promise((r) => setTimeout(r, 500))

  if (risk === "low") {
    return [
      {
        id: "i1",
        name: "KB 국고채 3년 펀드",
        expectedReturnLabel: "연 3.2%",
        riskBadge: "위험 1등급 (매우 낮음)",
        reason: "원금 안정성이 중요한 단기 체류자에게 적합해요",
      },
      {
        id: "i2",
        name: "KB 머니마켓 파킹형 펀드",
        expectedReturnLabel: "연 2.9%",
        riskBadge: "위험 1등급 (매우 낮음)",
        reason: "언제든 출금 가능해 비상자금 운용에 적합해요",
      },
    ]
  }

  if (risk === "medium") {
    return [
      {
        id: "i3",
        name: "KB 글로벌 채권혼합 펀드",
        expectedReturnLabel: "연 5.1%",
        riskBadge: "위험 3등급 (보통)",
        reason: "채권과 우량주에 나눠 담아 변동성을 낮췄어요",
      },
      {
        id: "i4",
        name: "KB 배당중심 주식혼합 펀드",
        expectedReturnLabel: "연 6.4%",
        riskBadge: "위험 3등급 (보통)",
        reason: "귀국 전까지 여유자금을 굴리기 좋은 상품이에요",
      },
    ]
  }

  return [
    {
      id: "i5",
      name: "KB 글로벌 성장주 펀드",
      expectedReturnLabel: "연 9.8%",
      riskBadge: "위험 5등급 (높음)",
      reason: "장기 체류 예정이라면 변동성을 감내하고 성장을 노려볼 수 있어요",
    },
    {
      id: "i6",
      name: "KB 신흥국 주식형 펀드",
      expectedReturnLabel: "연 11.2%",
      riskBadge: "위험 5등급 (높음)",
      reason: "본국 시장과 연계된 신흥국 펀드로 분산 투자 효과가 있어요",
    },
  ]
}
