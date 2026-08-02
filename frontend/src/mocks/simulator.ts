// 실제로는 FastAPI의 POST /agents/loan-simulator 응답으로 교체될 목업 데이터입니다.
// 백엔드 연동 시 이 파일의 함수 시그니처만 그대로 유지한 채 내부를 fetch 호출로 바꾸면 됩니다.

export type DocStatus = "complete" | "missing" | "processing"

export interface RequiredDoc {
  id: string
  label: string
  status: DocStatus
  hint: string
  optional?: boolean
  aiFeedback?: string // 서류별 인라인 AI 피드백 (1~3줄)
}

export interface SimulatorResult {
  productName: string
  approvalScore: number // 0-100
  approvalLabel: string
  altCreditScore: number // 0-100, 대안 신용평가 점수
  requiredDocs: RequiredDoc[]
  nextAction: string
  creditScoreTip: string // 하단 종합 AI 피드백: 신용점수를 올리기 좋은 전략
  loanOffers?: LoanOffer[] // productType === "loan"일 때만
  cardInsight?: CardInsight // productType === "card"일 때만
}

export type OfferTier = "recommended" | "eligible" | "conditional"

export interface LoanOffer {
  id: string
  productName: string
  interestRate: string
  maxAmount: string
  tier: OfferTier
  note: string
}

export interface CardInsight {
  approvalLikelihoodLabel: string
  approvalLikelihoodPercent: number // 0-100
  recommendedLimit: string
  limitRange: string
  note: string
}

export const offerTierMeta: Record<OfferTier, string> = {
  recommended: "추천",
  eligible: "가능",
  conditional: "조건부 가능",
}

// 대안 신용평가 점수(altCreditScore)를 기준으로 한 대출 상품 추천 목업.
// TODO(backend): 실제 상품 카탈로그 + 신용점수 기반 매칭 로직으로 교체
function buildMockLoanOffers(creditScore: number): LoanOffer[] {
  if (creditScore >= 70) {
    return [
      {
        id: "jeonse",
        productName: "KB 외국인 전세자금대출",
        interestRate: "3.8% ~ 5.2%",
        maxAmount: "최대 2억원",
        tier: "recommended",
        note: "현재 신용점수 기준 가장 낮은 금리로 이용할 수 있어요.",
      },
      {
        id: "saehope",
        productName: "KB 새희망홀씨 대출 (외국인 특례)",
        interestRate: "4.5% ~ 6.8%",
        maxAmount: "최대 3,000만원",
        tier: "eligible",
        note: "소액 신용대출이 필요할 때 적합해요.",
      },
      {
        id: "saeitdol",
        productName: "KB 사잇돌 중금리대출",
        interestRate: "6.9% ~ 9.5%",
        maxAmount: "최대 2,000만원",
        tier: "eligible",
        note: "한도는 낮지만 서류 심사가 간단해요.",
      },
    ]
  }

  if (creditScore >= 45) {
    return [
      {
        id: "saehope",
        productName: "KB 새희망홀씨 대출 (외국인 특례)",
        interestRate: "5.5% ~ 7.2%",
        maxAmount: "최대 2,000만원",
        tier: "recommended",
        note: "현재 신용점수 기준 가장 추천되는 상품이에요.",
      },
      {
        id: "jeonse",
        productName: "KB 외국인 전세자금대출",
        interestRate: "5.8% ~ 7.5%",
        maxAmount: "최대 1억원",
        tier: "conditional",
        note: "서울보증보험 가입을 완료하면 이용할 수 있어요.",
      },
      {
        id: "saeitdol",
        productName: "KB 사잇돌 중금리대출",
        interestRate: "7.5% ~ 10.9%",
        maxAmount: "최대 1,500만원",
        tier: "eligible",
        note: "한도는 낮지만 서류 심사가 간단해요.",
      },
    ]
  }

  return [
    {
      id: "saeitdol",
      productName: "KB 사잇돌 중금리대출",
      interestRate: "9.5% ~ 13.9%",
      maxAmount: "최대 1,000만원",
      tier: "recommended",
      note: "현재 신용점수로 이용 가능한 상품이에요.",
    },
    {
      id: "saehope",
      productName: "KB 새희망홀씨 대출 (외국인 특례)",
      interestRate: "7.8% ~ 9.9%",
      maxAmount: "최대 1,000만원",
      tier: "conditional",
      note: "신용점수를 조금 더 올리면 한도가 늘어날 수 있어요.",
    },
    {
      id: "jeonse",
      productName: "KB 외국인 전세자금대출",
      interestRate: "-",
      maxAmount: "-",
      tier: "conditional",
      note: "신용점수 보완 후 재신청하면 이용할 수 있어요.",
    },
  ]
}

// 대안 신용평가 점수(altCreditScore)를 기준으로 한 카드 승인 가능성/한도 목업.
// TODO(backend): 실제 카드 심사 모델 결과로 교체
function buildMockCardInsight(creditScore: number): CardInsight {
  if (creditScore >= 70) {
    return {
      approvalLikelihoodLabel: "승인 가능성 매우 높음",
      approvalLikelihoodPercent: 90,
      recommendedLimit: "300만원",
      limitRange: "250만원 ~ 350만원",
      note: "우량 등급으로 발급 후 한도 상향 신청도 가능해요.",
    }
  }

  if (creditScore >= 45) {
    return {
      approvalLikelihoodLabel: "승인 가능성 보통",
      approvalLikelihoodPercent: 65,
      recommendedLimit: "150만원",
      limitRange: "100만원 ~ 200만원",
      note: "4대보험 가입확인서를 추가하면 한도가 올라갈 수 있어요.",
    }
  }

  return {
    approvalLikelihoodLabel: "승인 가능성 낮음",
    approvalLikelihoodPercent: 30,
    recommendedLimit: "50만원",
    limitRange: "30만원 ~ 70만원",
    note: "체크카드로 먼저 거래 이력을 쌓으면 신용카드 전환에 유리해요.",
  }
}

// 서류를 새로 업로드했을 때 붙는 인라인 피드백 목업. 실제로는 OCR/검증 에이전트 응답으로 대체됩니다.
// TODO(backend): run_verification 응답의 검증 결과 텍스트로 교체
const MOCK_DOC_FEEDBACK: Record<string, string> = {
  "income-proof": "3개월치 중 2개월만 인식됐어요. 최근 1개월분을 추가해주세요.",
  "health-insurance-cert": "자격득실확인서의 일련번호가 인식되지 않았어요. 더 선명한 사진으로 다시 업로드해주세요.",
  "four-major-insurance-cert": "원천징수영수증의 소득 항목이 흐릿하게 인식됐어요. 원본 스캔 파일로 다시 업로드해주세요.",
  "insurance-payment-cert": "최근 납부월이 인식되지 않았어요. 최신 발급분으로 다시 업로드해주세요.",
}

export function getMockDocFeedback(docId: string): string | undefined {
  return MOCK_DOC_FEEDBACK[docId]
}

export async function fetchSimulatorResult(productType: "loan" | "card"): Promise<SimulatorResult> {
  // TODO(backend): await fetch(`${API_BASE}/agents/loan-simulator`, { method: "POST", body: JSON.stringify({ productType }) })
  await new Promise((r) => setTimeout(r, 400))

  if (productType === "loan") {
    const altCreditScore = 68
    return {
      productName: "외국인 전세자금대출",
      approvalScore: 72,
      approvalLabel: "승인 가능성 높음",
      altCreditScore,
      loanOffers: buildMockLoanOffers(altCreditScore),
      requiredDocs: [
        { id: "alien-registration", label: "외국인 등록증", status: "complete", hint: "온보딩 시 인증 완료" },
        {
          id: "income-proof",
          label: "소득증빙서류",
          status: "processing",
          hint: "소득금액증명원 또는 재직증명서 + 최근 3개월 급여명세서 · OCR 인식 중",
          aiFeedback: MOCK_DOC_FEEDBACK["income-proof"],
        },
        {
          id: "health-insurance-cert",
          label: "국민건강보험공단 자격득실확인서",
          status: "missing",
          hint: "사진 또는 PDF로 업로드해주세요",
        },
        { id: "insurance-payment-cert", label: "보험료 납부 확인서", status: "missing", hint: "사진 또는 PDF로 업로드해주세요" },
        { id: "salary-account-history", label: "급여통장거래내역서", status: "missing", hint: "사진 또는 PDF로 업로드해주세요" },
      ],
      nextAction: "국민건강보험공단 자격득실확인서와 보험료 납부 확인서를 업로드하면 심사가 이어져요.",
      creditScoreTip:
        "급여통장거래내역서를 먼저 제출하면 대안 신용점수가 가장 크게 올라가요. 국민건강보험공단 자격득실확인서는 발급 즉시 자동 인식되니 나중에 보완해도 괜찮아요.",
    }
  }

  const altCreditScore = 61
  return {
    productName: "KB 외국인 체크·신용카드",
    approvalScore: 54,
    approvalLabel: "신용카드는 보완 필요",
    altCreditScore,
    cardInsight: buildMockCardInsight(altCreditScore),
    requiredDocs: [
      { id: "alien-registration", label: "외국인 등록증", status: "complete", hint: "온보딩 시 인증 완료" },
      {
        id: "income-proof",
        label: "소득증빙서류",
        status: "processing",
        hint: "소득금액증명원 또는 재직증명서 + 최근 3개월 급여명세서 · OCR 인식 중",
        aiFeedback: MOCK_DOC_FEEDBACK["income-proof"],
      },
      {
        id: "four-major-insurance-cert",
        label: "4대보험 가입확인서 또는 원천징수영수증",
        status: "missing",
        hint: "사진 또는 PDF로 업로드해주세요",
      },
      {
        id: "main-bank-history",
        label: "주거래은행 6개월 이상 거래내역",
        status: "missing",
        hint: "선택 서류 · 업로드하면 심사에 유리해요",
        optional: true,
      },
      {
        id: "residence-proof",
        label: "부동산 계약서 · 공과금 납부내역",
        status: "missing",
        hint: "선택 서류 · 거주 안정성 보조자료",
        optional: true,
      },
    ],
    nextAction: "4대보험 가입확인서를 업로드하면 신용카드 승인 가능성이 올라가요.",
    creditScoreTip:
      "4대보험 가입확인서 업로드가 신용점수를 올리는 데 가장 효과적이에요. 주거래은행 거래내역까지 추가하면 심사에 더 유리해요.",
  }
}
