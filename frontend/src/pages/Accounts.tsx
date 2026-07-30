import { useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { fetchAccount, type AccountResult } from "../mocks/accounts"

export default function Accounts() {
  const [data, setData] = useState<AccountResult | null>(null)

  useEffect(() => {
    fetchAccount().then(setData)
  }, [])

  if (!data) {
    return (
      <PhoneShell title="입출금 계좌">
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">계좌 정보 불러오는 중</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="입출금 계좌">
      <div className="rounded-2xl bg-moss text-moss-ink p-4 mb-5">
        <p className="text-xs text-moss-ink/70 mb-1">{data.accountNumber}</p>
        <p className="text-[24px] font-medium">{data.balanceLabel}</p>
      </div>

      <p className="text-xs text-ink/50 mb-2 px-1">최근 거래내역</p>
      <div className="flex flex-col gap-2">
        {data.transactions.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border border-mist bg-white/60 p-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                t.type === "in" ? "bg-moss-light" : "bg-mist/50"
              }`}
            >
              {t.type === "in" ? (
                <ArrowDownLeft size={16} className="text-moss-ink" />
              ) : (
                <ArrowUpRight size={16} className="text-ink/50" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink truncate">{t.label}</p>
              <p className="text-[11px] text-ink/45">{t.dateLabel}</p>
            </div>
            <p className={`text-[13px] font-medium shrink-0 ${t.type === "in" ? "text-moss-ink" : "text-ink"}`}>
              {t.amountLabel}
            </p>
          </div>
        ))}
      </div>
    </PhoneShell>
  )
}
