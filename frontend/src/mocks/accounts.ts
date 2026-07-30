// 실제로는 FastAPI의 GET /accounts/primary 응답으로 교체될 목업 데이터입니다.

export interface Transaction {
  id: string
  type: "in" | "out"
  label: string
  dateLabel: string
  amountLabel: string
}

export interface AccountResult {
  accountNumber: string
  balanceLabel: string
  transactions: Transaction[]
}

export async function fetchAccount(): Promise<AccountResult> {
  // TODO(backend): await fetch(`${API_BASE}/accounts/primary`)
  await new Promise((r) => setTimeout(r, 400))

  return {
    accountNumber: "123-456-789012",
    balanceLabel: "2,481,600원",
    transactions: [
      { id: "t1", type: "in", label: "㈜한빛물류 급여", dateLabel: "07.25", amountLabel: "+2,150,000원" },
      { id: "t2", type: "out", label: "이마트24 안산점", dateLabel: "07.24", amountLabel: "-18,900원" },
      { id: "t3", type: "out", label: "국민연금공단", dateLabel: "07.20", amountLabel: "-94,500원" },
      { id: "t4", type: "out", label: "해외송금 (베트남)", dateLabel: "07.18", amountLabel: "-500,000원" },
      { id: "t5", type: "out", label: "통신비 자동이체", dateLabel: "07.15", amountLabel: "-42,000원" },
      { id: "t6", type: "out", label: "GS25 원곡점", dateLabel: "07.14", amountLabel: "-12,300원" },
    ],
  }
}
