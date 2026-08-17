const ACCENT = "#635BFF"

export function MiniKaplanMeier({ steps }: { steps: { time: number; survivalPct: number }[] }) {
  const maxTime = Math.max(...steps.map((s) => s.time)) || 1
  return (
    <div className="relative h-16 w-full">
      <div className="absolute inset-0 flex items-end">
        {steps.map((s, i) => {
          const next = steps[i + 1]
          const widthPct = ((next ? next.time : maxTime) - s.time) / maxTime * 100
          return (
            <div
              key={i}
              className="h-full flex flex-col justify-end shrink-0"
              style={{ width: `${widthPct}%` }}
            >
              <div
                className="w-full border-t-2"
                style={{ height: `${s.survivalPct}%`, borderColor: ACCENT, backgroundColor: `${ACCENT}12` }}
              />
            </div>
          )
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
    </div>
  )
}

export function MiniForestPlot({ rows }: { rows: { label: string; hr: number; ciLow: number; ciHigh: number }[] }) {
  const max = Math.max(...rows.map((r) => r.ciHigh), 2)
  const min = Math.min(...rows.map((r) => r.ciLow), 0)
  const range = max - min || 1
  const pct = (v: number) => ((v - min) / range) * 100
  const nullLinePct = pct(1)
  return (
    <div className="space-y-1.5">
      <div className="relative h-px bg-gray-100" />
      {rows.map((r, i) => (
        <div key={i} className="relative h-4">
          <div className="absolute top-0 bottom-0 w-px bg-gray-200" style={{ left: `${nullLinePct}%` }} />
          <div
            className="absolute top-1/2 h-px"
            style={{ left: `${pct(r.ciLow)}%`, width: `${pct(r.ciHigh) - pct(r.ciLow)}%`, backgroundColor: ACCENT, opacity: 0.5 }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
            style={{ left: `calc(${pct(r.hr)}% - 3px)`, backgroundColor: ACCENT }}
          />
        </div>
      ))}
    </div>
  )
}
