"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Table2,
  BarChart2,
  GitCompare,
  Download,
  RefreshCw,
  Archive,
  Sparkles,
  Layers,
  ShieldCheck,
  BookOpen,
  Database,
  ArrowUpRight,
  Wand2,
  AlertTriangle,
  FlaskConical,
  ListChecks,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InfoCard, PlainCard, CompactPanel } from "@/components/layout/InfoCard"
import { MiniKaplanMeier, MiniForestPlot } from "@/components/layout/MiniCharts"
import {
  artifacts as initialArtifacts,
  suggestedVisualizations,
  artifactComparisons,
  type Artifact,
  type ArtifactStatus,
  type FigureConfig,
} from "@/lib/dummy-visualizations"
import { extractedPapers } from "@/lib/dummy-papers"
import { researchQuestions } from "@/lib/dummy-questions"
import { executedAnalyses } from "@/lib/dummy-analyses"
import { dummyRulebookEntries } from "@/lib/dummy-data"
import { useProject } from "@/components/layout/ProjectContext"

const ACCENT = "#635BFF"

const CHART_PRESETS = [
  "Kaplan-Meier plot",
  "Forest plot",
  "Baseline characteristics plot",
  "ROC curve",
  "Calibration curve",
  "Box / violin by group",
  "Biomarker distribution",
  "Longitudinal trend",
  "Waterfall plot",
] as const

const THEMES = ["Clinical (default)", "Minimal", "High contrast"] as const
const AXIS_SCALES = ["Linear", "Log"] as const
const EXPORT_SIZES = ["Small (800×600)", "Medium (1200×900)", "Large (1600×1200)"] as const

/* ---------------- status badge ---------------- */

const statusStyle: Record<ArtifactStatus, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  generated: "bg-sky-50 text-sky-700 border-sky-200",
  edited: "bg-amber-50 text-amber-700 border-amber-200",
  publication_ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  needs_rerun: "bg-amber-50 text-amber-700 border-amber-200",
  outdated: "bg-rose-50 text-rose-700 border-rose-200",
}
const statusLabel: Record<ArtifactStatus, string> = {
  draft: "Draft",
  generated: "Generated",
  edited: "Edited",
  publication_ready: "Publication Ready",
  needs_rerun: "Needs Rerun",
  outdated: "Outdated",
}

function ArtifactStatusBadge({ status }: { status: ArtifactStatus }) {
  return <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border", statusStyle[status])}>{statusLabel[status]}</span>
}

/* ---------------- artifact preview ---------------- */

function ArtifactPreview({ artifact }: { artifact: Artifact }) {
  if (artifact.kmPreview) {
    return <MiniKaplanMeier steps={artifact.kmPreview} />
  }
  if (artifact.forestPreview) {
    return <MiniForestPlot rows={artifact.forestPreview} />
  }
  return (
    <div className="h-16 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
      {artifact.kind === "table" ? (
        <Table2 className="w-5 h-5 text-gray-300" />
      ) : (
        <ImageIcon className="w-5 h-5 text-gray-300" />
      )}
    </div>
  )
}

/* ---------------- Gallery ---------------- */

function ArtifactCard({
  artifact,
  onSelect,
  selected,
  onRegenerate,
  onArchiveOutdated,
}: {
  artifact: Artifact
  onSelect: () => void
  selected: boolean
  onRegenerate: (id: string) => void
  onArchiveOutdated: (id: string) => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "bg-white border rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-3.5 cursor-pointer transition-colors",
        selected ? "border-[#635BFF]/40 shadow-[0_2px_10px_-2px_rgba(99,91,255,0.2)]" : "border-gray-200 hover:border-gray-300"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-violet-50 text-violet-700 border-violet-200">{artifact.kind === "figure" ? "Figure" : "Table"}</span>
        <ArtifactStatusBadge status={artifact.status} />
      </div>

      <p className="text-sm font-medium text-gray-900 leading-snug mb-1">{artifact.title}</p>
      <p className="text-[11px] text-gray-400 mb-2">{artifact.chartType}</p>

      <ArtifactPreview artifact={artifact} />

      <div className="mt-2 space-y-1">
        <p className="text-[11px] text-gray-400">Generated {artifact.generatedAt.slice(0, 10)}</p>
        <div className="flex flex-wrap gap-1">
          {artifact.usedVariables.slice(0, 3).map((v) => (
            <span key={v} className="text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-100 rounded px-1 py-0.5">{v}</span>
          ))}
          {artifact.usedVariables.length > 3 && <span className="text-[10px] text-gray-400">+{artifact.usedVariables.length - 3}</span>}
        </div>
        <div className="flex flex-wrap gap-1">
          {artifact.exportFormats.map((f) => (
            <span key={f} className="text-[10px] text-gray-400">{f}</span>
          )).reduce((acc: React.ReactNode[], el, i) => (i === 0 ? [el] : [...acc, <span key={`sep-${i}`} className="text-[10px] text-gray-300"> · </span>, el]), [])}
        </div>
      </div>

      {artifact.status === "outdated" && (
        <div className="mt-2 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1.5">
          <p className="text-[11px] text-rose-700 leading-relaxed flex items-start gap-1">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {artifact.outdatedReason ?? "This artifact may be outdated."}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <button onClick={(e) => { e.stopPropagation(); onRegenerate(artifact.id) }} className="text-[11px] font-medium flex items-center gap-1" style={{ color: ACCENT }}>
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
            <button onClick={(e) => { e.stopPropagation(); onArchiveOutdated(artifact.id) }} className="text-[11px] font-medium text-gray-500 hover:text-gray-800">Keep as archived</button>
          </div>
        </div>
      )}
    </div>
  )
}

function SuggestedCard({ s, blocked }: { s: (typeof suggestedVisualizations)[number]; blocked: boolean }) {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200">Suggested</span>
        {s.publicationReadyByDefault && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">Publication-ready preset</span>}
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">{s.chartType}</p>
      <p className="text-xs text-gray-600 leading-relaxed mb-2"><span className="font-medium text-gray-800">Why it fits — </span>{s.whyItFits}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {s.variablesUsed.map((v) => (
          <span key={v} className="text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-100 rounded px-1 py-0.5">{v}</span>
        ))}
      </div>
      {blocked && s.blockedReason && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">{s.blockedReason}</p>
      )}
      <button disabled={blocked} className={cn("text-xs font-medium px-3 py-1.5 rounded-lg", blocked ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-white")} style={!blocked ? { backgroundColor: ACCENT } : undefined}>
        Generate
      </button>
    </div>
  )
}

/* ---------------- Figure Builder ---------------- */

function FigureBuilderTab({
  questionId,
  paperId,
  figures,
  onSave,
}: {
  questionId: string
  paperId: string
  figures: Artifact[]
  onSave: (artifact: Partial<Artifact> & { id?: string }) => void
}) {
  const [loadedId, setLoadedId] = useState<string>("")
  const loaded = figures.find((f) => f.id === loadedId)
  const [chartType, setChartType] = useState<string>(CHART_PRESETS[0])
  const [config, setConfig] = useState<FigureConfig>({
    confidenceIntervals: true,
    theme: "Clinical (default)",
    legend: true,
  })
  const [axisScale, setAxisScale] = useState<string>(AXIS_SCALES[0])
  const [exportSize, setExportSize] = useState<string>(EXPORT_SIZES[1])
  const [labels, setLabels] = useState("")

  function loadExisting(id: string) {
    setLoadedId(id)
    const f = figures.find((x) => x.id === id)
    if (f) {
      setChartType(f.chartType)
      setConfig(f.figureConfig ?? { confidenceIntervals: true, theme: "Clinical (default)", legend: true })
    }
  }

  function save() {
    onSave({
      id: loaded?.id,
      title: loaded?.title ?? `${chartType} — draft`,
      kind: "figure",
      chartType,
      paperId,
      questionId,
      status: loaded ? "edited" : "draft",
      generatedAt: new Date().toISOString(),
      usedVariables: [config.xVariable, config.yVariable, config.groupVariable].filter(Boolean) as string[],
      exportFormats: ["PNG", "SVG"],
      figureConfig: config,
      kmPreview: loaded?.kmPreview,
      forestPreview: loaded?.forestPreview,
    })
  }

  return (
    <div className="space-y-4">
      <PlainCard>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Load existing figure to edit (optional)</p>
            <select value={loadedId} onChange={(e) => loadExisting(e.target.value)} className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15">
              <option value="">Start a new draft</option>
              {figures.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Chart type</p>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15">
              {CHART_PRESETS.map((c) => <option key={c} value={c}>{c}</option>)}
              <option disabled>Volcano plot (coming later)</option>
              <option disabled>CONSORT-style diagram (coming later)</option>
            </select>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Theme</p>
            <select value={config.theme} onChange={(e) => setConfig((c) => ({ ...c, theme: e.target.value as FigureConfig["theme"] }))} className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15">
              {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">X variable</p>
            <input value={config.xVariable ?? ""} onChange={(e) => setConfig((c) => ({ ...c, xVariable: e.target.value }))} className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Y variable</p>
            <input value={config.yVariable ?? ""} onChange={(e) => setConfig((c) => ({ ...c, yVariable: e.target.value }))} className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Group / color variable</p>
            <input value={config.groupVariable ?? ""} onChange={(e) => setConfig((c) => ({ ...c, groupVariable: e.target.value }))} className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Facet variable</p>
            <input value={config.facetVariable ?? ""} onChange={(e) => setConfig((c) => ({ ...c, facetVariable: e.target.value }))} className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Axis scale</p>
            <select value={axisScale} onChange={(e) => setAxisScale(e.target.value)} className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15">
              {AXIS_SCALES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Export size</p>
            <select value={exportSize} onChange={(e) => setExportSize(e.target.value)} className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15">
              {EXPORT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Labels / title (optional)</p>
            <input value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="Custom chart title" className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={config.confidenceIntervals} onChange={(e) => setConfig((c) => ({ ...c, confidenceIntervals: e.target.checked }))} id="ci-toggle" />
            <label htmlFor="ci-toggle" className="text-xs text-gray-600">Show confidence intervals</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={config.legend} onChange={(e) => setConfig((c) => ({ ...c, legend: e.target.checked }))} id="legend-toggle" />
            <label htmlFor="legend-toggle" className="text-xs text-gray-600">Show legend</label>
          </div>
        </div>
      </PlainCard>

      <InfoCard icon={LayoutGrid} iconColor="text-violet-600" title="Preview">
        {loaded?.kmPreview ? (
          <MiniKaplanMeier steps={loaded.kmPreview} />
        ) : loaded?.forestPreview ? (
          <MiniForestPlot rows={loaded.forestPreview} />
        ) : (
          <div className="h-24 flex flex-col items-center justify-center gap-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <ImageIcon className="w-5 h-5 text-gray-300" />
            <p className="text-[11px] text-gray-400">No rendered preview — connect the backend to generate {chartType.toLowerCase()}.</p>
          </div>
        )}
      </InfoCard>

      <Button size="sm" onClick={save} className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
        <Wand2 className="w-3.5 h-3.5" /> Save as Artifact
      </Button>
    </div>
  )
}

/* ---------------- Tables tab ---------------- */

function TableArtifactRow({ artifact, onUpdate }: { artifact: Artifact; onUpdate: (id: string, patch: Partial<Artifact>) => void }) {
  const cfg = artifact.tableConfig
  const [hiddenCols, setHiddenCols] = useState<string[]>([])

  if (!cfg || !artifact.resultColumns || !artifact.resultRows) return null

  const visibleCols = artifact.resultColumns.filter((c) => !hiddenCols.includes(c))
  const colIndexes = visibleCols.map((c) => artifact.resultColumns!.indexOf(c))

  const decimals = cfg.decimals
  function round(v: string | number) {
    if (typeof v === "number") return v.toFixed(decimals)
    return v
  }

  return (
    <InfoCard icon={Table2} iconColor="text-violet-600" title={artifact.title} action={<ArtifactStatusBadge status={artifact.status} />}>
      <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500">Decimals</span>
          <input
            type="number" min={0} max={4} value={cfg.decimals}
            onChange={(e) => onUpdate(artifact.id, { tableConfig: { ...cfg, decimals: Number(e.target.value) } })}
            className="w-12 text-xs text-gray-700 bg-white border border-gray-200 rounded px-1.5 py-1"
          />
        </div>
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <input type="checkbox" checked={cfg.showPValues} onChange={(e) => onUpdate(artifact.id, { tableConfig: { ...cfg, showPValues: e.target.checked } })} /> p-values
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <input type="checkbox" checked={cfg.showConfidenceIntervals} onChange={(e) => onUpdate(artifact.id, { tableConfig: { ...cfg, showConfidenceIntervals: e.target.checked } })} /> Confidence intervals
        </label>
        {artifact.resultColumns.map((c) => (
          <label key={c} className="flex items-center gap-1.5 text-[11px] text-gray-600">
            <input
              type="checkbox"
              checked={!hiddenCols.includes(c)}
              onChange={(e) => setHiddenCols((prev) => (e.target.checked ? prev.filter((x) => x !== c) : [...prev, c]))}
            /> {c}
          </label>
        ))}
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            {visibleCols.map((c) => <th key={c} className="text-left font-medium text-gray-500 py-1.5 pr-3">{c}</th>)}
            {cfg.showPValues && !artifact.resultColumns.includes("p-value") && <th className="text-left font-medium text-gray-500 py-1.5 pr-3">p-value</th>}
          </tr>
        </thead>
        <tbody>
          {artifact.resultRows.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              {colIndexes.map((ci) => <td key={ci} className="py-1.5 pr-3 text-gray-700 font-mono">{round(row[ci])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
        {["Word", "CSV", "LaTeX"].map((fmt) => (
          <button key={fmt} className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1">
            <Download className="w-3 h-3" /> {fmt}
          </button>
        ))}
      </div>
    </InfoCard>
  )
}

/* ---------------- Results tab ---------------- */

function headlineStat(table?: { columns: string[]; rows: (string | number)[][] }): string | null {
  if (!table || table.rows.length === 0) return null
  const row = table.rows[0]
  return table.columns.map((c, i) => `${c}: ${row[i]}`).join(" · ")
}

/* ---------------- Page ---------------- */

let artifactDraftCounter = 0

type MainTab = "gallery" | "figureBuilder" | "tables" | "results" | "compare" | "export"

export default function VisualizationStudioPage() {
  const { currentProjectId } = useProject()
  const visiblePapers = extractedPapers.filter((p) => p.projectId === currentProjectId)
  const [artifacts, setArtifacts] = useState<Artifact[]>(initialArtifacts)
  const [selectedPaperId, setSelectedPaperId] = useState<string>(visiblePapers[0]?.id ?? extractedPapers[0].id)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>("gallery")
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [focusedArtifactId, setFocusedArtifactId] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({})
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!visiblePapers.some((p) => p.id === selectedPaperId)) {
      setSelectedPaperId(visiblePapers[0]?.id ?? "")
      setSelectedQuestionId(null)
      setSelectedAnalysisId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId])

  const selectedPaper = extractedPapers.find((p) => p.id === selectedPaperId)
  const paperQuestions = researchQuestions.filter((q) => q.paperId === selectedPaperId)
  const selectedQuestion = researchQuestions.find((q) => q.id === selectedQuestionId) ?? null

  function analysesForQuestion(qId: string) {
    return executedAnalyses.filter((a) => a.researchQuestionId === qId)
  }

  const scopedArtifacts = artifacts.filter((a) => {
    if (selectedAnalysisId) return a.analysisId === selectedAnalysisId
    if (selectedQuestionId) return a.questionId === selectedQuestionId
    return a.paperId === selectedPaperId
  })

  const focusedArtifact = artifacts.find((a) => a.id === focusedArtifactId) ?? scopedArtifacts[0] ?? null

  function selectQuestion(qId: string) {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }))
    setSelectedQuestionId(qId)
    setSelectedAnalysisId(null)
    setFocusedArtifactId(null)
  }

  function selectAnalysis(qId: string, aId: string) {
    setSelectedQuestionId(qId)
    setSelectedAnalysisId(aId)
    setFocusedArtifactId(null)
  }

  function updateArtifact(id: string, patch: Partial<Artifact>) {
    setArtifacts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  function saveArtifact(patch: Partial<Artifact> & { id?: string }) {
    if (patch.id) {
      updateArtifact(patch.id, patch)
      setFocusedArtifactId(patch.id)
    } else {
      artifactDraftCounter += 1
      const id = `artifact_draft_${artifactDraftCounter}`
      const created: Artifact = {
        id,
        title: patch.title ?? "Untitled figure",
        kind: patch.kind ?? "figure",
        chartType: patch.chartType ?? "Custom chart",
        paperId: patch.paperId ?? selectedPaperId,
        questionId: patch.questionId ?? (selectedQuestionId ?? ""),
        analysisId: patch.analysisId,
        status: patch.status ?? "draft",
        generatedAt: patch.generatedAt ?? new Date().toISOString(),
        usedVariables: patch.usedVariables ?? [],
        exportFormats: patch.exportFormats ?? ["PNG"],
        figureConfig: patch.figureConfig,
        tableConfig: patch.tableConfig,
        kmPreview: patch.kmPreview,
        forestPreview: patch.forestPreview,
        resultColumns: patch.resultColumns,
        resultRows: patch.resultRows,
      }
      setArtifacts((prev) => [created, ...prev])
      setFocusedArtifactId(id)
    }
    setMainTab("gallery")
  }

  function regenerate(id: string) {
    updateArtifact(id, { status: "generated", generatedAt: new Date().toISOString(), outdatedReason: undefined })
  }
  function archiveOutdated(id: string) {
    updateArtifact(id, { status: "edited" })
  }

  function runExport(label: string) {
    setExportMessage(`${label} started (simulated) — connect the backend to generate real files.`)
  }

  const addMenuOptions = selectedQuestionId
    ? [
        { label: "From existing analysis", action: () => setMainTab("figureBuilder") },
        { label: "Build custom chart", action: () => setMainTab("figureBuilder") },
        { label: "Generate suggested chart", action: () => setMainTab("gallery") },
        { label: "Import external figure", action: () => setMainTab("gallery") },
        { label: "Create table", action: () => setMainTab("tables") },
      ]
    : [
        { label: "Select a question first", action: () => {} },
        { label: "Create new question", action: () => {}, href: "/question" },
        { label: "Show all paper artifacts", action: () => { setSelectedQuestionId(null); setSelectedAnalysisId(null); setMainTab("gallery") } },
      ]

  const figureArtifactsInScope = artifacts.filter((a) => a.kind === "figure" && (selectedQuestionId ? a.questionId === selectedQuestionId : a.paperId === selectedPaperId))
  const tableArtifactsInScope = scopedArtifacts.filter((a) => a.kind === "table")
  const suggestionsInScope = suggestedVisualizations.filter((s) => (selectedQuestionId ? s.questionId === selectedQuestionId : paperQuestions.some((q) => q.id === s.questionId)))
  const analysesInScope = selectedQuestionId ? analysesForQuestion(selectedQuestionId) : executedAnalyses.filter((a) => paperQuestions.some((q) => q.id === a.researchQuestionId))
  const comparisonsInScope = artifactComparisons.filter((c) => (selectedQuestionId ? c.questionId === selectedQuestionId : paperQuestions.some((q) => q.id === c.questionId)))

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left rail */}
      <div className="w-72 shrink-0 border-r border-gray-200 flex flex-col bg-white">
        <div className="px-4 py-4 border-b border-gray-200 space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-600" /> Visualization Studio
          </h2>
          <select
            value={selectedPaperId}
            onChange={(e) => { setSelectedPaperId(e.target.value); setSelectedQuestionId(null); setSelectedAnalysisId(null); setFocusedArtifactId(null) }}
            className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
          >
            {visiblePapers.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-3 py-3 space-y-2">
            <button
              onClick={() => { setSelectedQuestionId(null); setSelectedAnalysisId(null); setFocusedArtifactId(null) }}
              className={cn(
                "w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-lg text-[11px] font-medium",
                !selectedQuestionId ? "bg-violet-50/60 text-violet-700" : "text-gray-400 hover:bg-gray-50"
              )}
            >
              <LayoutGrid className="w-3 h-3" /> All paper artifacts
            </button>

            {paperQuestions.map((q) => {
              const isExpanded = expandedQuestions[q.id]
              const qAnalyses = analysesForQuestion(q.id)
              const qArtifactCount = artifacts.filter((a) => a.questionId === q.id).length
              return (
                <div key={q.id}>
                  <button
                    onClick={() => selectQuestion(q.id)}
                    className={cn(
                      "w-full flex items-center gap-2 text-left px-2 py-2 rounded-lg",
                      selectedQuestionId === q.id && !selectedAnalysisId ? "bg-violet-50/60" : "hover:bg-gray-50"
                    )}
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    <span className="text-xs font-medium text-gray-800 truncate flex-1">{q.question}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{qArtifactCount}</span>
                  </button>
                  {isExpanded && (
                    <div className="ml-5 mt-0.5 space-y-0.5 border-l border-gray-100 pl-3">
                      {qAnalyses.length === 0 && <p className="text-[11px] text-gray-400 py-1.5">No analyses yet.</p>}
                      {qAnalyses.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => selectAnalysis(q.id, a.id)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded-lg border transition-colors flex items-center justify-between gap-1",
                            selectedAnalysisId === a.id ? "bg-violet-50/60 border-[#635BFF]/25" : "hover:bg-gray-50 border-transparent"
                          )}
                        >
                          <span className={cn("text-[11px] leading-snug truncate", selectedAnalysisId === a.id ? "text-gray-900 font-medium" : "text-gray-600")}>{a.name}</span>
                          {a.status === "running" && <span className="text-[9px] text-sky-600 shrink-0">running</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <div className="px-3 py-3 border-t border-gray-200 relative">
          {addMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1.5 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-10">
              {addMenuOptions.map((opt) => (
                opt.href ? (
                  <Link key={opt.label} href={opt.href} onClick={() => setAddMenuOpen(false)} className="block w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                    {opt.label}
                  </Link>
                ) : (
                  <button key={opt.label} onClick={() => { opt.action(); setAddMenuOpen(false) }} className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                    {opt.label}
                  </button>
                )
              ))}
            </div>
          )}
          <Button size="sm" onClick={() => setAddMenuOpen((v) => !v)} className="w-full text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
            <Plus className="w-3.5 h-3.5" /> Add Visualization
          </Button>
        </div>
      </div>

      {/* Center workspace */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-gray-200 bg-[#FAFAFB]">
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <h1 className="text-sm font-semibold text-gray-900">
            {selectedQuestion ? selectedQuestion.question : selectedPaper?.title}
          </h1>
          <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-lg p-1 gap-1 mt-3 flex-wrap">
            {([
              ["gallery", "Gallery"],
              ["figureBuilder", "Figure Builder"],
              ["tables", "Tables"],
              ["results", "Results"],
              ["compare", "Compare"],
              ["export", "Export"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMainTab(value)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-md transition-all",
                  mainTab === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5">
            {mainTab === "gallery" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {scopedArtifacts.map((a) => (
                    <ArtifactCard
                      key={a.id}
                      artifact={a}
                      selected={focusedArtifact?.id === a.id}
                      onSelect={() => setFocusedArtifactId(a.id)}
                      onRegenerate={regenerate}
                      onArchiveOutdated={archiveOutdated}
                    />
                  ))}
                </div>
                {scopedArtifacts.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No artifacts generated yet for this scope.</p>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-violet-500" /> Suggested for this question</p>
                  {suggestionsInScope.length === 0 ? (
                    <p className="text-sm text-gray-400">No suggestions yet — select a question to see chart recommendations.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {suggestionsInScope.map((s) => (
                        <SuggestedCard key={s.id} s={s} blocked={!!s.blockedReason} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {mainTab === "figureBuilder" && (
              <FigureBuilderTab
                questionId={selectedQuestionId ?? paperQuestions[0]?.id ?? ""}
                paperId={selectedPaperId}
                figures={figureArtifactsInScope}
                onSave={saveArtifact}
              />
            )}

            {mainTab === "tables" && (
              <div className="space-y-4">
                {tableArtifactsInScope.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No tables for this scope yet.</p>}
                {tableArtifactsInScope.map((a) => (
                  <TableArtifactRow key={a.id} artifact={a} onUpdate={updateArtifact} />
                ))}
              </div>
            )}

            {mainTab === "results" && (
              <div className="space-y-4">
                {analysesInScope.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No analyses in this scope yet.</p>}
                {analysesInScope.map((a) => {
                  const linkedArtifacts = artifacts.filter((art) => art.analysisId === a.id)
                  const stat = headlineStat(a.resultTable)
                  return (
                    <InfoCard key={a.id} icon={BarChart2} iconColor="text-emerald-600" title={a.name} action={<span className="text-[10px] text-gray-400">{a.status}</span>}>
                      {stat ? (
                        <>
                          <p className="text-xs font-mono text-gray-700 mb-2">{stat}</p>
                          {a.interpretation && <p className="text-sm text-gray-700 leading-relaxed mb-3">{a.interpretation}</p>}
                          {linkedArtifacts.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                              {linkedArtifacts.map((art) => (
                                <button key={art.id} onClick={() => { setFocusedArtifactId(art.id); setMainTab("gallery") }} className="text-[11px] font-medium px-2 py-1 rounded border border-gray-200 text-gray-600 hover:border-[#635BFF]/30 flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" /> {art.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">Run completed (simulated) — no results yet, this analysis is still {a.status}.</p>
                      )}
                    </InfoCard>
                  )
                })}
              </div>
            )}

            {mainTab === "compare" && (
              <div className="space-y-3">
                {comparisonsInScope.map((c) => (
                  <InfoCard key={c.id} icon={GitCompare} iconColor="text-violet-600" title={c.label}>
                    {c.available ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{c.leftLabel}</p>
                            <p className="text-sm font-mono text-gray-800">{c.leftValue}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{c.rightLabel}</p>
                            <p className="text-sm font-mono text-gray-800">{c.rightValue}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-gray-100">{c.difference}</p>
                        {c.possibleReasons && c.possibleReasons.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Possible reasons</p>
                            {c.possibleReasons.map((r, i) => <p key={i} className="text-xs text-gray-600 leading-relaxed">• {r}</p>)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">{c.unavailableReason}</p>
                    )}
                  </InfoCard>
                ))}
              </div>
            )}

            {mainTab === "export" && (
              <div className="space-y-4">
                <InfoCard icon={ListChecks} iconColor="text-violet-600" title="Artifacts in scope">
                  <div className="space-y-1.5">
                    {scopedArtifacts.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 text-xs text-gray-700">
                        <input type="checkbox" defaultChecked /> {a.title} <ArtifactStatusBadge status={a.status} />
                      </label>
                    ))}
                    {scopedArtifacts.length === 0 && <p className="text-xs text-gray-400">No artifacts in scope.</p>}
                  </div>
                </InfoCard>

                <InfoCard icon={Download} iconColor="text-emerald-600" title="Export bundles">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Export selected",
                      "Export all figures for question",
                      "Export all artifacts for paper",
                      "Manuscript-ready package",
                      "PowerPoint assets",
                      "Word tables",
                      "LaTeX tables",
                      "Reproducibility bundle",
                    ].map((label) => (
                      <button key={label} onClick={() => runExport(label)} className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-[#635BFF]/30 text-left">
                        {label}
                      </button>
                    ))}
                  </div>
                  {exportMessage && (
                    <p className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 mt-3">{exportMessage}</p>
                  )}
                </InfoCard>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right panel */}
      <div className="w-[300px] shrink-0 flex flex-col overflow-hidden bg-[#FAFAFB]">
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-3">
            <CompactPanel title="Selected Artifact" icon={Layers}>
              {focusedArtifact ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-gray-800">{focusedArtifact.title}</p>
                  <p className="text-[11px] text-gray-500">{focusedArtifact.chartType}</p>
                  <ArtifactStatusBadge status={focusedArtifact.status} />
                </div>
              ) : (
                <p className="text-[11px] text-gray-400">No artifact selected.</p>
              )}
            </CompactPanel>

            <CompactPanel title="Paper Evidence" icon={FileText}>
              {selectedQuestion?.evidenceMap && selectedQuestion.evidenceMap.length > 0 ? (
                <p className="text-[11px] text-gray-600 leading-relaxed">&ldquo;{selectedQuestion.evidenceMap[0].quote}&rdquo; <span className="text-gray-400">({selectedQuestion.evidenceMap[0].pageRef})</span></p>
              ) : (
                <p className="text-[11px] text-gray-400">No evidence linked yet.</p>
              )}
              {selectedPaper && (
                <Link href="/papers" className="text-[11px] font-medium inline-flex items-center gap-1 mt-2" style={{ color: ACCENT }}>
                  View {selectedPaper.title.slice(0, 28)}... <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </CompactPanel>

            <CompactPanel title="Question Context" icon={FlaskConical}>
              {selectedQuestion ? (
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-700 leading-relaxed">{selectedQuestion.question}</p>
                  {selectedQuestion.feasibility && (
                    <p className="text-[11px] text-gray-400 mt-1">Dataset support: {selectedQuestion.feasibility.datasetSupport}</p>
                  )}
                  <Link href="/question" className="text-[11px] font-medium inline-flex items-center gap-1 mt-1" style={{ color: ACCENT }}>
                    Open in Research Question <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400">Select a question to see its context.</p>
              )}
            </CompactPanel>

            <CompactPanel title="Analysis Metadata" icon={Database}>
              {focusedArtifact?.analysisId ? (
                (() => {
                  const a = executedAnalyses.find((x) => x.id === focusedArtifact.analysisId)
                  if (!a) return <p className="text-[11px] text-gray-400">Source analysis not found.</p>
                  return (
                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-700">{a.scriptUsed}</p>
                      <p className="text-[11px] text-gray-400">Agent: {a.agent}</p>
                      {a.reproducibility && <p className="text-[11px] text-gray-400">{a.reproducibility.scriptVersion}</p>}
                    </div>
                  )
                })()
              ) : (
                <p className="text-[11px] text-gray-400">No source analysis linked.</p>
              )}
            </CompactPanel>

            <CompactPanel title="Rulebook" icon={BookOpen}>
              <div className="space-y-2">
                {dummyRulebookEntries.filter((r) => r.projectId === currentProjectId).slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-violet-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-gray-600 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </CompactPanel>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
