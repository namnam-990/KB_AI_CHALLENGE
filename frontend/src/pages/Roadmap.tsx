import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { PhoneShell } from "../components/PhoneShell"
import { fetchRoadmap, type RoadmapResult, type MilestoneStatus } from "../mocks/roadmap"

const dotClass: Record<MilestoneStatus, string> = {
  done: "bg-moss",
  current: "bg-amber ring-4 ring-amber-light",
  upcoming: "bg-mist",
}

export default function Roadmap() {
  const [data, setData] = useState<RoadmapResult | null>(null)

  useEffect(() => {
    fetchRoadmap().then(setData)
  }, [])

  if (!data) {
    return (
      <PhoneShell title="비자별 맞춤 로드맵">
        <div className="py-20 flex flex-col items-center gap-2 text-ink/40">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">체류 일정 분석 중</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell title="비자별 맞춤 로드맵">
      <div className="rounded-2xl bg-moss text-moss-ink p-4 mb-5">
        <p className="text-xs text-moss-ink/70 mb-1">{data.visaType}</p>
        <p className="text-[15px]">
          비자 만료까지 <span className="font-medium">{data.monthsRemaining}개월</span> 남았어요
        </p>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-mist" />
        <div className="flex flex-col gap-6">
          {data.milestones.map((m) => (
            <div key={m.id} className="relative">
              <span className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ${dotClass[m.status]}`} />
              <p className="text-[11px] text-ink/45 mb-0.5">{m.monthLabel}</p>
              <p className="text-[14px] font-medium text-ink">{m.title}</p>
              <p className="text-[12px] text-ink/55 leading-snug mt-0.5">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  )
}
