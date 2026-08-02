// FastAPI의 GET /agents/visa-roadmap, POST /agents/visa-roadmap/survey 연동.

import { apiFetch } from "../lib/api"

// --- 로드맵 진입 설문 (비자유형 / 국적 / 저축목적) ---
// 설문 응답은 백엔드로 전송되어 AI 에이전트가 로드맵을 개인화하는 데 사용됩니다.

export interface VisaTypeOption {
  code: string
  label: string
}

export const VISA_TYPE_OPTIONS: VisaTypeOption[] = [
  { code: "E-9", label: "비전문취업" },
  { code: "E-7", label: "특정활동 (숙련기능인력 등)" },
  { code: "H-2", label: "방문취업 (동포)" },
  { code: "F-4", label: "재외동포" },
  { code: "F-2", label: "거주" },
  { code: "F-5", label: "영주" },
  { code: "D-2", label: "유학" },
  { code: "D-4", label: "일반연수" },
  { code: "D-10", label: "구직" },
]

export const NATIONALITY_OPTIONS: string[] = [
  "베트남",
  "중국",
  "태국",
  "우즈베키스탄",
  "필리핀",
  "캄보디아",
  "네팔",
  "인도네시아",
  "미얀마",
  "스리랑카",
  "몽골",
  "파키스탄",
  "방글라데시",
  "키르기스스탄",
  "라오스",
  "동티모르",
]

export const SAVINGS_GOAL_OPTIONS: string[] = [
  "귀국 자금 마련",
  "가족 생활비·교육비 송금",
  "국내 정착·내집마련",
  "창업·사업자금 마련",
  "학업·유학자금 마련",
]

export const OTHER_OPTION = "기타"
export const SAVINGS_GOAL_MAX_SELECT = 2

export interface RoadmapSurveyAnswers {
  visaType: string
  nationality: string
  savingsGoals: string[]
  plannedDepartureDate: string // ISO date (YYYY-MM-DD) · 귀국 예정일
  monthlySavingsAmount: number // 만원 단위 · 매달 저축 가능 금액
}

const SURVEY_STORAGE_KEY = "kb_roadmap_survey_answers"

export function getSavedRoadmapSurvey(): RoadmapSurveyAnswers | null {
  try {
    const raw = localStorage.getItem(SURVEY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RoadmapSurveyAnswers) : null
  } catch {
    return null
  }
}

export function clearRoadmapSurvey(): void {
  localStorage.removeItem(SURVEY_STORAGE_KEY)
}

export async function submitRoadmapSurvey(answers: RoadmapSurveyAnswers): Promise<void> {
  await apiFetch<{ received: boolean }>("/agents/visa-roadmap/survey", {
    method: "POST",
    body: JSON.stringify(answers),
  })
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(answers))
}

// --- 로드맵 결과 ---
//
// 로드맵은 4단계 틀(기본 준비 → 저축 → 투자 → 정리)이 고정이고,
// 그 안의 세부 항목·시기는 AI 에이전트가 신용점수·설문 응답 기반으로 채워 넣습니다.

export type MilestoneStatus = "done" | "current" | "upcoming"

export interface Milestone {
  id: string
  monthLabel: string
  title: string
  description: string
  status: MilestoneStatus
}

export interface RoadmapStage {
  id: string
  stepLabel: string
  title: string
  subtitle: string
  milestones: Milestone[]
}

export interface RoadmapWrapUpBranch {
  key: "return" | "extend"
  label: string
  description: string
  actions: string[]
}

export interface RoadmapWrapUp {
  title: string
  subtitle: string
  branches: RoadmapWrapUpBranch[]
}

export interface RoadmapResult {
  visaType: string
  monthsRemaining: number
  stages: RoadmapStage[]
  wrapUp: RoadmapWrapUp
}

export async function fetchRoadmap(): Promise<RoadmapResult> {
  return apiFetch<RoadmapResult>("/agents/visa-roadmap")
}
