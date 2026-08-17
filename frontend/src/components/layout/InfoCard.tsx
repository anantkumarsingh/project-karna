import { cn } from "@/lib/utils"

export function InfoCard({
  icon: Icon,
  iconColor = "text-gray-500",
  title,
  action,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
              <Icon className={cn("w-3.5 h-3.5", iconColor)} />
            </div>
          )}
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  )
}

export function PlainCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] px-4 py-4">
      {children}
    </div>
  )
}

export function CompactPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-100">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}
