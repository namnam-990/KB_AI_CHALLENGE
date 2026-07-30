import { useState } from "react"
import { Send } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { faqSuggestions, fetchChatAnswer, type ChatMessage } from "../mocks/chat"

const initialMessages: ChatMessage[] = [
  {
    id: "m0",
    role: "bot",
    text: "안녕하세요! 궁금한 금융 용어나 절차를 물어보세요. 다국어로도 답변할 수 있어요.",
  },
]

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    setMessages((prev) => [...prev, { id: `u${prev.length}`, role: "user", text }])
    setInput("")
    setLoading(true)
    const answer = await fetchChatAnswer(text)
    setMessages((prev) => [...prev, { id: `b${prev.length}`, role: "bot", text: answer }])
    setLoading(false)
  }

  return (
    <PhoneShell title="금융지식 챗봇">
      <div className="flex flex-col h-full">
        <p className="text-[11px] text-ink/40 mb-3">
          다국어 RAG 검색 기반으로 KB 상품·제도 문서를 찾아 답변해요 (목업 응답)
        </p>

        <div className="flex gap-2 flex-wrap mb-4">
          {faqSuggestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-[11px] px-3 py-1.5 rounded-full border border-mist bg-white/60 text-ink/60 hover:border-moss transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-3 mb-3 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === "user" ? "bg-moss text-moss-ink" : "bg-white border border-mist text-ink"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-3.5 py-2.5 text-[13px] bg-white border border-mist text-ink/40">
                답변 작성 중...
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="궁금한 점을 입력하세요"
            className="flex-1 rounded-xl border border-mist bg-white/60 px-4 py-2.5 text-[13px] outline-none focus:border-moss"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-moss text-moss-ink flex items-center justify-center shrink-0 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </PhoneShell>
  )
}
