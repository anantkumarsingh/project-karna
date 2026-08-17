"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  FlaskConical,
  Home,
  FileText,
  Database,
  HelpCircle,
  BarChart2,
  AreaChart,
  FileOutput,
  Settings,
} from "lucide-react"

const ACCENT = "#635BFF"

const navItems = [
  { href: "/", label: "Research Workspace", icon: Home },
  { href: "/papers", label: "Paper Understanding", icon: FileText },
  { href: "/data", label: "Data Understanding", icon: Database },
  { href: "/question", label: "Research Question", icon: HelpCircle },
  { href: "/analysis", label: "Analysis Execution", icon: BarChart2 },
  { href: "/visualizations", label: "Visualization Studio", icon: AreaChart },
  { href: "/report", label: "Report Builder", icon: FileOutput },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
          <FlaskConical className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-[15px] text-gray-900">Karna</span>
        <span className="ml-auto text-[10px] text-gray-400 font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded">v0.1</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] border transition-all",
                active
                  ? "bg-white font-medium border-[#635BFF]/25 shadow-[0_4px_14px_-2px_rgba(99,91,255,0.25),inset_0_1px_0_rgba(255,255,255,0.8)]"
                  : "text-gray-600 border-transparent hover:bg-white/70 hover:border-gray-200 hover:shadow-sm"
              )}
              style={active ? { color: ACCENT } : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" style={active ? { color: ACCENT } : undefined} />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 px-3 py-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] text-gray-600 border border-transparent hover:bg-white/70 hover:border-gray-200 hover:shadow-sm transition-all"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
