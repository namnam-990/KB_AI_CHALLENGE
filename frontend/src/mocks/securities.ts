// 실제로는 FastAPI의 GET /securities/account 응답으로 교체될 목업 데이터입니다.

export interface SecuritiesHolding {
  id: string
  name: string
  valueLabel: string
  returnLabel: string
}

export interface SecuritiesResult {
  opened: boolean
  accountNumber?: string
  holdings?: SecuritiesHolding[]
}

export async function fetchSecuritiesAccount(): Promise<SecuritiesResult> {
  // TODO(backend): await fetch(`${API_BASE}/securities/account`)
  await new Promise((r) => setTimeout(r, 400))

  return { opened: false }
}
