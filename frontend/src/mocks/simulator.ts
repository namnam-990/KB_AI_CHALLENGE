// 실제로는 FastAPI의 POST /agents/loan-simulator 응답으로 교체될 목업 데이터입니다.
// 백엔드 연동 시 이 파일의 함수 시그니처만 그대로 유지한 채 내부를 fetch 호출로 바꾸면 됩니다.

export type DocStatus = "complete" | "missing" | "processing"

export interface RequiredDoc {
  id: string
  label: string
  status: DocStatus
  hint: string
}

export interface SimulatorResult {
  productName: string
  approvalScore: number // 0-100
  approvalLabel: string
  altCreditScore: number // 0-100, 대안 신용평가 점수
  requiredDocs: RequiredDoc[]
  nextAction: string
}

export async function fetchSimulatorResult(productType: "loan" | "card"): Promise<SimulatorResult> {
  // TODO(backend): await fetch(`${API_BASE}/agents/loan-simulator`, { method: "POST", body: JSON.stringify({ productType }) })
  await new Promise((r) => setTimeout(r, 400))

  if (productType === "loan") {
    return {
      productName: "외국인 전세자금대출",
      approvalScore: 72,
      approvalLabel: "승인 가능성 높음",
      altCreditScore: 68,
      requiredDocs: [
        { id: "d1", label: "재직증명서", status: "complete", hint: "사진 업로드 완료" },
        { id: "d2", label: "근로계약서 (EPS 표준)", status: "complete", hint: "자동 표준양식 변환 완료" },
        { id: "d3", label: "급여명세서 (최근 3개월)", status: "processing", hint: "OCR 인식 중" },
        { id: "d4", label: "서울보증보험 발급 확인", status: "missing", hint: "부동산 계약서 업로드 후 자동 신청 가능" },
      ],
      nextAction: "부동산 계약서만 추가로 업로드하면 서울보증보험 발급까지 자동 진행돼요.",
    }
  }

  return {
    productName: "KB 외국인 체크·신용카드",
    approvalScore: 54,
    approvalLabel: "신용카드는 보완 필요",
    altCreditScore: 61,
    requiredDocs: [
      { id: "d1", label: "재직증명서", status: "complete", hint: "사진 업로드 완료" },
      { id: "d2", label: "급여 이체 이력 (3개월)", status: "complete", hint: "대안 신용평가에 반영됨" },
      { id: "d3", label: "통신비 납부 이력", status: "missing", hint: "연동하면 신용점수 최대 8점 상승" },
    ],
    nextAction: "통신비 자동이체 내역을 연동하면 신용카드 승인 가능성이 올라가요.",
  }
}
