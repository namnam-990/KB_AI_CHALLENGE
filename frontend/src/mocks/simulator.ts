// FastAPI의 POST /agents/loan-simulator, POST /agents/verification 연동.
// 타입은 백엔드 스키마와 1:1로 맞춰져 있습니다.

import { apiFetch } from "../lib/api"

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

export async function fetchSimulatorResult(productType: "loan" | "card"): Promise<SimulatorResult> {
  return apiFetch<SimulatorResult>("/agents/loan-simulator", {
    method: "POST",
    body: JSON.stringify({ productType }),
  })
}

// 서류 사진/PDF를 업로드하면 Gemini 멀티모달이 직접 이미지를 읽어 필드를 추출·표준화합니다.
export interface DocVerificationResult {
  docType: string
  status: DocStatus
  extractedFields: Record<string, string>
  standardizedDocUrl: string | null
  note?: string | null
}

export async function verifyDocument(file: File, docType: string): Promise<DocVerificationResult> {
  const formData = new FormData()
  formData.append("image", file)
  formData.append("docType", docType)
  return apiFetch<DocVerificationResult>("/agents/verification", {
    method: "POST",
    body: formData,
  })
}
