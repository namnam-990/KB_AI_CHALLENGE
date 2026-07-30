export function ScoreGauge({ score, label }: { score: number; label: string }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const color = score >= 70 ? "#C79A00" : score >= 45 ? "#E8A33D" : "#E4634A"

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#C9D6CE" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="500" fill="#16241F">
          {score}
        </text>
        <text x="70" y="86" textAnchor="middle" fontSize="11" fill="#16241F99">
          / 100
        </text>
      </svg>
      <p className="text-sm font-medium text-ink mt-1">{label}</p>
    </div>
  )
}
