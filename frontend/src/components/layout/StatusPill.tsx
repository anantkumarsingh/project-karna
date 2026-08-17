import { CheckCircle2, Clock, XCircle, Pencil, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  processed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  profiled: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  analyzed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  queued: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  processing: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  running: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  failed: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  draft: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
  paused: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
  ready: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
}

const pulseStatuses = new Set(["processing", "running"])

export function StatusPill({ status }: { status: string }) {
  const icon =
    status === "failed" ? (
      <XCircle className="w-3 h-3" />
    ) : status === "draft" ? (
      <Pencil className="w-3 h-3" />
    ) : status === "ready" ? (
      <Circle className="w-3 h-3" />
    ) : status === "pending" || status === "queued" || status === "processing" || status === "running" ? (
      <Clock className={cn("w-3 h-3", pulseStatuses.has(status) && "animate-pulse")} />
    ) : (
      <CheckCircle2 className="w-3 h-3" />
    )
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium", statusStyles[status] ?? "bg-gray-100 text-gray-600 ring-1 ring-gray-200")}>
      {icon}
      {status}
    </span>
  )
}
