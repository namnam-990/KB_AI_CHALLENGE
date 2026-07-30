import { useEffect, useState } from "react"
import { Loader2, CircleCheck, CircleAlert, Circle } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { fetchExitPlan, type ExitPlanResult, type ExitItemStatus } from "../mocks/exitPlan"

const statusMeta: Record<ExitItemStatus, { icon: typeof Circle; className: string; text: string }> = {
  ready: { icon: CircleCheck, className: "text-moss-ink", text: "준비 완료" },
  action_needed: { icon: CircleAlert, className: "text-amber", text: "확인 필요" },
  not_started: { icon: Circle, className: "text-ink/30", text: "대기" },
}

export default function ExitPlan() {
  const [data, setData] = useState<ExitPlanResult | null>(null)

  useEffect(() => {
    fetchExitPlan().then(setData)
  }, [])

  if (!data) {
    return (
      <PhoneShell title="귀국 정산 플래너">
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">퇴직금 · 연금 · 보험금 통합 계산 중</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="귀국 정산 플래너">
      <div className="rounded-2xl bg-moss text-moss-ink p-4 mb-5">
        <p className="text-xs text-moss-ink/70 mb-1">예상 수령 총액</p>
        <p className="text-[20px] font-medium">{data.estimatedTotalLabel}</p>
      </div>

      <div className="flex flex-col gap-2">
        {data.items.map((item) => {
          const meta = statusMeta[item.status]
          const Icon = meta.icon
          return (
            <div key={item.id} className="rounded-xl border border-mist bg-white/60 p-3">
              <div className="flex items-center gap-3">
                <Icon size={18} className={`${meta.className} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink">{item.title}</p>
                  <p className="text-[11px] text-ink/45">{item.agent}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-medium text-ink">{item.amountLabel}</p>
                  <p className={`text-[11px] ${meta.className}`}>{meta.text}</p>
                </div>
              </div>
              <p className="text-[11px] text-ink/55 leading-snug mt-2 pl-[30px]">{item.description}</p>
            </div>
          )
        })}
      </div>
    </PhoneShell>
  )
}
