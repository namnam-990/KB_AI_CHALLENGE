import { useEffect, useState } from "react"
import { Loader2, Check } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import {
  fetchRoadmap,
  getSavedRoadmapSurvey,
  clearRoadmapSurvey,
  submitRoadmapSurvey,
  VISA_TYPE_OPTIONS,
  NATIONALITY_OPTIONS,
  SAVINGS_GOAL_OPTIONS,
  OTHER_OPTION,
  SAVINGS_GOAL_MAX_SELECT,
  type RoadmapResult,
  type MilestoneStatus,
  type RoadmapSurveyAnswers,
} from "../mocks/roadmap"

const dotClass: Record<MilestoneStatus, string> = {
  done: "bg-moss",
  current: "bg-amber ring-4 ring-amber-light",
  upcoming: "bg-mist",
}

type Phase = "survey" | "loading" | "result"

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
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

export default function Roadmap() {
  const [phase, setPhase] = useState<Phase>(() => (getSavedRoadmapSurvey() ? "loading" : "survey"))
  const [data, setData] = useState<RoadmapResult | null>(null)

  const [surveyStep, setSurveyStep] = useState(0)
  const [visaType, setVisaType] = useState<string | null>(null)
  const [nationality, setNationality] = useState<string | null>(null)
  const [nationalityOther, setNationalityOther] = useState("")
  const [savingsGoals, setSavingsGoals] = useState<string[]>([])
  const [savingsGoalOther, setSavingsGoalOther] = useState("")
  const [plannedDepartureDate, setPlannedDepartureDate] = useState("")
  const [monthlySavingsAmount, setMonthlySavingsAmount] = useState("")

  useEffect(() => {
    if (phase !== "loading") return
    fetchRoadmap().then((d) => {
      setData(d)
      setPhase("result")
    })
  }, [phase])

  function toggleSavingsGoal(goal: string) {
    setSavingsGoals((prev) => {
      if (prev.includes(goal)) return prev.filter((g) => g !== goal)
      if (prev.length >= SAVINGS_GOAL_MAX_SELECT) return prev
      return [...prev, goal]
    })
  }

  function handleSubmitSurvey() {
    const answers: RoadmapSurveyAnswers = {
      visaType: visaType!,
      nationality: nationality === OTHER_OPTION ? nationalityOther.trim() : nationality!,
      savingsGoals: savingsGoals.map((g) => (g === OTHER_OPTION ? savingsGoalOther.trim() : g)),
      plannedDepartureDate,
      monthlySavingsAmount: Number(monthlySavingsAmount),
    }
    submitRoadmapSurvey(answers)
    setPhase("loading")
  }

  function handleRetakeSurvey() {
    clearRoadmapSurvey()
    setVisaType(null)
    setNationality(null)
    setNationalityOther("")
    setSavingsGoals([])
    setSavingsGoalOther("")
    setPlannedDepartureDate("")
    setMonthlySavingsAmount("")
    setSurveyStep(0)
    setData(null)
    setPhase("survey")
  }

  if (phase === "survey") {
    const canGoNext =
      (surveyStep === 0 && !!visaType) ||
      (surveyStep === 1 && !!nationality && (nationality !== OTHER_OPTION || nationalityOther.trim().length > 0)) ||
      (surveyStep === 2 &&
        savingsGoals.length === SAVINGS_GOAL_MAX_SELECT &&
        (!savingsGoals.includes(OTHER_OPTION) || savingsGoalOther.trim().length > 0)) ||
      (surveyStep === 3 && plannedDepartureDate.length > 0) ||
      (surveyStep === 4 && Number(monthlySavingsAmount) > 0)

    return (
      <PhoneShell title="비자별 맞춤 로드맵">
        <div className="flex items-center gap-1.5 mb-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= surveyStep ? "bg-moss-dark" : "bg-mist"}`} />
          ))}
        </div>

        {surveyStep === 0 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">1 / 5</p>
            <h2 className="text-[16px] font-medium text-ink mb-4 px-1">비자 유형을 선택해주세요</h2>
            <div className="flex flex-col gap-2">
              {VISA_TYPE_OPTIONS.map((v) => (
                <OptionButton
                  key={v.code}
                  label={`${v.code}  ${v.label}`}
                  selected={visaType === v.code}
                  onClick={() => setVisaType(v.code)}
                />
              ))}
            </div>
          </>
        )}

        {surveyStep === 1 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">2 / 5</p>
            <h2 className="text-[16px] font-medium text-ink mb-4 px-1">국적을 선택해주세요</h2>
            <div className="flex flex-col gap-2">
              {NATIONALITY_OPTIONS.map((n) => (
                <OptionButton key={n} label={n} selected={nationality === n} onClick={() => setNationality(n)} />
              ))}
              <OptionButton
                label={OTHER_OPTION}
                selected={nationality === OTHER_OPTION}
                onClick={() => setNationality(OTHER_OPTION)}
              />
              {nationality === OTHER_OPTION && (
                <input
                  autoFocus
                  value={nationalityOther}
                  onChange={(e) => setNationalityOther(e.target.value)}
                  placeholder="국적을 직접 입력해주세요"
                  className="rounded-xl border border-mist bg-white/60 p-3 text-[13px] text-ink outline-none focus:border-moss-dark"
                />
              )}
            </div>
          </>
        )}

        {surveyStep === 2 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">3 / 5</p>
            <h2 className="text-[16px] font-medium text-ink mb-1 px-1">저축 목적을 2가지 선택해주세요</h2>
            <p className="text-[12px] text-ink/45 mb-4 px-1">복수선택 · {savingsGoals.length} / 2 선택됨</p>
            <div className="flex flex-col gap-2">
              {SAVINGS_GOAL_OPTIONS.map((g) => (
                <OptionButton
                  key={g}
                  label={g}
                  selected={savingsGoals.includes(g)}
                  onClick={() => toggleSavingsGoal(g)}
                />
              ))}
              <OptionButton
                label={OTHER_OPTION}
                selected={savingsGoals.includes(OTHER_OPTION)}
                onClick={() => toggleSavingsGoal(OTHER_OPTION)}
              />
              {savingsGoals.includes(OTHER_OPTION) && (
                <input
                  autoFocus
                  value={savingsGoalOther}
                  onChange={(e) => setSavingsGoalOther(e.target.value)}
                  placeholder="저축 목적을 직접 입력해주세요"
                  className="rounded-xl border border-mist bg-white/60 p-3 text-[13px] text-ink outline-none focus:border-moss-dark"
                />
              )}
            </div>
          </>
        )}

        {surveyStep === 3 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">4 / 5</p>
            <h2 className="text-[16px] font-medium text-ink mb-1 px-1">귀국 예정일을 입력해주세요</h2>
            <p className="text-[12px] text-ink/45 mb-4 px-1">
              입력하신 날짜를 기준으로 남은 체류 기간을 계산해 로드맵을 짜는 데 활용해요
            </p>
            <input
              type="date"
              value={plannedDepartureDate}
              onChange={(e) => setPlannedDepartureDate(e.target.value)}
              className="w-full rounded-xl border border-mist bg-white/60 p-3 text-[13px] text-ink outline-none focus:border-moss-dark"
            />
          </>
        )}

        {surveyStep === 4 && (
          <>
            <p className="text-xs text-ink/50 mb-1 px-1">5 / 5</p>
            <h2 className="text-[16px] font-medium text-ink mb-1 px-1">매달 저축 가능한 금액을 입력해주세요</h2>
            <p className="text-[12px] text-ink/45 mb-4 px-1">저축 목표까지 필요한 기간을 계산하는 데 활용해요</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={monthlySavingsAmount}
                onChange={(e) => setMonthlySavingsAmount(e.target.value)}
                placeholder="예: 50"
                className="flex-1 rounded-xl border border-mist bg-white/60 p-3 text-[13px] text-ink outline-none focus:border-moss-dark"
              />
              <span className="text-[13px] text-ink/60 shrink-0">만원 / 월</span>
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
            onClick={() => (surveyStep < 4 ? setSurveyStep((s) => s + 1) : handleSubmitSurvey())}
            className="flex-1 py-3 rounded-xl text-[13px] font-medium bg-moss text-moss-ink disabled:opacity-40"
          >
            {surveyStep < 4 ? "다음" : "완료"}
          </button>
        </div>
      </PhoneShell>
    )
  }

  if (phase === "loading" || !data) {
    return (
      <PhoneShell title="비자별 맞춤 로드맵">
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">설문 응답 기반 체류 일정 분석 중</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="비자별 맞춤 로드맵">
      <button type="button" onClick={handleRetakeSurvey} className="text-[11px] text-ink/40 mb-2 px-1 underline">
        설문 다시 응답하기
      </button>

      <div className="rounded-2xl bg-moss text-moss-ink p-4 mb-4">
        <p className="text-xs text-moss-ink/70 mb-1">{data.visaType}</p>
        <p className="text-[15px]">
          비자 만료까지 <span className="font-medium">{data.monthsRemaining}개월</span> 남았어요
        </p>
      </div>

      <p className="text-[11px] text-ink/40 leading-snug mb-5 px-1">
        신용점수와 설문 응답에 맞춰 AI가 아래 각 단계의 세부 항목과 시기를 조정해요.
      </p>

      <div className="flex flex-col gap-6 mb-6">
        {data.stages.map((stage) => (
          <div key={stage.id}>
            <div className="flex items-baseline gap-2 mb-3 px-1">
              <span className="text-[11px] font-medium text-moss-dark">{stage.stepLabel}</span>
              <span className="text-[14px] font-medium text-ink">{stage.title}</span>
              <span className="text-[11px] text-ink/40">{stage.subtitle}</span>
            </div>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-mist" />
              <div className="flex flex-col gap-6">
                {stage.milestones.map((m) => (
                  <div key={m.id} className="relative">
                    <span className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ${dotClass[m.status]}`} />
                    <p className="text-[11px] text-ink/45 mb-0.5">{m.monthLabel}</p>
                    <p className="text-[14px] font-medium text-ink">{m.title}</p>
                    <p className="text-[12px] text-ink/55 leading-snug mt-0.5">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-baseline gap-2 mb-3 px-1">
        <span className="text-[11px] font-medium text-moss-dark">STEP 4</span>
        <span className="text-[14px] font-medium text-ink">{data.wrapUp.title}</span>
      </div>
      <p className="text-[11px] text-ink/40 mb-3 px-1">{data.wrapUp.subtitle}</p>
      <div className="flex flex-col gap-2">
        {data.wrapUp.branches.map((branch) => (
          <div key={branch.key} className="rounded-xl border border-mist bg-white/60 p-3">
            <p className="text-[13px] font-medium text-ink mb-1">{branch.label}</p>
            <p className="text-[12px] text-ink/55 leading-snug mb-2">{branch.description}</p>
            <ul className="flex flex-col gap-1">
              {branch.actions.map((action) => (
                <li key={action} className="text-[12px] text-ink/70 leading-snug pl-3 relative">
                  <span className="absolute left-0 top-0">·</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PhoneShell>
  )
}
