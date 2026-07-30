import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { Home, Gauge, Map, Luggage } from "lucide-react"

const navItems = [
  { to: "/", label: "홈", icon: Home },
  { to: "/simulator", label: "승인 시뮬레이터", icon: Gauge },
  { to: "/roadmap", label: "비자 로드맵", icon: Map },
  { to: "/exit-plan", label: "귀국 정산", icon: Luggage },
]

export function PhoneShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-8 bg-[#ECE9E0]">
      <div className="w-[390px] h-[780px] bg-paper rounded-[36px] shadow-xl overflow-hidden flex flex-col border border-black/5 relative">
        {/* status bar */}
        <div className="h-11 flex items-center justify-between px-6 text-[11px] text-ink/60 shrink-0">
          <span>9:41</span>
          <span className="tracking-wide">KB 외국인 전용</span>
          <span>●●●</span>
        </div>

        {/* header */}
        <div className="px-5 pb-3 shrink-0">
          <h1 className="text-[20px] font-medium text-ink">{title}</h1>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>

        {/* bottom nav */}
        <div className="shrink-0 border-t border-mist bg-paper/95 backdrop-blur px-2 pt-2 pb-5">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-1.5 rounded-xl text-[10px] transition-colors ${
                    isActive ? "text-moss-ink" : "text-ink/40"
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.8} />
                <span className="leading-none text-center">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
