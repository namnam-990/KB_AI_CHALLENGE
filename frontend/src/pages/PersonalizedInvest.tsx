import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, Check, Sparkles, PiggyBank, Landmark, Coins, Cpu, LineChart } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import {
  fetchPersonalizedInvestResult,
  getSavedInvestSurvey,
  clearInvestSurvey,
  submitInvestSurvey,
  PURPOSE_OPTIONS,
  HORIZON_OPTIONS,
  LOSS_TOLERANCE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LIQUIDITY_OPTIONS,
  MONTHLY_BUDGET_OPTIONS,
  type InvestPurpose,
  type InvestHorizon,
  type LossTolerance,
  type InvestExperience,
  type LiquidityNeed,
  type MonthlyBudget,
  type InvestSurveyAnswers,
  type PersonalizedInvestResult,
} from "../mocks/personalizedInvest"

const STEP_COUNT = 6

const categoryIcon = {
  savings: PiggyBank,
  bond: Landmark,
  gold: Coins,
  "tech-stock": Cpu,
  fund: LineChart,
} as const

const riskBadgeStyle: Record<string, string> = {
  안전: "border border-mist text-ink/60",
  중위험: "bg-amber-light text-amber",
  고위험: "bg-coral-light text-coral",
}

type Phase = "survey" | "loading" | "result"

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-[13px] transition-colors ${
        selected ? "border-moss-dark bg-moss-light text-ink" : "border-mist bg-white/60 text-ink/70"
      }`}
    >
      <span>{label}</span>
      {selected && <Check size={16} className="text-moss-dark shrink-0" />}
    </button>
  )
}

export default function PersonalizedInvest() {
  const [phase, setPhase] = useState<Phase>(() => (getSavedInvestSurvey() ? "loading" : "survey"))
  const [data, setData] = useState<PersonalizedInvestResult | null>(null)

  const [surveyStep, setSurveyStep] = useState(0)
  const [purposes, setPurposes] = useState<InvestPurpose[]>([])
  const [horizon, setHorizon] = useState<InvestHorizon | null>(null)
  const [lossTolerance, setLossTolerance] = useState<LossTolerance | null>(null)
  const [experiences, setExperiences] = useState<InvestExperience[]>([])
  const [liquidityNeed, setLiquidityNeed] = useState<LiquidityNeed | null>(null)
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudget | null>(null)

  useEffect(() => {
    if (phase !== "loading") return
    const saved = getSavedInvestSurvey()
    if (!saved) {
      setPhase("survey")
      return
    }
    fetchPersonalizedInvestResult(saved).then((d) => {
      setData(d)
      setPhase("result")
    })
  }, [phase])

  function toggle<T>(list: T[], setList: (v: T[]) => void, value: T) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  function handleSubmitSurvey() {
    const answers: InvestSurveyAnswers = {
      purposes,
      horizon: horizon!,
      lossTolerance: lossTolerance!,
      experiences,
      liquidityNeed: liquidityNeed!,
      monthlyBudget: monthlyBudget!,
    }
    submitInvestSurvey(answers)
    setPhase("loading")
  }

  function handleRetakeSurvey() {
    clearInvestSurvey()
    setPurposes([])
    setHorizon(null)
    setLossTolerance(null)
    setExperiences([])
    setLiquidityNeed(null)
    setMonthlyBudget(null)
    setSurveyStep(0)
    setData(null)
    setPhase("survey")
  }

  if (phase === "survey") {
    const canGoNext =
      (surveyStep === 0 && purposes.length > 0) ||
      (surveyStep === 1 && !!horizon) ||
      (surveyStep === 2 && !!lossTolerance) ||
      (surveyStep === 3 && experiences.length > 0) ||
      (surveyStep === 4 && !!liquidityNeed) ||
      (surveyStep === 5 && !!monthlyBudget)

    return (
      <PhoneShell title="맞춤형 투자 추천">
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= surveyStep ? "bg-moss-dark" : "bg-mist"}`} />
          ))}
        </div>

        {surveyStep === 0 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">1 / 6</p>
            <h2 className="text-[16px] font-medium text-ink mb-1 px-1">투자 목적은 무엇인가요?</h2>
            <p className="text-[12px] text-ink/45 mb-4 px-1">
              복수선택 가능 · 비자별 로드맵에서 선택하신 저축 목적을 참고해서 답변해주세요
            </p>
            <div className="flex flex-col gap-2">
              {PURPOSE_OPTIONS.map((o) => (
                <OptionButton
                  key={o.code}
                  label={o.label}
                  selected={purposes.includes(o.code)}
                  onClick={() => toggle(purposes, setPurposes, o.code)}
                />
              ))}
            </div>
          </>
        )}

        {surveyStep === 1 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">2 / 6</p>
            <h2 className="text-[16px] font-medium text-ink mb-4 px-1">투자 가능한 기간은 얼마나 되나요?</h2>
            <div className="flex flex-col gap-2">
              {HORIZON_OPTIONS.map((o) => (
                <OptionButton key={o.code} label={o.label} selected={horizon === o.code} onClick={() => setHorizon(o.code)} />
              ))}
            </div>
          </>
        )}

        {surveyStep === 2 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">3 / 6</p>
            <h2 className="text-[16px] font-medium text-ink mb-4 px-1">
              투자한 돈의 가치가 일시적으로 떨어진다면 어떻게 하시겠어요?
            </h2>
            <div className="flex flex-col gap-2">
              {LOSS_TOLERANCE_OPTIONS.map((o) => (
                <OptionButton
                  key={o.code}
                  label={o.label}
                  selected={lossTolerance === o.code}
                  onClick={() => setLossTolerance(o.code)}
                />
              ))}
            </div>
          </>
        )}

        {surveyStep === 3 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">4 / 6</p>
            <h2 className="text-[16px] font-medium text-ink mb-1 px-1">지금까지 투자 경험이 있으신가요?</h2>
            <p className="text-[12px] text-ink/45 mb-4 px-1">복수선택 가능</p>
            <div className="flex flex-col gap-2">
              {EXPERIENCE_OPTIONS.map((o) => (
                <OptionButton
                  key={o.code}
                  label={o.label}
                  selected={experiences.includes(o.code)}
                  onClick={() => toggle(experiences, setExperiences, o.code)}
                />
              ))}
            </div>
          </>
        )}

        {surveyStep === 4 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">5 / 6</p>
            <h2 className="text-[16px] font-medium text-ink mb-1 px-1">이 돈이 없어도 생활에 지장이 없나요?</h2>
            <p className="text-[12px] text-ink/45 mb-4 px-1">유동성 니즈를 확인하는 질문이에요</p>
            <div className="flex flex-col gap-2">
              {LIQUIDITY_OPTIONS.map((o) => (
                <OptionButton
                  key={o.code}
                  label={o.label}
                  selected={liquidityNeed === o.code}
                  onClick={() => setLiquidityNeed(o.code)}
                />
              ))}
            </div>
          </>
        )}

        {surveyStep === 5 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">6 / 6</p>
            <h2 className="text-[16px] font-medium text-ink mb-4 px-1">매달 얼마 정도 투자에 배정할 수 있나요?</h2>
            <div className="flex flex-col gap-2">
              {MONTHLY_BUDGET_OPTIONS.map((o) => (
                <OptionButton
                  key={o.code}
                  label={o.label}
                  selected={monthlyBudget === o.code}
                  onClick={() => setMonthlyBudget(o.code)}
                />
              ))}
            </div>
          </>
        )}

        <div className="flex gap-2 mt-6">
          {surveyStep > 0 && (
            <button
              type="button"
              onClick={() => setSurveyStep((s) => s - 1)}
              className="py-3 px-4 rounded-xl text-[13px] font-medium border border-mist text-ink/60"
            >
              이전
            </button>
          )}
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => (surveyStep < STEP_COUNT - 1 ? setSurveyStep((s) => s + 1) : handleSubmitSurvey())}
            className="flex-1 py-3 rounded-xl text-[13px] font-medium bg-moss text-moss-ink disabled:opacity-40"
          >
            {surveyStep < STEP_COUNT - 1 ? "다음" : "완료"}
          </button>
        </div>
      </PhoneShell>
    )
  }

  if (phase === "loading" || !data) {
    return (
      <PhoneShell title="맞춤형 투자 추천">
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">국적별 투자성향 · 설문 응답 기반 상품 매칭 중</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="맞춤형 투자 추천">
      <button type="button" onClick={handleRetakeSurvey} className="text-[11px] text-ink/40 mb-2 px-1 underline">
        설문 다시 응답하기
      </button>

      <div className="rounded-2xl bg-moss text-moss-ink p-4 mb-2">
        <p className="text-xs text-moss-ink/70 mb-1">{data.nationality} 국적 · {data.riskTierLabel}</p>
        <p className="text-[13px] leading-relaxed">{data.riskTierSummary}</p>
      </div>
      {data.nationalityIsFallback && (
        <p className="text-[11px] text-ink/40 mb-3 px-1">
          온보딩에 등록된 국적 정보가 없어 기본값({data.nationality})을 사용했어요
        </p>
      )}

      <div className="rounded-xl bg-moss-light p-3 flex items-start gap-2 mb-5">
        <Sparkles size={15} className="text-moss-dark shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-medium text-ink mb-0.5">AI 국적 투자성향 분석 (목업 데이터)</p>
          <p className="text-[12px] text-ink/80 leading-relaxed">{data.nationalityInsight}</p>
        </div>
      </div>

      <p className="text-xs text-ink/50 mb-2 px-1">추천 자산 배분</p>
      <div className="flex flex-col gap-3 mb-5">
        {data.categories.map((c) => {
          const Icon = categoryIcon[c.id]
          return (
            <div key={c.id} className="rounded-2xl border border-mist bg-white/60 p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-mist/40 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-ink/60" />
                </div>
                <p className="text-[13px] font-medium text-ink flex-1">{c.title}</p>
                <span className="text-[13px] font-medium text-moss-dark shrink-0">{c.allocationPercent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-mist mb-2.5 overflow-hidden">
                <div className="h-full bg-moss rounded-full" style={{ width: `${c.allocationPercent}%` }} />
              </div>
              <p className="text-[11px] text-ink/55 leading-snug mb-3">{c.reason}</p>

              <div className="flex flex-col gap-2">
                {c.products.map((p) => (
                  <div key={p.id} className="rounded-xl bg-paper/60 border border-mist/60 p-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[12px] font-medium text-ink">{p.name}</span>
                      <span className={`text-[10px] shrink-0 rounded-full px-1.5 py-0.5 ${riskBadgeStyle[p.riskBadge]}`}>
                        {p.riskBadge}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-ink/50">{p.note}</span>
                      <span className="text-ink/70 font-medium shrink-0 ml-2">{p.expectedReturnLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl bg-amber-light p-3 mb-4">
        <p className="text-[12px] text-ink/80 leading-relaxed">{data.portfolioNote}</p>
      </div>

      <Link to="/invest" className="block text-center text-[12px] text-ink/70 underline underline-offset-2 mb-2">
        KB 투자 상품 전체 보기
      </Link>
    </PhoneShell>
  )
}
