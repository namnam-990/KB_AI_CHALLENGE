import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, ChevronLeft, CircleCheck, CreditCard, Loader2 } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import {
  supportedLanguages,
  submitIdCardPhoto,
  sendPhoneVerificationCode,
  verifyPhoneCode,
  completeOnboarding,
  type OnboardingResult,
} from "../mocks/onboarding"

const STEP_COUNT = 4

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [lang, setLang] = useState<string | null>(null)

  const [idPhotoLoading, setIdPhotoLoading] = useState(false)
  const [idPhotoDone, setIdPhotoDone] = useState(false)

  const [phoneNumber, setPhoneNumber] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)

  const [completing, setCompleting] = useState(false)
  const [result, setResult] = useState<OnboardingResult | null>(null)

  async function handleTakePhoto() {
    setIdPhotoLoading(true)
    await submitIdCardPhoto()
    setIdPhotoLoading(false)
    setIdPhotoDone(true)
  }

  async function handleSendCode() {
    setSendingCode(true)
    await sendPhoneVerificationCode(phoneNumber)
    setSendingCode(false)
    setCodeSent(true)
  }

  async function handleVerifyCode() {
    setVerifying(true)
    const r = await verifyPhoneCode(code)
    setVerifying(false)
    setPhoneVerified(r.verified)
  }

  async function goToComplete() {
    setStep(3)
    setCompleting(true)
    const r = await completeOnboarding()
    setCompleting(false)
    setResult(r)
  }

  return (
    <PhoneShell title="계좌개설 온보딩">
      <div className="flex items-center gap-2 mb-6 px-1">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-moss" : "bg-mist"}`} />
        ))}
      </div>

      {step === 0 && (
        <div>
          <p className="text-[15px] font-medium text-ink mb-1">사용할 언어를 선택해주세요</p>
          <p className="text-xs text-ink/50 mb-5">Please select your preferred language</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {supportedLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded-2xl border p-4 text-[14px] font-medium transition-colors ${
                  lang === l.code ? "border-moss bg-moss-light text-ink" : "border-mist bg-white/60 text-ink/60"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            disabled={!lang}
            onClick={() => setStep(1)}
            className="w-full py-3 rounded-xl bg-moss text-moss-ink font-medium disabled:opacity-40 transition-opacity"
          >
            다음
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="text-[15px] font-medium text-ink mb-1">외국인등록증을 촬영해주세요</p>
          <p className="text-xs text-ink/50 mb-5">신분 확인을 위해 필요해요 (목업 화면)</p>

          <div className="rounded-2xl border border-dashed border-mist bg-white/60 h-44 flex flex-col items-center justify-center gap-2 mb-5">
            {idPhotoDone ? (
              <>
                <CircleCheck size={32} className="text-moss-ink" />
                <p className="text-[13px] text-ink/60">촬영 완료</p>
              </>
            ) : idPhotoLoading ? (
              <>
                <Loader2 size={28} className="animate-spin text-ink/40" />
                <p className="text-[13px] text-ink/50">인식 중</p>
              </>
            ) : (
              <>
                <Camera size={32} className="text-ink/30" />
                <p className="text-[13px] text-ink/50">카드를 프레임 안에 맞춰주세요</p>
              </>
            )}
          </div>

          {!idPhotoDone ? (
            <button
              onClick={handleTakePhoto}
              disabled={idPhotoLoading}
              className="w-full py-3 rounded-xl bg-moss text-moss-ink font-medium mb-3 disabled:opacity-60"
            >
              {idPhotoLoading ? "인식 중..." : "촬영하기"}
            </button>
          ) : (
            <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-moss text-moss-ink font-medium mb-3">
              다음
            </button>
          )}
          <button
            onClick={() => setStep(0)}
            className="w-full flex items-center justify-center gap-1 py-2 text-[13px] text-ink/40"
          >
            <ChevronLeft size={14} /> 이전
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-[15px] font-medium text-ink mb-1">본인 명의 휴대폰 인증</p>
          <p className="text-xs text-ink/50 mb-5">국내 통신사(SKT·KT·LG U+ 등)로 개통된 번호만 인증할 수 있어요</p>

          <label className="text-xs text-ink/50 mb-1 block">휴대폰 번호</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full rounded-xl border border-mist bg-white/60 px-4 py-3 text-[14px] mb-3 outline-none focus:border-moss"
          />
          {!codeSent ? (
            <button
              onClick={handleSendCode}
              disabled={!phoneNumber || sendingCode}
              className="w-full py-3 rounded-xl bg-moss text-moss-ink font-medium mb-5 disabled:opacity-40"
            >
              {sendingCode ? "전송 중..." : "인증번호 받기"}
            </button>
          ) : (
            <>
              <label className="text-xs text-ink/50 mb-1 block">인증번호 6자리</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                maxLength={6}
                className="w-full rounded-xl border border-mist bg-white/60 px-4 py-3 text-[14px] mb-3 outline-none focus:border-moss"
              />
              {!phoneVerified ? (
                <button
                  onClick={handleVerifyCode}
                  disabled={code.length < 6 || verifying}
                  className="w-full py-3 rounded-xl bg-moss text-moss-ink font-medium mb-5 disabled:opacity-40"
                >
                  {verifying ? "확인 중..." : "인증하기"}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-moss-ink text-[13px] mb-5">
                  <CircleCheck size={16} /> 인증 완료
                </div>
              )}
            </>
          )}

          {phoneVerified && (
            <button onClick={goToComplete} className="w-full py-3 rounded-xl bg-moss text-moss-ink font-medium mb-3">
              다음
            </button>
          )}
          <button
            onClick={() => setStep(1)}
            className="w-full flex items-center justify-center gap-1 py-2 text-[13px] text-ink/40"
          >
            <ChevronLeft size={14} /> 이전
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center pt-6 text-center">
          {completing || !result ? (
            <>
              <Loader2 size={28} className="animate-spin text-ink/40 mb-3" />
              <p className="text-xs text-ink/50">계좌 개설 처리 중</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-moss-light flex items-center justify-center mb-4">
                <CircleCheck size={32} className="text-moss-ink" />
              </div>
              <p className="text-[16px] font-medium text-ink mb-1">계좌 개설이 완료됐어요</p>
              <p className="text-[13px] text-ink/50 mb-6">{result.accountNumber}</p>

              <div className="w-full rounded-2xl border border-mist bg-white/60 p-4 flex items-center gap-3 mb-6">
                <CreditCard size={24} className="text-ink/50 shrink-0" />
                <div className="text-left">
                  <p className="text-[13px] font-medium text-ink">{result.cardName}</p>
                  <p className="text-[11px] text-ink/50">영업일 기준 3~5일 내 등록 주소로 발송돼요</p>
                </div>
              </div>

              <button onClick={() => navigate("/")} className="w-full py-3 rounded-xl bg-moss text-moss-ink font-medium">
                홈으로
              </button>
            </>
          )}
        </div>
      )}
    </PhoneShell>
  )
}
