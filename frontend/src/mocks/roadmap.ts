// 실제로는 FastAPI의 GET /agents/visa-roadmap 응답으로 교체될 목업 데이터입니다.

// --- 로드맵 진입 설문 (비자유형 / 국적 / 저축목적) ---
// 설문 응답은 추후 백엔드로 전송되어 AI 에이전트가 로드맵을 개인화하는 데 사용됩니다.

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
  // TODO(backend): await fetch(`${API_BASE}/agents/visa-roadmap/survey`, { method: "POST", body: JSON.stringify(answers) })
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(answers))
  await new Promise((r) => setTimeout(r, 300))
}

// --- 로드맵 결과 ---
//
// 로드맵은 4단계 틀(기본 준비 → 저축 → 투자 → 정리)이 고정이고,
// 그 안의 세부 항목·시기는 추후 AI 에이전트가 신용점수·설문 응답 기반으로 채워 넣습니다.
// TODO(backend): 아래 stages/wrapUp 전체를 GET /agents/visa-roadmap 응답으로 교체

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
  // TODO(backend): await fetch(`${API_BASE}/agents/visa-roadmap?visaType=E-9`)
  await new Promise((r) => setTimeout(r, 400))

  return {
    visaType: "E-9 (비전문취업)",
    monthsRemaining: 14,
    stages: [
      {
        id: "basic-setup",
        stepLabel: "STEP 1",
        title: "기본 준비",
        subtitle: "계좌 · 카드",
        milestones: [
          {
            id: "s1-1",
            monthLabel: "완료",
            title: "입출금 통장 개설",
            description: "외국인 등록증 인증 후 비대면으로 개설 완료",
            status: "done",
          },
          {
            id: "s1-2",
            monthLabel: "완료",
            title: "체크카드 발급",
            description: "국내 결제·현금 인출용 기본 카드 발급 완료",
            status: "done",
          },
          {
            id: "s1-3",
            monthLabel: "지금",
            title: "급여이체 자동등록",
            description: "대안 신용평가 점수 산정에 반영돼요",
            status: "current",
          },
        ],
      },
      {
        id: "savings",
        stepLabel: "STEP 2",
        title: "저축",
        subtitle: "신용 형성 · 목적별 저축",
        milestones: [
          {
            id: "s2-1",
            monthLabel: "2개월 후",
            title: "자유적립적금 가입",
            description: "소액이라도 꾸준히 납입하면 신용점수 형성에 도움돼요",
            status: "upcoming",
          },
          {
            id: "s2-2",
            monthLabel: "3개월 후",
            title: "목적별 적금 가입",
            description: "설문에서 선택한 저축 목적에 맞는 상품을 추천받아요",
            status: "upcoming",
          },
          {
            id: "s2-3",
            monthLabel: "6개월 후",
            title: "주택청약종합저축 가입",
            description: "국내 정착을 계획 중이라면 가점 확보에 유리해요",
            status: "upcoming",
          },
        ],
      },
      {
        id: "investment",
        stepLabel: "STEP 3",
        title: "투자",
        subtitle: "증권 · 채권 (전원 공통)",
        milestones: [
          {
            id: "s3-1",
            monthLabel: "8개월 후",
            title: "증권계좌(CMA) 개설",
            description: "여유자금을 낮은 리스크로 굴려보는 첫 단계예요",
            status: "upcoming",
          },
          {
            id: "s3-2",
            monthLabel: "10개월 후",
            title: "국채 · 채권형 상품 소액 투자",
            description: "원금 손실 위험이 낮은 상품부터 시작해요",
            status: "upcoming",
          },
          {
            id: "s3-3",
            monthLabel: "12개월 후",
            title: "ETF 분산 투자 시작",
            description: "목표 금액과 남은 기간에 맞춰 투자 비중을 조정해요",
            status: "upcoming",
          },
        ],
      },
    ],
    wrapUp: {
      title: "정리",
      subtitle: "귀국 또는 체류 연장에 따라 달라져요",
      branches: [
        {
          key: "return",
          label: "귀국하는 경우",
          description: "설문에서 입력한 귀국 예정일 기준으로 정산을 준비해요",
          actions: [
            "귀국 정산 플래너에서 환전 · 송금 계획 확인",
            "퇴직연금 반환일시금 신청",
            "예적금 만기일 조정 또는 해지",
          ],
        },
        {
          key: "extend",
          label: "체류를 연장하는 경우",
          description: "비자 연장에 맞춰 다음 로드맵을 새로 준비해요",
          actions: [
            "비자 연장 서류 준비 (재직증명서 · 소득증빙)",
            "신용점수 재점검 후 상품 재추천",
            "다음 단계 로드맵 자동 갱신",
          ],
        },
      ],
    },
  }
}
