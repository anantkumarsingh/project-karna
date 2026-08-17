"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Grid3x3, Zap, Sparkles, HelpCircle, Bell, Settings, Plus, ChevronDown, Check } from "lucide-react"
import { useProject } from "@/components/layout/ProjectContext"
import { StatusPill } from "@/components/layout/StatusPill"

const ACCENT = "#635BFF"

function ProjectSwitcher() {
  const { currentProject, projects, setCurrentProjectId } = useProject()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  // AppShell only mounts TopBar once projects have loaded, so this should never
  // render — guarded anyway so this component can't silently crash on `.name` if
  // that invariant is ever broken by a future change.
  if (!currentProject) return null

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 max-w-[260px]"
      >
        <span className="text-sm font-medium text-gray-900 truncate">{currentProject.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1.5">
          <div className="px-3 py-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide">Projects</div>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setCurrentProjectId(p.id)
                setOpen(false)
              }}
              className="w-full flex items-start gap-2 px-3 py-2 hover:bg-gray-50 text-left"
            >
              <div className="w-4 shrink-0 mt-0.5">
                {p.id === currentProject.id && <Check className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900 truncate">{p.name}</span>
                  <StatusPill status={p.status} />
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{p.domain}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TopBar() {
  return (
    <div className="h-[64px] flex items-center gap-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
      <ProjectSwitcher />
      <div className="flex-1 max-w-2xl relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          readOnly
          placeholder="Search"
          className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1 mr-2">
          {[
            { icon: Sparkles, bg: "#7C5CFC" },
            { icon: Grid3x3, bg: "#2F80ED" },
            { icon: Zap, bg: "#F2994A" },
          ].map(({ icon: Icon, bg }, i) => (
            <div key={i} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: bg }}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
          ))}
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-gray-100">
            <Grid3x3 className="w-3.5 h-3.5 text-gray-500" />
          </div>
        </div>
        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
          <HelpCircle className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-500" />
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
          <Settings className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-white ml-1" style={{ backgroundColor: ACCENT }}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
