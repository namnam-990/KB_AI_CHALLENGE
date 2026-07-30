// 실제로는 FastAPI의 다국어 RAG 기반 금융지식 챗봇 응답으로 교체될 목업 데이터입니다.

export interface ChatMessage {
  id: string
  role: "user" | "bot"
  text: string
}

export const faqSuggestions: string[] = [
  "OTP가 뭐예요?",
  "거래외국환은행 지정이 뭔가요?",
  "체크카드와 신용카드 차이는?",
  "비자 만료 전에 꼭 해야 할 일은?",
]

const mockAnswers: Record<string, string> = {
  "OTP가 뭐예요?":
    "OTP(일회용 비밀번호)는 인터넷·모바일뱅킹에서 이체할 때마다 새로 생성되는 6자리 보안 번호예요. 전용 카드형 OTP 또는 앱에서 발급받을 수 있어요.",
  "거래외국환은행 지정이 뭔가요?":
    "해외로 연간 일정 금액 이상 송금하려면 미리 하나의 은행을 '거래외국환은행'으로 지정해야 해요. KB국민은행 앱에서 서류 업로드로 신청할 수 있어요.",
  "체크카드와 신용카드 차이는?":
    "체크카드는 계좌 잔액 안에서 바로 결제되는 카드이고, 신용카드는 한도 내에서 먼저 쓰고 나중에 갚는 카드예요. 신용카드는 소득·재직 심사가 더 까다로워요.",
  "비자 만료 전에 꼭 해야 할 일은?":
    "비자 만료 3개월 전부터는 연장 서류(재직증명서, 소득증빙)를 준비하고, 귀국을 앞두고 있다면 퇴직금·연금·보험금 정산 절차도 함께 확인하는 게 좋아요.",
}

export async function fetchChatAnswer(question: string): Promise<string> {
  // TODO(backend): await fetch(`${API_BASE}/agents/finance-chatbot`, { method: "POST", body: JSON.stringify({ question }) })
  await new Promise((r) => setTimeout(r, 1000))
  return (
    mockAnswers[question] ??
    "관련 금융 문서를 기반으로 답변을 준비 중이에요. 실제 서비스에서는 다국어 RAG 검색으로 정확한 답변을 드려요."
  )
}
