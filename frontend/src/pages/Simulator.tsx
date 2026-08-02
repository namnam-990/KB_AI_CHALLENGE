import { useEffect, useRef, useState } from "react"
import { FileCheck2, Loader2, FileWarning, CircleCheck, Upload, RotateCcw, Sparkles } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { ScoreGauge } from "../components/ScoreGauge"
import {
  fetchSimulatorResult,
  getMockDocFeedback,
  offerTierMeta,
  type SimulatorResult,
  type RequiredDoc,
  type DocStatus,
  type OfferTier,
} from "../mocks/simulator"

const statusStyle: Record<DocStatus, { icon: typeof FileCheck2; text: string; className: string }> = {
  complete: { icon: CircleCheck, text: "완료", className: "text-moss-ink" },
  processing: { icon: Loader2, text: "처리 중", className: "text-amber" },
  missing: { icon: FileWarning, text: "필요", className: "text-coral" },
}

const tierBadgeStyle: Record<OfferTier, string> = {
  recommended: "bg-moss text-moss-ink",
  eligible: "border border-mist text-ink/60",
  conditional: "bg-amber-light text-amber",
}

const ACCEPTED_FILE_TYPES = "image/*,application/pdf"

function isAcceptedFile(file: File) {
  return file.type.startsWith("image/") || file.type === "application/pdf"
}

export default function Simulator() {
  const [tab, setTab] = useState<"loan" | "card">("loan")
  const [result, setResult] = useState<SimulatorResult | null>(null)
  const [docs, setDocs] = useState<RequiredDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeDocId = useRef<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchSimulatorResult(tab).then((r) => {
      setResult(r)
      setDocs(r.requiredDocs)
      setLoading(false)
    })
  }, [tab])

  function handleUploadClick(docId: string) {
    activeDocId.current = docId
    setUploadError(null)
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const docId = activeDocId.current
    e.target.value = ""
    if (!file || !docId) return

    if (!isAcceptedFile(file)) {
      setUploadError("사진(JPG/PNG) 또는 PDF 파일만 업로드할 수 있어요.")
      return
    }
    setUploadError(null)

    setDocs((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status: "processing", hint: `${file.name} · 인식 중` } : doc)),
    )

    // TODO(backend): await fetch(`${API_BASE}/agents/verification`, { method: "POST", body: formData })
    setTimeout(() => {
      setDocs((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? { ...doc, status: "complete", hint: `${file.name} · 업로드 완료`, aiFeedback: getMockDocFeedback(docId) }
            : doc,
        ),
      )
    }, 1000)
  }

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
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col gap-2 mb-2">
            {docs.map((doc) => {
              const s = statusStyle[doc.status]
              const Icon = s.icon
              const canUpload = doc.status !== "processing"
              return (
                <div key={doc.id} className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    disabled={!canUpload}
                    onClick={() => handleUploadClick(doc.id)}
                    className="flex items-center gap-3 rounded-xl border border-mist bg-white/60 p-3 text-left disabled:cursor-default"
                  >
                    <Icon
                      size={18}
                      className={`${s.className} shrink-0 ${doc.status === "processing" ? "animate-spin" : ""}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink flex items-center gap-1.5">
                        {doc.label}
                        {doc.optional && (
                          <span className="text-[10px] font-normal text-ink/40 border border-mist rounded-full px-1.5 py-0.5">
                            선택
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-ink/50 leading-snug">{doc.hint}</p>
                    </div>
                    {doc.status === "complete" ? (
                      <span className="flex items-center gap-1 text-[11px] shrink-0 text-ink/40">
                        <RotateCcw size={12} />
                        변경
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1 text-[11px] shrink-0 ${s.className}`}>
                        {doc.status === "missing" && <Upload size={12} />}
                        {s.text}
                      </span>
                    )}
                  </button>

                  {doc.aiFeedback && (
                    <div className="flex items-start gap-2 rounded-xl bg-coral-light px-3 py-2 ml-1">
                      <Sparkles size={13} className="text-coral shrink-0 mt-0.5" />
                      <p className="text-[11px] text-ink/70 leading-snug">{doc.aiFeedback}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {uploadError && <p className="text-[11px] text-coral mb-2 px-1">{uploadError}</p>}

          <div className="rounded-xl bg-amber-light p-3 mb-3">
            <p className="text-[12px] text-ink/80 leading-relaxed">{result.nextAction}</p>
          </div>

          <div className="rounded-xl bg-moss-light p-3 flex items-start gap-2 mb-4">
            <Sparkles size={15} className="text-moss-dark shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-medium text-ink mb-0.5">AI 신용점수 코치</p>
              <p className="text-[12px] text-ink/80 leading-relaxed">{result.creditScoreTip}</p>
            </div>
          </div>

          {result.loanOffers && (
            <>
              <p className="text-xs text-ink/50 mb-2 px-1">신용점수 기반 상품 추천</p>
              <div className="flex flex-col gap-2">
                {result.loanOffers.map((offer) => (
                  <div key={offer.id} className="rounded-xl border border-mist bg-white/60 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-[13px] font-medium text-ink">{offer.productName}</p>
                      <span
                        className={`text-[10px] shrink-0 rounded-full px-2 py-0.5 ${tierBadgeStyle[offer.tier]}`}
                      >
                        {offerTierMeta[offer.tier]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-ink/70 mb-1">
                      <span>금리 {offer.interestRate}</span>
                      <span>{offer.maxAmount}</span>
                    </div>
                    <p className="text-[11px] text-ink/50 leading-snug">{offer.note}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {result.cardInsight && (
            <>
              <p className="text-xs text-ink/50 mb-2 px-1">카드 승인 상세</p>
              <div className="rounded-2xl border border-mist bg-white/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] font-medium text-ink">{result.cardInsight.approvalLikelihoodLabel}</p>
                  <span className="text-[12px] text-ink/50">{result.cardInsight.approvalLikelihoodPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-mist/50 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-moss-dark"
                    style={{ width: `${result.cardInsight.approvalLikelihoodPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="text-ink/50">승인 가능 적정 한도</span>
                  <span className="font-medium text-ink">{result.cardInsight.recommendedLimit}</span>
                </div>
                <p className="text-[11px] text-ink/40 mb-3">한도 범위 {result.cardInsight.limitRange}</p>
                <p className="text-[12px] text-ink/70 leading-relaxed border-t border-mist pt-3">
                  {result.cardInsight.note}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </PhoneShell>
  )
}
