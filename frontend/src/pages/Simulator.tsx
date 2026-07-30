import { useEffect, useState } from "react"
import { FileCheck2, Loader2, FileWarning, CircleCheck } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { ScoreGauge } from "../components/ScoreGauge"
import { fetchSimulatorResult, type SimulatorResult, type DocStatus } from "../mocks/simulator"

const statusStyle: Record<DocStatus, { icon: typeof FileCheck2; text: string; className: string }> = {
  complete: { icon: CircleCheck, text: "완료", className: "text-moss-ink" },
  processing: { icon: Loader2, text: "처리 중", className: "text-amber" },
  missing: { icon: FileWarning, text: "필요", className: "text-coral" },
}

export default function Simulator() {
  const [tab, setTab] = useState<"loan" | "card">("loan")
  const [result, setResult] = useState<SimulatorResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchSimulatorResult(tab).then((r) => {
      setResult(r)
      setLoading(false)
    })
  }, [tab])

  return (
    <PhoneShell title="승인 시뮬레이터">
      <div className="flex gap-2 mb-4">
        {(["loan", "card"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors ${
              tab === t ? "bg-moss text-moss-ink" : "bg-white/60 text-ink/50 border border-mist"
            }`}
          >
            {t === "loan" ? "대출" : "카드"}
          </button>
        ))}
      </div>

      {loading || !result ? (
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">증빙 자동화 · 대안 신용평가 실행 중</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-ink/50 mb-3 px-1">{result.productName}</p>

          <div className="rounded-2xl border border-mist bg-white/60 p-5 flex flex-col items-center mb-4">
            <ScoreGauge score={result.approvalScore} label={result.approvalLabel} />
            <div className="w-full mt-4 pt-4 border-t border-mist flex items-center justify-between text-[12px]">
              <span className="text-ink/50">대안 신용평가 점수</span>
              <span className="font-medium text-ink">{result.altCreditScore} / 100</span>
            </div>
          </div>

          <p className="text-xs text-ink/50 mb-2 px-1">필요 서류 체크리스트</p>
          <div className="flex flex-col gap-2 mb-4">
            {result.requiredDocs.map((doc) => {
              const s = statusStyle[doc.status]
              const Icon = s.icon
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 rounded-xl border border-mist bg-white/60 p-3"
                >
                  <Icon size={18} className={`${s.className} shrink-0 ${doc.status === "processing" ? "animate-spin" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink">{doc.label}</p>
                    <p className="text-[11px] text-ink/50 leading-snug">{doc.hint}</p>
                  </div>
                  <span className={`text-[11px] shrink-0 ${s.className}`}>{s.text}</span>
                </div>
              )
            })}
          </div>

          <div className="rounded-xl bg-amber-light p-3">
            <p className="text-[12px] text-ink/80 leading-relaxed">{result.nextAction}</p>
          </div>
        </>
      )}
    </PhoneShell>
  )
}
