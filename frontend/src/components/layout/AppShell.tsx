"use client"

import { FlaskConical, AlertTriangle } from "lucide-react"
import Sidebar from "@/components/layout/Sidebar"
import TopBar from "@/components/layout/TopBar"
import { useProject } from "@/components/layout/ProjectContext"

const ACCENT = "#635BFF"

/**
 * Gates the whole app shell (Sidebar/TopBar/page content) behind the initial
 * projects fetch. Every page and TopBar assume `currentProject` is available
 * once mounted — rather than scatter null-checks through every consumer, this
 * is the single place that handles "not loaded yet" / "failed to load", so
 * everything downstream can render as if the data were always there (which,
 * once past this gate, it is).
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, error, projects, refreshProjects } = useProject()

  if (loading && projects.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse" style={{ backgroundColor: ACCENT }}>
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-gray-500">Loading Project Karna…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center space-y-3">
          <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto" />
          <p className="text-sm font-medium text-gray-900">Couldn&apos;t load projects</p>
          <p className="text-xs text-gray-500 leading-relaxed">{error}</p>
          <p className="text-xs text-gray-400">Make sure the backend is running (`uv run uvicorn app.main:app --port 8000` in `backend/`).</p>
          <button
            onClick={() => refreshProjects()}
            className="text-xs font-medium text-white rounded-lg px-3 py-2 mt-2"
            style={{ backgroundColor: ACCENT }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
