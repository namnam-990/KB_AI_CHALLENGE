import { useEffect, useState } from "react"
import { Loader2, TrendingUp } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { fetchSecuritiesAccount, type SecuritiesResult } from "../mocks/securities"

export default function Securities() {
  const [data, setData] = useState<SecuritiesResult | null>(null)

  useEffect(() => {
    fetchSecuritiesAccount().then(setData)
  }, [])

  if (!data) {
    return (
      <PhoneShell title="증권계좌">
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">증권계좌 정보 불러오는 중</p>
        </div>
      </PhoneShell>
    )
  }

  if (!data.opened) {
    return (
      <PhoneShell title="증권계좌">
        <div className="rounded-2xl border border-mist bg-white/60 p-4 flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-mist/50 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-ink/40" />
          </div>
          <p className="text-[13px] text-ink/60">아직 개설된 증권계좌가 없어요</p>
        </div>

        <div className="rounded-xl bg-amber-light p-4">
          <p className="text-[13px] font-medium text-ink mb-2">영업점 방문이 필요한 이유</p>
          <p className="text-[12px] text-ink/80 leading-relaxed">
            증권계좌 개설은 거주자/비거주자 여부와 본국의 조세조약 체결 여부에 따라 준비 서류(여권, 외국인등록증,
            거주지 증빙, 조세조약 신고서 등)가 달라져요. 정확한 서류 확인을 위해 영업점 방문이 필요해요.
          </p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="증권계좌">
      <div className="rounded-2xl bg-moss text-moss-ink p-4 mb-5">
        <p className="text-xs text-moss-ink/70 mb-1">증권계좌</p>
        <p className="text-[16px] font-medium">{data.accountNumber}</p>
      </div>

      <p className="text-xs text-ink/50 mb-2 px-1">보유 상품</p>
      <div className="flex flex-col gap-2">
        {data.holdings?.map((h) => (
          <div key={h.id} className="flex items-center justify-between rounded-xl border border-mist bg-white/60 p-3">
            <p className="text-[13px] font-medium text-ink">{h.name}</p>
            <div className="text-right">
              <p className="text-[13px] font-medium text-ink">{h.valueLabel}</p>
              <p className="text-[11px] text-ink/50">{h.returnLabel}</p>
            </div>
          </div>
        ))}
      </div>
    </PhoneShell>
  )
}
