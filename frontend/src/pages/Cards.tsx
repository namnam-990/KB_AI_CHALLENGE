import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CreditCard, Loader2 } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { fetchCards, type CardsResult } from "../mocks/cards"

export default function Cards() {
  const [data, setData] = useState<CardsResult | null>(null)

  useEffect(() => {
    fetchCards().then(setData)
  }, [])

  if (!data) {
    return (
      <PhoneShell title="카드">
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">카드 정보 불러오는 중</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="카드">
      <p className="text-xs text-ink/50 mb-2 px-1">보유 카드</p>
      <div className="flex flex-col gap-2 mb-5">
        {data.ownedCards.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-mist bg-white/60 p-3">
            <div className="w-9 h-9 rounded-full bg-moss-light flex items-center justify-center shrink-0">
              <CreditCard size={16} className="text-moss-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink truncate">{c.name}</p>
              <p className="text-[11px] text-ink/45">{c.lastUsedLabel}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-mist bg-white/60 p-4 mb-5">
        <p className="text-[12px] text-ink/50 mb-1">이번 달 사용 금액</p>
        <p className="text-[20px] font-medium text-ink mb-2">{data.monthlySpendLabel}</p>
        <p className="text-[12px] text-ink/50">최다 사용처: {data.monthlyTopCategory}</p>
      </div>

      <p className="text-xs text-ink/50 mb-2 px-1">신청 가능한 카드 추천</p>
      <div className="flex flex-col gap-2">
        {data.recommendations.map((r) => (
          <div key={r.id} className="rounded-xl border border-mist bg-white/60 p-3">
            <p className="text-[13px] font-medium text-ink mb-0.5">{r.name}</p>
            <p className="text-[12px] text-ink/55 mb-2">{r.benefit}</p>
            <p className="text-[11px] text-ink/50">{r.eligibleLabel}</p>
          </div>
        ))}
      </div>

      <Link to="/simulator" className="mt-4 block text-center text-[12px] text-ink/70 underline underline-offset-2">
        내 승인 가능성 미리 확인하기
      </Link>
    </PhoneShell>
  )
}
