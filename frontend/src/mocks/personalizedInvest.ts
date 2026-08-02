// FastAPI의 POST /agents/invest-recommend, POST /agents/invest-recommend/survey 연동.
// 국적은 로드맵 설문에서 이미 받은 값을 백엔드가 내부적으로 재사용합니다 (프론트에서 별도 전달 안 함).

import { apiFetch } from "../lib/api"

// --- 투자성향 진단 설문 (6문항) ---

export type InvestPurpose = "safe" | "moderate" | "aggressive" | "unsure"
export type InvestHorizon = "short" | "mid" | "long"
export type LossTolerance = "low" | "mid" | "high"
export type InvestExperience = "home-stock" | "home-commodity" | "kr-invest" | "none"
export type LiquidityNeed = "not-needed" | "maybe" | "needed-soon"
export type MonthlyBudget = "u5" | "5to20" | "20to50" | "over50"

export interface InvestSurveyAnswers {
  purposes: InvestPurpose[]
  horizon: InvestHorizon
  lossTolerance: LossTolerance
  experiences: InvestExperience[]
  liquidityNeed: LiquidityNeed
  monthlyBudget: MonthlyBudget
}

export const PURPOSE_OPTIONS: { code: InvestPurpose; label: string }[] = [
  { code: "safe", label: "목돈을 안전하게 지키고 싶어요" },
  { code: "moderate", label: "예금보다 조금 더 높은 수익을 원해요" },
  { code: "aggressive", label: "적극적으로 자산을 불리고 싶어요" },
  { code: "unsure", label: "아직 잘 모르겠어요" },
]

export const HORIZON_OPTIONS: { code: InvestHorizon; label: string }[] = [
  { code: "short", label: "6개월 이내 (곧 필요한 돈)" },
  { code: "mid", label: "6개월 ~ 2년" },
  { code: "long", label: "2년 이상" },
]

export const LOSS_TOLERANCE_OPTIONS: { code: LossTolerance; label: string }[] = [
  { code: "low", label: "조금이라도 떨어지면 불안해서 바로 팔 것 같아요" },
  { code: "mid", label: "10% 정도까지는 버틸 수 있어요" },
  { code: "high", label: "20% 이상 떨어져도 장기적으로 보고 기다릴 수 있어요" },
]

export const EXPERIENCE_OPTIONS: { code: InvestExperience; label: string }[] = [
  { code: "home-stock", label: "본국에서 주식/펀드 투자 경험 있음" },
  { code: "home-commodity", label: "본국에서 금/현물 투자 경험 있음" },
  { code: "kr-invest", label: "한국에서 투자 경험 있음" },
  { code: "none", label: "투자 경험 전혀 없음" },
]

export const LIQUIDITY_OPTIONS: { code: LiquidityNeed; label: string }[] = [
  { code: "not-needed", label: "네, 당장 안 써도 되는 여윳돈이에요" },
  { code: "maybe", label: "상황에 따라 필요할 수도 있어요" },
  { code: "needed-soon", label: "곧 써야 할 돈이라 유동성이 중요해요" },
]

export const MONTHLY_BUDGET_OPTIONS: { code: MonthlyBudget; label: string }[] = [
  { code: "u5", label: "5만원 이하" },
  { code: "5to20", label: "5~20만원" },
  { code: "20to50", label: "20~50만원" },
  { code: "over50", label: "50만원 이상" },
]

const SURVEY_STORAGE_KEY = "kb_invest_survey_answers"

export function getSavedInvestSurvey(): InvestSurveyAnswers | null {
  try {
    const raw = localStorage.getItem(SURVEY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as InvestSurveyAnswers) : null
  } catch {
    return null
  }
}

export function clearInvestSurvey(): void {
  localStorage.removeItem(SURVEY_STORAGE_KEY)
}

export async function submitInvestSurvey(answers: InvestSurveyAnswers): Promise<void> {
  await apiFetch<{ received: boolean }>("/agents/invest-recommend/survey", {
    method: "POST",
    body: JSON.stringify(answers),
  })
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(answers))
}

// --- 추천 결과 ---

export type RiskTier = "conservative" | "moderate" | "aggressive"

export interface RecommendedProduct {
  id: string
  name: string
  expectedReturnLabel: string
  riskBadge: "안전" | "중위험" | "고위험"
  note: string
}

export interface RecommendationCategory {
  id: "savings" | "bond" | "gold" | "tech-stock" | "fund"
  title: string
  allocationPercent: number
  reason: string
  products: RecommendedProduct[]
}

export interface PersonalizedInvestResult {
  nationality: string
  nationalityIsFallback: boolean
  nationalityInsight: string
  riskTier: RiskTier
  riskTierLabel: string
  riskTierSummary: string
  monthlyBudgetLabel: string
  categories: RecommendationCategory[]
  portfolioNote: string
}

export async function fetchPersonalizedInvestResult(
  answers: InvestSurveyAnswers,
): Promise<PersonalizedInvestResult> {
  return apiFetch<PersonalizedInvestResult>("/agents/invest-recommend", {
    method: "POST",
    body: JSON.stringify(answers),
  })
}
