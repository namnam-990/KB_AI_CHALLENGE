import { useState } from "react"
import { Landmark, Zap } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { remittanceCountries, fetchRemittanceQuote, type RemittanceQuote } from "../mocks/remittance"

export default function Remittance() {
  const [countryCode, setCountryCode] = useState(remittanceCountries[0].code)
  const [amount, setAmount] = useState("500000")
  const [quote, setQuote] = useState<RemittanceQuote | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleQuote() {
    const amountNumber = Number(amount)
    if (!amountNumber) return
    setLoading(true)
    const q = await fetchRemittanceQuote(countryCode, amountNumber)
    setQuote(q)
    setLoading(false)
  }

  return (
    <PhoneShell title="해외송금">
      <label className="text-xs text-ink/50 mb-1 block">받는 나라</label>
      <select
        value={countryCode}
        onChange={(e) => {
          setCountryCode(e.target.value)
          setQuote(null)
        }}
        className="w-full rounded-xl border border-mist bg-white/60 px-4 py-3 text-[14px] mb-3 outline-none focus:border-moss"
      >
        {remittanceCountries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.country} ({c.currency})
          </option>
        ))}
      </select>

      <label className="text-xs text-ink/50 mb-1 block">보낼 금액 (원)</label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
        inputMode="numeric"
        className="w-full rounded-xl border border-mist bg-white/60 px-4 py-3 text-[14px] mb-4 outline-none focus:border-moss"
      />

      <button
        onClick={handleQuote}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-moss text-moss-ink font-medium mb-5 disabled:opacity-60"
      >
        {loading ? "환율 조회 중..." : "환율·수수료 조회"}
      </button>

      {quote && (
        <>
          <div className="rounded-2xl border border-mist bg-white/60 p-4 mb-5">
            <p className="text-[12px] text-ink/50 mb-1">{quote.exchangeRateLabel}</p>
            <p className="text-[18px] font-medium text-ink">
              {quote.sendAmountLabel} <span className="text-ink/40">→</span> {quote.receiveAmountLabel}
            </p>
          </div>

          <p className="text-xs text-ink/50 mb-2 px-1">은행 송금 vs 핀테크 앱 비교</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl border border-mist bg-white/60 p-3">
              <Landmark size={18} className="text-ink/40 mb-2" />
              <p className="text-[12px] font-medium text-ink mb-2">은행 송금</p>
              <p className="text-[11px] text-ink/50 mb-0.5">수수료</p>
              <p className="text-[13px] text-ink mb-2">{quote.bankFeeLabel}</p>
              <p className="text-[11px] text-ink/50 mb-0.5">소요시간</p>
              <p className="text-[13px] text-ink">{quote.bankEtaLabel}</p>
            </div>
            <div className="rounded-2xl border border-moss bg-moss-light p-3">
              <Zap size={18} className="text-moss-ink mb-2" />
              <p className="text-[12px] font-medium text-ink mb-2">핀테크 앱</p>
              <p className="text-[11px] text-ink/50 mb-0.5">수수료</p>
              <p className="text-[13px] text-ink mb-2">{quote.fintechFeeLabel}</p>
              <p className="text-[11px] text-ink/50 mb-0.5">소요시간</p>
              <p className="text-[13px] text-ink">{quote.fintechEtaLabel}</p>
            </div>
          </div>
        </>
      )}

      <div className="rounded-xl bg-amber-light p-3">
        <p className="text-[12px] text-ink/80 leading-relaxed">
          연간 누적 송금액이 일정 기준을 넘으면 거래외국환은행 지정이 필요해요. 증빙 자동화 에이전트가 필요 서류를
          미리 준비해드려요.
        </p>
      </div>
    </PhoneShell>
  )
}
