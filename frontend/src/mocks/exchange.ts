// 실제로는 FastAPI의 실시간 환율/환전 실행 응답으로 교체될 목업 데이터입니다.

export interface ExchangeRate {
  code: string
  country: string
  currency: string
  rate: number // 1 외화 = n원
  changePercent: number
}

export interface ExchangeResult {
  rates: ExchangeRate[]
}

export const exchangeRates: ExchangeRate[] = [
  { code: "USD", country: "미국", currency: "달러", rate: 1382.4, changePercent: 0.3 },
  { code: "VND", country: "베트남", currency: "동", rate: 0.0558, changePercent: -0.1 },
  { code: "PHP", country: "필리핀", currency: "페소", rate: 24.6, changePercent: 0.2 },
  { code: "THB", country: "태국", currency: "바트", rate: 39.8, changePercent: -0.4 },
  { code: "IDR", country: "인도네시아", currency: "루피아", rate: 0.088, changePercent: 0.1 },
]

export async function fetchExchangeRates(): Promise<ExchangeResult> {
  // TODO(backend): await fetch(`${API_BASE}/exchange/rates`)
  await new Promise((r) => setTimeout(r, 400))
  return { rates: exchangeRates }
}

export async function executeExchange(currencyCode: string, amountKrw: number): Promise<{ resultLabel: string }> {
  // TODO(backend): await fetch(`${API_BASE}/exchange/execute`, { method: "POST", body: JSON.stringify({ currencyCode, amountKrw }) })
  await new Promise((r) => setTimeout(r, 500))

  const found = exchangeRates.find((r) => r.code === currencyCode)
  const rate = found ? found.rate : 1
  const amount = amountKrw / rate

  return { resultLabel: `${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currencyCode} 환전 완료 (모의)` }
}
