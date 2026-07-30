// 실제로는 FastAPI의 계좌개설 온보딩 에이전트 응답으로 교체될 목업 데이터입니다.

export interface Language {
  code: string
  label: string
}

export interface OnboardingResult {
  accountNumber: string
  cardName: string
}

export const supportedLanguages: Language[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "th", label: "ภาษาไทย" },
]

export async function submitIdCardPhoto(): Promise<{ verified: boolean }> {
  // TODO(backend): await fetch(`${API_BASE}/agents/onboarding/id-card`, { method: "POST", body: formData })
  await new Promise((r) => setTimeout(r, 800))
  return { verified: true }
}

export async function sendPhoneVerificationCode(phoneNumber: string): Promise<{ sent: boolean }> {
  // TODO(backend): await fetch(`${API_BASE}/agents/onboarding/phone/send`, { method: "POST", body: JSON.stringify({ phoneNumber }) })
  await new Promise((r) => setTimeout(r, 500))
  return { sent: phoneNumber.length > 0 }
}

export async function verifyPhoneCode(code: string): Promise<{ verified: boolean }> {
  // TODO(backend): await fetch(`${API_BASE}/agents/onboarding/phone/verify`, { method: "POST", body: JSON.stringify({ code }) })
  await new Promise((r) => setTimeout(r, 500))
  return { verified: code.length === 6 }
}

export async function completeOnboarding(): Promise<OnboardingResult> {
  // TODO(backend): await fetch(`${API_BASE}/agents/onboarding/complete`, { method: "POST" })
  await new Promise((r) => setTimeout(r, 600))
  return {
    accountNumber: "123-456-789012",
    cardName: "KB 외국인 체크카드",
  }
}
