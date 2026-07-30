import { Link } from "react-router-dom"
import {
  Gauge,
  Map,
  Luggage,
  ArrowRight,
  Wallet,
  PiggyBank,
  CreditCard,
  Landmark,
  LineChart,
  Send,
  ArrowLeftRight,
  TrendingUp,
  UserPlus,
  MessageCircle,
} from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"

const cards = [
  {
    to: "/simulator",
    icon: Gauge,
    title: "승인 시뮬레이터",
    desc: "대출·카드 승인 가능성을 미리 확인하세요",
  },
  {
    to: "/roadmap",
    icon: Map,
    title: "비자별 맞춤 로드맵",
    desc: "체류기간 동안 준비할 일을 순서대로 안내해요",
  },
  {
    to: "/exit-plan",
    icon: Luggage,
    title: "귀국 정산 플래너",
    desc: "퇴직금부터 자산 반출까지 한번에 정리해요",
  },
]

const services = [
  { to: "/accounts", icon: Wallet, label: "입출금" },
  { to: "/deposits", icon: PiggyBank, label: "예적금" },
  { to: "/cards", icon: CreditCard, label: "카드" },
  { to: "/loans", icon: Landmark, label: "대출" },
  { to: "/securities", icon: LineChart, label: "증권" },
  { to: "/remittance", icon: Send, label: "해외송금" },
  { to: "/exchange", icon: ArrowLeftRight, label: "환전" },
  { to: "/invest", icon: TrendingUp, label: "투자" },
  { to: "/onboarding", icon: UserPlus, label: "계좌개설" },
  { to: "/chat", icon: MessageCircle, label: "챗봇" },
]

export default function Home() {
  return (
    <PhoneShell title="안녕하세요, Nguyen 님">
      <div className="rounded-2xl bg-moss text-moss-ink p-4 mb-4">
        <p className="text-xs text-moss-ink/70 mb-1">이번 달 요약</p>
        <p className="text-[15px] leading-relaxed">
          급여이체 이력이 쌓이며 대안 신용점수가 <span className="font-medium">+6점</span> 올랐어요
        </p>
      </div>

      <p className="text-xs text-ink/50 mb-2 px-1">핵심 서비스</p>
      <div className="flex flex-col gap-3">
        {cards.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-2xl border border-mist bg-white/60 p-4 hover:border-moss transition-colors"
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-moss-light flex items-center justify-center">
              <Icon size={20} className="text-moss-ink" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-ink">{title}</p>
              <p className="text-[12px] text-ink/55 leading-snug">{desc}</p>
            </div>
            <ArrowRight size={16} className="text-ink/30 shrink-0" />
          </Link>
        ))}
      </div>

      <p className="text-xs text-ink/50 mb-2 px-1 mt-5">전체 서비스</p>
      <div className="grid grid-cols-4 gap-y-4">
        {services.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-moss-light flex items-center justify-center">
              <Icon size={20} className="text-moss-ink" strokeWidth={1.8} />
            </div>
            <span className="text-[11px] text-ink/70 text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </PhoneShell>
  )
}
