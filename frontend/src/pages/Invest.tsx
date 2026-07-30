import { useState } from "react"
import { Loader2 } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { fetchInvestRecommendations, type InvestProduct, type RiskLevel } from "../mocks/invest"

const riskOptions: { value: RiskLevel; label: string }[] = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "중간" },
  { value: "high", label: "높음" },
]

export default function Invest() {
  const [risk, setRisk] = useState<RiskLevel | null>(null)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<InvestProduct[] | null>(null)

  async function handleSelect(value: RiskLevel) {
    setRisk(value)
    setLoading(true)
    const result = await fetchInvestRecommendations(value)
    setProducts(result)
    setLoading(false)
  }

  return (
    <PhoneShell title="투자 추천">
      <p className="text-[14px] font-medium text-ink mb-1">투자 성향을 선택해주세요</p>
      <p className="text-xs text-ink/50 mb-4">체류 기간과 목돈 계획에 맞는 상품을 추천해드려요</p>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {riskOptions.map((o) => (
          <button
            key={o.value}
            onClick={() => handleSelect(o.value)}
            className={`py-3 rounded-xl text-[13px] font-medium transition-colors ${
              risk === o.value ? "bg-moss text-moss-ink" : "bg-white/60 text-ink/60 border border-mist"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-16 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">맞춤 상품 찾는 중</p>
        </div>
      )}

      {!loading && products && (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-mist bg-white/60 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[13px] font-medium text-ink">{p.name}</p>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-light text-ink/70 shrink-0">
                  {p.riskBadge}
                </span>
              </div>
              <p className="text-[15px] font-medium text-ink mb-2">{p.expectedReturnLabel}</p>
              <p className="text-[12px] text-ink/55 leading-snug">{p.reason}</p>
            </div>
          ))}
        </div>
      )}
    </PhoneShell>
  )
}
