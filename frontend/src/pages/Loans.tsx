import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Landmark, Loader2 } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { fetchLoanStatus, type LoanStatus } from "../mocks/loans"

export default function Loans() {
  const [data, setData] = useState<LoanStatus | null>(null)

  useEffect(() => {
    fetchLoanStatus().then(setData)
  }, [])

  if (!data) {
    return (
      <PhoneShell title="대출">
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">대출 현황 불러오는 중</p>
        </div>
      </PhoneShell>
    )
  }

  if (!data.hasActiveLoan) {
    return (
      <PhoneShell title="대출">
        <div className="py-16 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-mist/50 flex items-center justify-center">
            <Landmark size={24} className="text-ink/40" />
          </div>
          <p className="text-[14px] text-ink/60">진행 중인 대출이 없어요</p>
          <Link to="/simulator" className="mt-2 px-5 py-2.5 rounded-xl bg-moss text-moss-ink text-[13px] font-medium">
            승인 시뮬레이터로 확인하기
          </Link>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="대출">
      <div className="rounded-2xl border border-mist bg-white/60 p-4">
        <p className="text-[13px] font-medium text-ink mb-3">{data.productName}</p>
        <div className="flex items-center justify-between text-[12px] mb-1">
          <span className="text-ink/50">남은 원금</span>
          <span className="font-medium text-ink">{data.remainingPrincipalLabel}</span>
        </div>
        <div className="flex items-center justify-between text-[12px] mb-3">
          <span className="text-ink/50">다음 상환일</span>
          <span className="font-medium text-ink">
            {data.nextPaymentDateLabel} · {data.nextPaymentAmountLabel}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-mist overflow-hidden mb-1">
          <div className="h-full bg-moss rounded-full" style={{ width: `${data.progressPercent}%` }} />
        </div>
        <p className="text-[11px] text-ink/45 text-right">상환 진행률 {data.progressPercent}%</p>
      </div>
    </PhoneShell>
  )
}
