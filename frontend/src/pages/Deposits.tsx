import { useEffect, useState } from "react"
import { Loader2, Target } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import {
  fetchDeposits,
  fetchGoalRecommendation,
  type DepositsResult,
  type GoalRecommendation,
} from "../mocks/deposits"

export default function Deposits() {
  const [data, setData] = useState<DepositsResult | null>(null)
  const [goalAmount, setGoalAmount] = useState("5000")
  const [goalMonths, setGoalMonths] = useState("36")
  const [recommendation, setRecommendation] = useState<GoalRecommendation | null>(null)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    fetchDeposits().then((r) => {
      setData(r)
      setRecommendation(r.recommendation)
    })
  }, [])

  async function handleRecommend() {
    setCalculating(true)
    const r = await fetchGoalRecommendation(Number(goalAmount) || 0, Number(goalMonths) || 1)
    setRecommendation(r)
    setCalculating(false)
  }

  if (!data) {
    return (
      <PhoneShell title="예·적금">
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">상품 정보 불러오는 중</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="예·적금">
      <p className="text-xs text-ink/50 mb-2 px-1">가입 중인 상품</p>
      <div className="flex flex-col gap-3 mb-6">
        {data.products.map((p) => (
          <div key={p.id} className="rounded-2xl border border-mist bg-white/60 p-4">
            <p className="text-[13px] font-medium text-ink mb-0.5">{p.name}</p>
            <p className="text-[11px] text-ink/45 mb-3">{p.maturityLabel}</p>
            <div className="h-1.5 rounded-full bg-mist mb-2 overflow-hidden">
              <div className="h-full bg-moss rounded-full" style={{ width: `${p.progressPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ink/50">현재 적립액</span>
              <span className="font-medium text-ink">{p.currentAmountLabel}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink/50 mb-2 px-1">목표 기반 추천</p>
      <div className="rounded-2xl border border-mist bg-white/60 p-4 mb-3">
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-[11px] text-ink/50 mb-1 block">목표 금액 (만원)</label>
            <input
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className="w-full rounded-lg border border-mist px-3 py-2 text-[13px] outline-none focus:border-moss"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-ink/50 mb-1 block">기간 (개월)</label>
            <input
              value={goalMonths}
              onChange={(e) => setGoalMonths(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className="w-full rounded-lg border border-mist px-3 py-2 text-[13px] outline-none focus:border-moss"
            />
          </div>
        </div>
        <button
          onClick={handleRecommend}
          disabled={calculating}
          className="w-full py-2.5 rounded-xl bg-moss text-moss-ink font-medium text-[13px] disabled:opacity-60"
        >
          {calculating ? "계산 중..." : "추천받기"}
        </button>
      </div>

      {recommendation && (
        <div className="rounded-2xl bg-moss-light p-4 flex gap-3">
          <Target size={18} className="text-moss-ink shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-ink mb-1">{recommendation.goalLabel}</p>
            <p className="text-[12px] text-ink/70 mb-0.5">{recommendation.productName}</p>
            <p className="text-[12px] text-ink/70 mb-0.5">{recommendation.monthlyAmountLabel}</p>
            <p className="text-[11px] text-ink/50">{recommendation.expectedRateLabel}</p>
          </div>
        </div>
      )}
    </PhoneShell>
  )
}
