// 실제로는 FastAPI의 해외송금 견적 에이전트 응답으로 교체될 목업 데이터입니다.

export interface RemittanceCountry {
  code: string
  country: string
  currency: string
  exchangeRate: number // 1 해당 통화 = n원
}

export interface RemittanceQuote {
  sendAmountLabel: string
  receiveAmountLabel: string
  exchangeRateLabel: string
  bankFeeLabel: string
  bankEtaLabel: string
  fintechFeeLabel: string
  fintechEtaLabel: string
}

export const remittanceCountries: RemittanceCountry[] = [
  { code: "VN", country: "베트남", currency: "VND", exchangeRate: 0.0558 },
  { code: "PH", country: "필리핀", currency: "PHP", exchangeRate: 24.6 },
  { code: "TH", country: "태국", currency: "THB", exchangeRate: 39.8 },
  { code: "ID", country: "인도네시아", currency: "IDR", exchangeRate: 0.088 },
  { code: "NP", country: "네팔", currency: "NPR", exchangeRate: 10.3 },
]

export async function fetchRemittanceQuote(countryCode: string, amountKrw: number): Promise<RemittanceQuote> {
  // TODO(backend): await fetch(`${API_BASE}/agents/remittance-quote`, { method: "POST", body: JSON.stringify({ countryCode, amountKrw }) })
  await new Promise((r) => setTimeout(r, 400))

  const country = remittanceCountries.find((c) => c.code === countryCode) ?? remittanceCountries[0]
  const receiveAmount = amountKrw / country.exchangeRate

  return {
    sendAmountLabel: `${amountKrw.toLocaleString()}원`,
    receiveAmountLabel: `${receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${country.currency}`,
    exchangeRateLabel: `1 ${country.currency} ≈ ${country.exchangeRate.toLocaleString()}원`,
    bankFeeLabel: "8,000원 + 전신료 별도",
    bankEtaLabel: "1~2 영업일",
    fintechFeeLabel: "2,500원 (환율 우대 포함)",
    fintechEtaLabel: "실시간~10분",
  }
}
