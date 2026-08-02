// 실제로는 FastAPI의 POST /agents/invest-recommend 응답으로 교체될 목업 데이터입니다.
// TODO(backend): 국적/설문 기반 스코어링과 상품 매칭을 실제 AI 에이전트 로직으로 교체

import { getSavedRoadmapSurvey } from "./roadmap"

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

const MONTHLY_BUDGET_LABEL: Record<MonthlyBudget, string> = {
  u5: "5만원 이하",
  "5to20": "5~20만원",
  "20to50": "20~50만원",
  over50: "50만원 이상",
}

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
  // TODO(backend): await fetch(`${API_BASE}/agents/invest-recommend/survey`, { method: "POST", body: JSON.stringify(answers) })
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(answers))
  await new Promise((r) => setTimeout(r, 300))
}

// --- 국적별 투자성향 (AI 분석 목업) ---
// TODO(backend): 실제 국가별 투자성향 통계/리서치 데이터로 교체. 지금은 시연을 위한 가상의 목업 데이터입니다.

type CategoryTag = "savings" | "bond" | "gold" | "tech-stock" | "fund"

interface NationalityTendency {
  tag: CategoryTag
  tagLabel: string
  summaryNote: string
  categoryNote: string
}

const NATIONALITY_TENDENCY: Record<string, NationalityTendency> = {
  베트남: {
    tag: "tech-stock",
    tagLabel: "국내 테크주·ETF",
    summaryNote: "베트남 국적 투자자는 자국 증시에서도 IT·반도체 등 기술 섹터 선호도가 높은 편으로 분석돼요.",
    categoryNote: "베트남 투자자 특성상 성장성 높은 기술주에 대한 관심이 높아 비중을 조금 더 실었어요.",
  },
  중국: {
    tag: "tech-stock",
    tagLabel: "국내 테크주·ETF",
    summaryNote: "중국 국적 투자자는 대형 플랫폼·기술 기업 투자 경험이 많아 기술주 선호도가 높은 편이에요.",
    categoryNote: "익숙한 기술 섹터 투자 경험을 살릴 수 있도록 비중을 조금 더 실었어요.",
  },
  태국: {
    tag: "gold",
    tagLabel: "금 현물·ETF",
    summaryNote: "태국은 금 현물 투자 문화가 뿌리 깊어, 금 관련 자산 선호도가 높은 편으로 분석돼요.",
    categoryNote: "금 현물에 대한 익숙함을 고려해 금 ETF 비중을 조금 더 실었어요.",
  },
  우즈베키스탄: {
    tag: "gold",
    tagLabel: "금 현물·ETF",
    summaryNote: "우즈베키스탄은 전통적으로 금 보유 선호도가 높은 국가로 분석돼요.",
    categoryNote: "금 보유 선호 문화를 반영해 금 ETF 비중을 조금 더 실었어요.",
  },
  필리핀: {
    tag: "fund",
    tagLabel: "분산 펀드",
    summaryNote: "필리핀 국적 투자자는 해외근로자 송금과 연계된 정기 적립식 펀드 투자 선호도가 높은 편이에요.",
    categoryNote: "정기 적립식 투자에 대한 선호를 반영해 분산 펀드 비중을 조금 더 실었어요.",
  },
  캄보디아: {
    tag: "bond",
    tagLabel: "채권형 상품",
    summaryNote: "캄보디아 국적 투자자는 원금 안정성을 중시하는 채권형 자산 선호도가 높은 편으로 분석돼요.",
    categoryNote: "안정성을 중시하는 성향을 반영해 채권형 비중을 조금 더 실었어요.",
  },
  네팔: {
    tag: "gold",
    tagLabel: "금 현물·ETF",
    summaryNote: "네팔은 전통적으로 금을 자산 저장 수단으로 선호하는 문화가 강한 편이에요.",
    categoryNote: "금 선호 문화를 반영해 금 ETF 비중을 조금 더 실었어요.",
  },
  인도네시아: {
    tag: "tech-stock",
    tagLabel: "국내 테크주·ETF",
    summaryNote: "인도네시아 국적 투자자는 신흥 테크 산업에 대한 투자 관심이 늘고 있는 것으로 분석돼요.",
    categoryNote: "성장 산업에 대한 관심을 반영해 기술주·ETF 비중을 조금 더 실었어요.",
  },
  미얀마: {
    tag: "bond",
    tagLabel: "채권형 상품",
    summaryNote: "미얀마 국적 투자자는 안정적인 자산 운용을 선호하는 경향이 있는 것으로 분석돼요.",
    categoryNote: "안정 자산 선호 경향을 반영해 채권형 비중을 조금 더 실었어요.",
  },
  스리랑카: {
    tag: "bond",
    tagLabel: "채권형 상품",
    summaryNote: "스리랑카 국적 투자자는 원금 보전을 중시하는 경향이 있는 것으로 분석돼요.",
    categoryNote: "원금 보전을 중시하는 경향을 반영해 채권형 비중을 조금 더 실었어요.",
  },
  몽골: {
    tag: "gold",
    tagLabel: "금 현물·ETF",
    summaryNote: "몽골은 자원·현물 자산에 대한 이해도가 높아 금 관련 자산 선호도가 높은 편이에요.",
    categoryNote: "현물 자산에 대한 이해도를 반영해 금 ETF 비중을 조금 더 실었어요.",
  },
  파키스탄: {
    tag: "gold",
    tagLabel: "금 현물·ETF",
    summaryNote: "파키스탄은 전통적으로 금을 안전자산으로 선호하는 경향이 강한 편이에요.",
    categoryNote: "금 선호 경향을 반영해 금 ETF 비중을 조금 더 실었어요.",
  },
  방글라데시: {
    tag: "fund",
    tagLabel: "분산 펀드",
    summaryNote: "방글라데시 국적 투자자는 정기 적립을 통한 분산 투자 선호도가 높은 편으로 분석돼요.",
    categoryNote: "정기 적립 선호를 반영해 분산 펀드 비중을 조금 더 실었어요.",
  },
  키르기스스탄: {
    tag: "bond",
    tagLabel: "채권형 상품",
    summaryNote: "키르기스스탄 국적 투자자는 안정적인 자산 운용을 선호하는 경향이 있는 것으로 분석돼요.",
    categoryNote: "안정 자산 선호 경향을 반영해 채권형 비중을 조금 더 실었어요.",
  },
  라오스: {
    tag: "bond",
    tagLabel: "채권형 상품",
    summaryNote: "라오스 국적 투자자는 원금 안정성을 중시하는 경향이 있는 것으로 분석돼요.",
    categoryNote: "원금 안정성을 중시하는 경향을 반영해 채권형 비중을 조금 더 실었어요.",
  },
  동티모르: {
    tag: "bond",
    tagLabel: "채권형 상품",
    summaryNote: "동티모르 국적 투자자는 안정적인 자산 운용을 선호하는 경향이 있는 것으로 분석돼요.",
    categoryNote: "안정 자산 선호 경향을 반영해 채권형 비중을 조금 더 실었어요.",
  },
}

const DEFAULT_TENDENCY: NationalityTendency = {
  tag: "fund",
  tagLabel: "분산 펀드",
  summaryNote: "국적별 투자성향 데이터가 충분하지 않아, 우선 균형 잡힌 분산 포트폴리오를 기준으로 분석했어요.",
  categoryNote: "데이터가 쌓이기 전까지는 특정 자산에 치우치지 않도록 분산 펀드 비중을 조금 더 실었어요.",
}

function getUserNationality(): { nationality: string; isFallback: boolean } {
  const saved = getSavedRoadmapSurvey()
  if (saved?.nationality) return { nationality: saved.nationality, isFallback: false }
  return { nationality: "베트남", isFallback: true }
}

// --- 설문 기반 위험성향 스코어링 ---

const PURPOSE_SCORE: Record<InvestPurpose, number> = { safe: 10, moderate: 50, aggressive: 90, unsure: 40 }
const HORIZON_SCORE: Record<InvestHorizon, number> = { short: 10, mid: 50, long: 90 }
const LOSS_SCORE: Record<LossTolerance, number> = { low: 10, mid: 50, high: 90 }
const LIQUIDITY_SCORE: Record<LiquidityNeed, number> = { "needed-soon": 10, maybe: 50, "not-needed": 90 }

export type RiskTier = "conservative" | "moderate" | "aggressive"

const RISK_TIER_LABEL: Record<RiskTier, string> = {
  conservative: "안정추구형",
  moderate: "위험중립형",
  aggressive: "적극투자형",
}

const RISK_TIER_SUMMARY: Record<RiskTier, string> = {
  conservative: "손실에 대한 불안감이 크고 투자 가능 기간도 짧은 편이라, 원금을 지키는 안전자산 위주로 추천해요.",
  moderate: "예금보다 조금 더 높은 수익을 원하면서 어느 정도 손실은 감내할 수 있는 균형 잡힌 성향이에요.",
  aggressive: "투자 가능 기간이 길고 손실도 충분히 감내할 수 있어, 성장성 높은 자산 비중을 높여 추천해요.",
}

function scoreRisk(a: InvestSurveyAnswers): number {
  const purposeAvg = a.purposes.length
    ? a.purposes.reduce((sum, p) => sum + PURPOSE_SCORE[p], 0) / a.purposes.length
    : 40
  const weighted =
    LOSS_SCORE[a.lossTolerance] * 0.35 +
    HORIZON_SCORE[a.horizon] * 0.25 +
    purposeAvg * 0.2 +
    LIQUIDITY_SCORE[a.liquidityNeed] * 0.2
  return Math.round(weighted)
}

function scoreToTier(score: number): RiskTier {
  if (score < 40) return "conservative"
  if (score < 70) return "moderate"
  return "aggressive"
}

// --- 위험성향별 기본 자산배분 + 국적 성향 보정 ---

const BASE_ALLOCATION: Record<RiskTier, Record<CategoryTag, number>> = {
  conservative: { savings: 55, bond: 30, gold: 5, "tech-stock": 0, fund: 10 },
  moderate: { savings: 30, bond: 25, gold: 10, "tech-stock": 15, fund: 20 },
  aggressive: { savings: 10, bond: 15, gold: 10, "tech-stock": 35, fund: 30 },
}

const NATIONALITY_BOOST = 15

function applyNationalityBoost(
  base: Record<CategoryTag, number>,
  boostTag: CategoryTag,
): Record<CategoryTag, number> {
  const result = { ...base }
  const others = (Object.keys(result) as CategoryTag[]).filter((k) => k !== boostTag)
  const othersTotal = others.reduce((sum, k) => sum + result[k], 0)
  if (othersTotal === 0) return result

  result[boostTag] += NATIONALITY_BOOST
  others.forEach((k) => {
    result[k] = Math.max(0, result[k] - (result[k] / othersTotal) * NATIONALITY_BOOST)
  })
  return result
}

function normalizeAllocation(alloc: Record<CategoryTag, number>): Record<CategoryTag, number> {
  const total = Object.values(alloc).reduce((sum, v) => sum + v, 0)
  const result = {} as Record<CategoryTag, number>
  ;(Object.keys(alloc) as CategoryTag[]).forEach((k) => {
    result[k] = Math.round((alloc[k] / total) * 100)
  })
  return result
}

// --- 카테고리별 추천 상품 카탈로그 ---

export interface RecommendedProduct {
  id: string
  name: string
  expectedReturnLabel: string
  riskBadge: "안전" | "중위험" | "고위험"
  note: string
}

const CATEGORY_TITLE: Record<CategoryTag, string> = {
  savings: "적금",
  bond: "채권형 상품",
  gold: "금·은 현물 ETF",
  "tech-stock": "국내 테크주·ETF",
  fund: "분산 펀드",
}

const CATEGORY_BASE_REASON: Record<CategoryTag, string> = {
  savings: "원금 손실 위험 없이 목돈을 안전하게 모으고 싶다는 응답을 반영했어요.",
  bond: "예금보다 조금 더 높은 수익을 원하면서도 큰 변동성은 피하고 싶은 성향에 적합해요.",
  gold: "인플레이션·환율 변동에 대비해 자산 일부를 실물 가치에 연동된 자산으로 분산하면 좋아요.",
  "tech-stock": "투자 가능 기간과 손실 감내 수준을 고려했을 때 성장성 높은 국내 기술주·ETF가 적합해요.",
  fund: "직접 종목을 고르기보다 분산된 펀드로 자산을 불리고 싶은 성향에 맞아요.",
}

const PRODUCT_CATALOG: Record<CategoryTag, RecommendedProduct[]> = {
  savings: [
    {
      id: "kb-free-savings",
      name: "KB 자유적립적금",
      expectedReturnLabel: "연 3.2%",
      riskBadge: "안전",
      note: "매달 자유롭게 납입 가능 · 원금 보장",
    },
    {
      id: "kb-foreigner-first",
      name: "KB 첫만남 우대적금 (외국인 특화)",
      expectedReturnLabel: "연 3.5% (첫 1년 우대)",
      riskBadge: "안전",
      note: "외국인 근로자 급여이체 시 우대금리 적용",
    },
  ],
  bond: [
    {
      id: "kb-treasury-fund",
      name: "KB 국채안정형 펀드",
      expectedReturnLabel: "연 4.1% (세전, 목표수익률)",
      riskBadge: "중위험",
      note: "국내 국채 중심 편입 · 원금 손실 가능성 낮음",
    },
    {
      id: "kb-highyield-bond",
      name: "KB 하이일드 채권형 펀드",
      expectedReturnLabel: "연 5.5% (세전, 목표수익률)",
      riskBadge: "중위험",
      note: "해외 우량 회사채 편입 · 채권형 대비 변동성 다소 높음",
    },
  ],
  gold: [
    {
      id: "kodex-gold",
      name: "KODEX 골드선물(H) ETF",
      expectedReturnLabel: "최근 1년 +9.8%",
      riskBadge: "중위험",
      note: "달러 약세·인플레이션 헤지 목적으로 많이 활용돼요",
    },
    {
      id: "kodex-silver",
      name: "KODEX 은 선물(H) ETF",
      expectedReturnLabel: "최근 1년 +6.2%",
      riskBadge: "중위험",
      note: "금 대비 변동성은 크지만 상승 여력도 큰 편이에요",
    },
  ],
  "tech-stock": [
    {
      id: "tiger-semicon",
      name: "TIGER 반도체TOP10 ETF",
      expectedReturnLabel: "최근 1년 +18.4%",
      riskBadge: "고위험",
      note: "삼성전자·SK하이닉스 등 국내 대표 반도체 기업 편입",
    },
    {
      id: "kodex-battery",
      name: "KODEX 2차전지산업 ETF",
      expectedReturnLabel: "최근 1년 +11.2%",
      riskBadge: "고위험",
      note: "국내 배터리·소재 기업 중심의 성장 테마",
    },
  ],
  fund: [
    {
      id: "kb-global-growth",
      name: "KB 글로벌 성장주 펀드",
      expectedReturnLabel: "연평균 +7.3%",
      riskBadge: "중위험",
      note: "해외 우량 성장주에 분산 투자",
    },
    {
      id: "kb-dividend",
      name: "KB 배당주 펀드",
      expectedReturnLabel: "연평균 +5.1%",
      riskBadge: "중위험",
      note: "안정적인 배당 수익을 추구하는 국내외 우량주 편입",
    },
  ],
}

export interface RecommendationCategory {
  id: CategoryTag
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

function buildCategoryReason(
  tag: CategoryTag,
  tendency: NationalityTendency,
  answers: InvestSurveyAnswers,
): string {
  const parts = [CATEGORY_BASE_REASON[tag]]
  if (tendency.tag === tag) parts.push(tendency.categoryNote)
  if (tag === "gold" && answers.experiences.includes("home-commodity")) {
    parts.push("본국에서의 금 현물 투자 경험도 함께 반영했어요.")
  }
  if ((tag === "tech-stock" || tag === "fund") && (answers.experiences.includes("home-stock") || answers.experiences.includes("kr-invest"))) {
    parts.push("이미 관련 투자 경험이 있어 비중을 조금 더 실어봤어요.")
  }
  if (tag === "savings" && answers.experiences.includes("none")) {
    parts.push("투자 경험이 아직 없는 점을 고려해 안전자산을 우선했어요.")
  }
  return parts.join(" ")
}

export async function fetchPersonalizedInvestResult(
  answers: InvestSurveyAnswers,
): Promise<PersonalizedInvestResult> {
  // TODO(backend): await fetch(`${API_BASE}/agents/invest-recommend`, { method: "POST", body: JSON.stringify(answers) })
  await new Promise((r) => setTimeout(r, 500))

  const { nationality, isFallback } = getUserNationality()
  const tendency = NATIONALITY_TENDENCY[nationality] ?? DEFAULT_TENDENCY
  const tier = scoreToTier(scoreRisk(answers))
  const allocation = normalizeAllocation(applyNationalityBoost(BASE_ALLOCATION[tier], tendency.tag))

  const categories: RecommendationCategory[] = (Object.keys(allocation) as CategoryTag[])
    .map((tag) => ({ tag, percent: allocation[tag] }))
    .filter((c) => c.percent >= 5)
    .sort((a, b) => b.percent - a.percent)
    .map((c) => ({
      id: c.tag,
      title: CATEGORY_TITLE[c.tag],
      allocationPercent: c.percent,
      reason: buildCategoryReason(c.tag, tendency, answers),
      products: PRODUCT_CATALOG[c.tag],
    }))

  return {
    nationality,
    nationalityIsFallback: isFallback,
    nationalityInsight: tendency.summaryNote,
    riskTier: tier,
    riskTierLabel: RISK_TIER_LABEL[tier],
    riskTierSummary: RISK_TIER_SUMMARY[tier],
    monthlyBudgetLabel: MONTHLY_BUDGET_LABEL[answers.monthlyBudget],
    categories,
    portfolioNote: `월 ${MONTHLY_BUDGET_LABEL[answers.monthlyBudget]} 기준으로 위 비중대로 나눠 투자하는 걸 추천해요. 매달 자동이체를 설정하면 꾸준히 분산 투자할 수 있어요.`,
  }
}
