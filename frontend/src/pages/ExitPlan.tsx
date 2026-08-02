import { useEffect, useState } from "react"
import { Loader2, CircleCheck, CircleAlert, Circle, Sparkles, PiggyBank, TrendingUp } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import {
  fetchExitPlan,
  productTypeMeta,
  type ExitPlanResult,
  type ExitItemStatus,
  type Variability,
  type ProductType,
} from "../mocks/exitPlan"

const statusMeta: Record<ExitItemStatus, { icon: typeof Circle; className: string; text: string }> = {
  ready: { icon: CircleCheck, className: "text-moss-ink", text: "준비 완료" },
  action_needed: { icon: CircleAlert, className: "text-amber", text: "확인 필요" },
  not_started: { icon: Circle, className: "text-ink/30", text: "대기" },
}

const variabilityBadgeStyle: Record<Variability, string> = {
  fixed: "border border-mist text-ink/40",
  variable: "bg-amber-light text-amber",
}

const variabilityLabel: Record<Variability, string> = {
  fixed: "고정",
  variable: "변동",
}

const productIcon: Record<ProductType, typeof PiggyBank> = {
  savings: PiggyBank,
  investment: TrendingUp,
}

const productBadgeStyle: Record<ProductType, string> = {
  savings: "bg-moss-light text-moss-ink",
  investment: "bg-amber-light text-amber",
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
          <p className="text-xs">입출금 내역 분석 · 자산 예측 계산 중</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="귀국 정산 플래너">
      <div className="rounded-2xl bg-moss text-moss-ink p-4 mb-2">
        <p className="text-xs text-moss-ink/70 mb-1">
          {data.departureDateLabel} 출국 예정 · D-{data.daysRemaining}
        </p>
        <p className="text-[12px] text-moss-ink/70 mb-1">AI 예상 총 수령액</p>
        <p className="text-[24px] font-medium">{data.estimatedGrandTotalLabel}</p>
      </div>
      <p className="text-[11px] text-ink/40 leading-snug mb-5 px-1">{data.estimateRangeNote}</p>

      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Sparkles size={13} className="text-moss-dark" />
        <p className="text-xs text-ink/50">AI 입출금 내역 분석 · {data.cashflow.periodLabel}</p>
      </div>
      <div className="rounded-2xl border border-mist bg-white/60 p-4 mb-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12px] text-ink/50">월 평균 소득</span>
          <span className="text-[14px] font-medium text-ink">{data.cashflow.monthlyIncomeLabel}</span>
        </div>
        <div className="flex flex-col gap-1.5 mb-3">
          {data.cashflow.incomeItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1.5 text-ink/70">
                {item.label}
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${variabilityBadgeStyle[item.variability]}`}>
                  {variabilityLabel[item.variability]}
                </span>
              </span>
              <span className="text-ink/70 shrink-0">{item.amountLabel}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-mist my-3" />

        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12px] text-ink/50">월 평균 지출</span>
          <span className="text-[14px] font-medium text-ink">{data.cashflow.monthlyExpenseLabel}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {data.cashflow.expenseItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1.5 text-ink/70">
                {item.label}
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${variabilityBadgeStyle[item.variability]}`}>
                  {variabilityLabel[item.variability]}
                </span>
              </span>
              <span className="text-ink/70 shrink-0">{item.amountLabel}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-mist my-3" />

        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-ink">월 평균 순저축</span>
          <span className="text-[15px] font-medium text-moss-dark">{data.cashflow.monthlyNetSavingsLabel}</span>
        </div>
      </div>
      <div className="rounded-xl bg-moss-light p-3 flex items-start gap-2 mb-5">
        <Sparkles size={15} className="text-moss-dark shrink-0 mt-0.5" />
        <p className="text-[12px] text-ink/80 leading-relaxed">{data.cashflow.aiNote}</p>
      </div>

      <p className="text-xs text-ink/50 mb-2 px-1">귀국일까지 예상 자산</p>
      <div className="rounded-2xl border border-mist bg-white/60 p-4 mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] text-ink/50">현재 입출금 계좌 잔액</span>
          <span className="text-[13px] font-medium text-ink">{data.projection.currentBalanceLabel}</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] text-ink/50">
            귀국일까지 예상 추가 저축 ({data.projection.monthsRemaining}개월)
          </span>
          <span className="text-[13px] font-medium text-ink">{data.projection.projectedAdditionalSavingsLabel}</span>
        </div>
        <p className="text-[11px] text-ink/40 mb-3">{data.projection.additionalSavingsRangeLabel}</p>

        <div className="h-px bg-mist my-3" />

        <p className="text-[12px] text-ink/50 mb-2">KB 상품 예상 평가액</p>
        <div className="flex flex-col gap-2 mb-3">
          {data.projection.productContributions.map((p) => {
            const Icon = productIcon[p.type]
            return (
              <div key={p.id} className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-mist/40 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-ink/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[12px] font-medium text-ink flex items-center gap-1.5">
                      {p.name}
                      <span className={`text-[10px] rounded-full px-1.5 py-0.5 shrink-0 ${productBadgeStyle[p.type]}`}>
                        {productTypeMeta[p.type]}
                      </span>
                    </span>
                    <span className="text-[12px] font-medium text-ink shrink-0">{p.expectedValueLabel}</span>
                  </div>
                  <p className="text-[11px] text-ink/45 leading-snug">{p.note}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-ink/40">상품 예상 평가액 소계</span>
          <span className="text-[12px] text-ink/60">{data.projection.productsSubtotalLabel}</span>
        </div>

        <div className="h-px bg-mist my-3" />

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-ink">예상 자산 합계</span>
          <span className="text-[16px] font-medium text-moss-dark">{data.projection.projectedTotalLabel}</span>
        </div>
      </div>

      <p className="text-xs text-ink/50 mb-2 px-1">출국 시 추가 정산 항목</p>
      <div className="flex flex-col gap-2 mb-2">
        {data.settlementItems.map((item) => {
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
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-ink/40">정산 항목 합계</span>
        <span className="text-[12px] text-ink/60">{data.settlementSubtotalLabel}</span>
      </div>
    </PhoneShell>
  )
}
