import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { exchangeRates, fetchExchangeRates, executeExchange } from "../mocks/exchange"

export default function Exchange() {
  const [rates, setRates] = useState(exchangeRates)
  const [loading, setLoading] = useState(true)
  const [currencyCode, setCurrencyCode] = useState(exchangeRates[0].code)
  const [amount, setAmount] = useState("300000")
  const [resultLabel, setResultLabel] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)
  const [autoAlert, setAutoAlert] = useState(false)

  useEffect(() => {
    fetchExchangeRates().then((r) => {
      setRates(r.rates)
      setLoading(false)
    })
  }, [])

  async function handleExecute() {
    setExecuting(true)
    const r = await executeExchange(currencyCode, Number(amount) || 0)
    setResultLabel(r.resultLabel)
    setExecuting(false)
  }

  return (
    <PhoneShell title="환전">
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">실시간 환율 불러오는 중</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-ink/50 mb-2 px-1">실시간 환율</p>
          <div className="flex flex-col gap-1.5 mb-5">
            {rates.map((r) => (
              <div
                key={r.code}
                className="flex items-center justify-between rounded-xl border border-mist bg-white/60 px-3 py-2.5"
              >
                <span className="text-[13px] text-ink">
                  {r.country} ({r.currency})
                </span>
                <div className="text-right">
                  <span className="text-[13px] font-medium text-ink">{r.rate.toLocaleString()}원</span>
                  <span className={`text-[11px] ml-2 ${r.changePercent >= 0 ? "text-moss-ink" : "text-coral"}`}>
                    {r.changePercent >= 0 ? "+" : ""}
                    {r.changePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-ink/50 mb-2 px-1">환전하기</p>
          <div className="rounded-2xl border border-mist bg-white/60 p-4 mb-5">
            <div className="flex gap-2 mb-3">
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="rounded-lg border border-mist px-3 py-2 text-[13px] outline-none focus:border-moss"
              >
                {rates.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.currency}
                  </option>
                ))}
              </select>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                className="flex-1 rounded-lg border border-mist px-3 py-2 text-[13px] outline-none focus:border-moss"
              />
            </div>
            <button
              onClick={handleExecute}
              disabled={executing}
              className="w-full py-2.5 rounded-xl bg-moss text-moss-ink font-medium text-[13px] disabled:opacity-60"
            >
              {executing ? "환전 처리 중..." : "환전 실행"}
            </button>
            {resultLabel && <p className="text-[12px] text-ink/60 mt-2 text-center">{resultLabel}</p>}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-mist bg-white/60 p-3.5">
            <div>
              <p className="text-[13px] font-medium text-ink">급여일 기준 자동 환전 알림</p>
              <p className="text-[11px] text-ink/45">급여 입금일마다 환율을 알려드려요</p>
            </div>
            <button
              onClick={() => setAutoAlert((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${autoAlert ? "bg-moss" : "bg-mist"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  autoAlert ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </>
      )}
    </PhoneShell>
  )
}
