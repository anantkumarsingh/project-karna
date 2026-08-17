"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Database,
  HelpCircle,
  BarChart2,
  AreaChart,
  FileOutput,
  Download,
  Plus,
  AlertCircle,
  ArrowUpRight,
  Activity,
  BookOpen,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { dummyActivityFeed, dummyAgentStatus } from "@/lib/dummy-data"
import { StatusPill } from "@/components/layout/StatusPill"
import { useProject } from "@/components/layout/ProjectContext"
import { api, type RulebookEntryApi } from "@/lib/api"
import type { ExtractedPaper } from "@/lib/dummy-papers"
import type { ProfiledDataset } from "@/lib/dummy-datasets"
import type { ResearchQuestionDetail } from "@/lib/dummy-questions"
import type { ExecutedAnalysis } from "@/lib/dummy-analyses"
import type { Artifact } from "@/lib/dummy-visualizations"

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

const ACCENT = "#635BFF"

function SectionCard({
  title,
  icon: Icon,
  count,
  action,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
  action?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {count !== undefined && (
            <span className="text-xs font-medium text-gray-400 bg-gray-50 rounded-full px-1.5 py-0.5">{count}</span>
          )}
        </div>
        {action && (
          <button className="text-xs font-medium flex items-center gap-0.5" style={{ color: ACCENT }}>
            {action} <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="p-2">{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-default">{children}</div>
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hrs = Math.round(diff / 36e5)
  if (hrs < 1) return "just now"
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

export default function ResearchWorkspace() {
  const { currentProject, currentProjectId } = useProject()

  const [loading, setLoading] = useState(true)
  const [papers, setPapers] = useState<ExtractedPaper[]>([])
  const [datasets, setDatasets] = useState<ProfiledDataset[]>([])
  const [questions, setQuestions] = useState<ResearchQuestionDetail[]>([])
  const [analyses, setAnalyses] = useState<ExecutedAnalysis[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [rulebookEntries, setRulebookEntries] = useState<RulebookEntryApi[]>([])

  useEffect(() => {
    if (!currentProjectId) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      api.papers.list(currentProjectId),
      api.datasets.list(currentProjectId),
      api.researchQuestions.list(currentProjectId),
      api.analyses.list(currentProjectId),
      api.artifacts.list(),
      api.rulebookEntries.list(currentProjectId),
    ])
      .then(([p, d, q, a, art, r]) => {
        if (cancelled) return
        setPapers(p)
        setDatasets(d)
        setQuestions(q)
        setAnalyses(a)
        // Artifact has no projectId of its own (it's scoped via paperId/questionId) —
        // join client-side against this project's own papers instead.
        const paperIds = new Set(p.map((paper) => paper.id))
        setArtifacts(art.filter((a) => paperIds.has(a.paperId)))
        setRulebookEntries(r)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentProjectId])

  const projectActivity = dummyActivityFeed.filter((a) => a.projectId === currentProjectId)

  if (!currentProject) return null

  const statCards = [
    { label: "Papers uploaded", value: papers.length, delta: "+1 this week", icon: FileText, tint: "bg-violet-50 text-violet-600" },
    { label: "Datasets profiled", value: datasets.length, delta: "stable", icon: Database, tint: "bg-sky-50 text-sky-600" },
    { label: "Analyses run", value: analyses.length, delta: "+2 this week", icon: BarChart2, tint: "bg-emerald-50 text-emerald-600" },
    { label: "Charts generated", value: artifacts.length, delta: "+1 this week", icon: AreaChart, tint: "bg-amber-50 text-amber-600" },
  ]

  return (
    <div className="px-8 py-7 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{currentProject.name}</h1>
            <StatusPill status={currentProject.status} />
          </div>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">{currentProject.description}</p>
          <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-400">
            <span>{currentProject.domain}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Created {currentProject.createdAt}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Last activity {timeAgo(currentProject.lastActivity)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg px-3 py-2">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            className="flex items-center gap-1.5 text-sm font-medium text-white rounded-lg px-3 py-2 shadow-sm"
            style={{ backgroundColor: ACCENT }}
          >
            <Plus className="w-3.5 h-3.5" /> New analysis
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading project data…</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-7">
            {statCards.map(({ label, value, delta, icon: Icon, tint }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tint)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600">{delta}</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left column */}
            <div className="col-span-2 space-y-6">
              <SectionCard title="Papers" icon={FileText} count={papers.length} action="View all">
                {papers.map((p) => (
                  <Row key={p.id}>
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-snug line-clamp-1">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.authors} · {p.journal} · {p.year}</p>
                    </div>
                    <StatusPill status={p.status} />
                  </Row>
                ))}
              </SectionCard>

              <SectionCard title="Datasets" icon={Database} count={datasets.length} action="View all">
                {datasets.map((d) => (
                  <Row key={d.id}>
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Database className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-mono">{d.filename}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{d.rows} rows · {d.columns} columns · {d.totalMissingPercent ?? 0}% missing</p>
                    </div>
                    <StatusPill status={d.status} />
                  </Row>
                ))}
              </SectionCard>

              <SectionCard title="Research Questions" icon={HelpCircle} count={questions.length} action="View all">
                {questions.map((rq) => (
                  <Row key={rq.id}>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-snug">{rq.question}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{(rq.linkedAnalysisIds ?? []).length} linked analyses · {rq.createdAt}</p>
                    </div>
                    <StatusPill status={rq.status} />
                  </Row>
                ))}
              </SectionCard>

              <SectionCard title="Recent Analyses" icon={BarChart2} count={analyses.length} action="View all">
                {analyses.map((a) => (
                  <Row key={a.id}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                      <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-snug">{a.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{a.interpretation ?? "No result yet"}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">{a.agent}</span>
                        <span className="text-[10px] text-gray-400">{a.provenance}</span>
                      </div>
                    </div>
                    <StatusPill status={a.status} />
                  </Row>
                ))}
              </SectionCard>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <SectionCard title="Agent Activity" icon={Activity}>
                <div className="px-1">
                  {projectActivity.slice(0, 5).map((a, i) => (
                    <div key={a.id} className="flex gap-3 px-3 py-2.5">
                      <div className="flex flex-col items-center pt-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                        {i < 4 && <span className="w-px flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0 -mt-0.5">
                        <p className="text-xs text-gray-900 leading-snug">
                          <span className="font-medium">{a.agent}</span> {a.action.charAt(0).toLowerCase() + a.action.slice(1)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(a.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  {projectActivity.length === 0 && (
                    <p className="text-xs text-gray-400 px-3 py-2">No agent activity yet — the agent system isn&apos;t wired up yet.</p>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Rulebook" icon={BookOpen} count={rulebookEntries.length} action="View all">
                {rulebookEntries.slice(0, 4).map((r) => (
                  <Row key={r.id}>
                    <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 leading-snug">{r.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{r.scope} scope · {r.source}</p>
                    </div>
                  </Row>
                ))}
              </SectionCard>

              <SectionCard title="Agent Status" icon={Sparkles}>
                <div className="grid grid-cols-2 gap-1 p-1">
                  {dummyAgentStatus.slice(0, 6).map((agent) => (
                    <div key={agent.name} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <span className="text-[11px] text-gray-700 truncate">{agent.name.replace(" Agent", "")}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-gray-400" /> Quick actions
                </h3>
                <div className="space-y-1.5">
                  {["Upload a new paper", "Connect a dataset", "Ask a research question", "Run suggested analysis"].map((qa) => (
                    <button key={qa} className="w-full text-left text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg px-2.5 py-2 transition-colors">
                      {qa}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
