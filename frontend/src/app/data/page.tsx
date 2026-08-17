"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  FileWarning,
  Link2,
  Layers,
  ListChecks,
  GitBranch,
  ShieldAlert,
  Scale,
  Network,
  HelpCircle,
  Wand2,
  Activity,
  BookOpen,
  Send,
  Map,
  CircleSlash,
  Eraser,
  CheckCircle,
  XCircle,
  Lock,
  History,
  FileSpreadsheet,
  Hash,
  GitCommitHorizontal,
  ShieldQuestion,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InfoCard, PlainCard, CompactPanel } from "@/components/layout/InfoCard"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { SENSITIVITY_OPTIONS } from "@/lib/sensitivity"
import {
  type ProfiledDataset,
  type VariableType,
  type VariableRole,
  type LibraryStatus,
  type QualityCheck,
  type SensitivityLevel,
} from "@/lib/dummy-datasets"
import { useProject } from "@/components/layout/ProjectContext"
import { api, ApiError, type RulebookEntryApi } from "@/lib/api"
import type { ExecutedAnalysis } from "@/lib/dummy-analyses"

const ACCENT = "#635BFF"

/* ---------------- shared bits ---------------- */

function DatasetStatusIcon({ status }: { status: string }) {
  if (status === "profiled") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
  if (status === "processing") return <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0 animate-pulse" />
  return <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
}

const libraryStatusStyle: Record<LibraryStatus, string> = {
  uploaded: "bg-gray-100 text-gray-600 border-gray-200",
  profiling: "bg-sky-50 text-sky-700 border-sky-200",
  profiled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  needs_cleaning: "bg-amber-50 text-amber-700 border-amber-200",
  analysis_ready: "bg-violet-50 text-violet-700 border-violet-200",
  used_in_analysis: "bg-violet-100 text-violet-800 border-violet-300",
}
const libraryStatusLabel: Record<LibraryStatus, string> = {
  uploaded: "Uploaded",
  profiling: "Profiling",
  profiled: "Profiled",
  needs_cleaning: "Needs Cleaning",
  analysis_ready: "Analysis Ready",
  used_in_analysis: "Used in Analysis",
}

function LibraryStatusBadge({ status }: { status: LibraryStatus }) {
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border", libraryStatusStyle[status])}>
      {libraryStatusLabel[status]}
    </span>
  )
}

const typeColors: Record<VariableType, string> = {
  continuous: "bg-sky-50 text-sky-700 border-sky-200",
  binary: "bg-emerald-50 text-emerald-700 border-emerald-200",
  categorical: "bg-violet-50 text-violet-700 border-violet-200",
  ordinal: "bg-orange-50 text-orange-700 border-orange-200",
  time_to_event: "bg-violet-50 text-violet-700 border-violet-200",
  date: "bg-gray-100 text-gray-600 border-gray-200",
  identifier: "bg-gray-100 text-gray-600 border-gray-200",
  text: "bg-gray-100 text-gray-600 border-gray-200",
}

const roleLabel: Record<VariableRole, string> = {
  patient_id: "Patient ID",
  time_index: "Time index",
  outcome: "Outcome",
  event_indicator: "Event indicator",
  exposure: "Exposure",
  treatment_group: "Treatment group",
  covariate: "Covariate",
  biomarker: "Biomarker",
  demographic: "Demographic",
  date: "Date",
  text: "Text",
  ignore: "Ignore",
  unassigned: "Not yet assigned",
}

function correlationColor(r: number) {
  const abs = Math.abs(r)
  if (abs >= 0.5) return r > 0 ? "text-emerald-600" : "text-rose-600"
  if (abs >= 0.3) return r > 0 ? "text-sky-600" : "text-orange-600"
  return "text-gray-400"
}

const readinessStyle = {
  ready: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  warning: { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertCircle },
  blocked: { cls: "bg-rose-50 text-rose-700 border-rose-200", icon: Lock },
}

function MiniBar({ bins, labels }: { bins: number[]; labels?: string[] }) {
  const max = Math.max(...bins)
  return (
    <div>
      <div className="flex items-end gap-0.5 h-16">
        {bins.map((b, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: `${Math.max((b / max) * 100, 4)}%`, backgroundColor: ACCENT, opacity: 0.7 }} title={`${b}`} />
        ))}
      </div>
      {labels && (
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-gray-400">{labels[0]}</span>
          <span className="text-[9px] text-gray-400">{labels[labels.length - 1]}</span>
        </div>
      )}
    </div>
  )
}

function MiniBoxplot({ box }: { box: { min: number; q1: number; median: number; q3: number; max: number } }) {
  const range = box.max - box.min || 1
  const pct = (v: number) => ((v - box.min) / range) * 100
  return (
    <div className="relative h-8 flex items-center">
      <div className="absolute h-px bg-gray-300 w-full" />
      <div
        className="absolute h-4 rounded border"
        style={{ left: `${pct(box.q1)}%`, width: `${pct(box.q3) - pct(box.q1)}%`, backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}60` }}
      />
      <div className="absolute w-0.5 h-5" style={{ left: `${pct(box.median)}%`, backgroundColor: ACCENT }} />
      <div className="absolute text-[9px] text-gray-400" style={{ left: "0%" }}>{box.min}</div>
      <div className="absolute text-[9px] text-gray-400" style={{ left: "calc(100% - 14px)" }}>{box.max}</div>
    </div>
  )
}

/* ---------------- Overview tab ---------------- */

function ScoreCard({ label, value, suffix, tone }: { label: string; value: number | string; suffix?: string; tone: "emerald" | "violet" | "amber" | "sky" }) {
  const toneCls = { emerald: "text-emerald-600", violet: "text-violet-600", amber: "text-amber-600", sky: "text-sky-600" }[tone]
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      <p className={cn("text-2xl font-semibold tracking-tight", toneCls)}>{value}{suffix}</p>
    </div>
  )
}

function OverviewTab({ dataset, onGoTo }: { dataset: ProfiledDataset; onGoTo: (tab: string) => void }) {
  const outcomes = dataset.variables?.filter((v) => v.role === "outcome").map((v) => v.name) ?? []
  const exposures = dataset.variables?.filter((v) => v.role === "exposure" || v.role === "biomarker" || v.role === "treatment_group").map((v) => v.name) ?? []
  const covariates = dataset.variables?.filter((v) => v.role === "covariate").map((v) => v.name) ?? []

  return (
    <div className="space-y-4">
      {dataset.summary && (
        <InfoCard icon={Sparkles} iconColor="text-violet-600" title="Dataset Summary">
          <p className="text-sm text-gray-700 leading-relaxed">{dataset.summary}</p>
        </InfoCard>
      )}

      <PlainCard>
        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Rows</p>
            <p className="text-xs text-gray-700">{dataset.rows.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Columns</p>
            <p className="text-xs text-gray-700">{dataset.columns}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Patients</p>
            <p className="text-xs text-gray-700">{dataset.patients ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Timepoints</p>
            <p className="text-xs text-gray-700">{dataset.timepoints ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Missing cells</p>
            <p className="text-xs text-gray-700">{dataset.totalMissingPercent ?? "—"}%</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Duplicate IDs</p>
            <p className="text-xs text-gray-700">{dataset.duplicateRows ?? "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Potential outcomes</p>
            <p className="text-xs text-gray-700 font-mono">{outcomes.join(", ") || "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Potential exposures</p>
            <p className="text-xs text-gray-700 font-mono">{exposures.join(", ") || "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Potential covariates</p>
            <p className="text-xs text-gray-700 font-mono">{covariates.join(", ") || "—"}</p>
          </div>
        </div>
      </PlainCard>

      <div className="grid grid-cols-4 gap-4">
        <ScoreCard label="Data Quality Score" value={dataset.dataQualityScore ?? "—"} suffix={dataset.dataQualityScore ? "%" : ""} tone="emerald" />
        <ScoreCard label="Analysis Readiness" value={dataset.analysisReadinessScore ?? "—"} suffix={dataset.analysisReadinessScore ? "%" : ""} tone="violet" />
        <ScoreCard label="Missingness Risk" value={dataset.missingnessRisk ?? "—"} tone="amber" />
        <ScoreCard label="Variable Mapping" value={dataset.variableMappingProgress ?? "—"} suffix={dataset.variableMappingProgress ? "%" : ""} tone="sky" />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }} onClick={() => onGoTo("variables")}>
          <Wand2 className="w-3.5 h-3.5" /> Profile Dataset
        </Button>
        <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => onGoTo("variables")}>
          Generate Data Dictionary
        </Button>
        <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => onGoTo("readiness")}>
          Map to Paper
        </Button>
        <Link href="/analysis">
          <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Create Analysis</Button>
        </Link>
      </div>
    </div>
  )
}

/* ---------------- Variables tab ---------------- */

function VariablesTab({ dataset }: { dataset: ProfiledDataset }) {
  if (!dataset.variables || dataset.variables.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">No variables profiled yet.</p>
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-4 py-2.5">Variable</th>
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2.5">Type</th>
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2.5">Role</th>
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2.5">Missing</th>
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2.5">Values/Range</th>
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2.5">Used As</th>
            <th className="px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {dataset.variables.map((v) => (
            <tr key={v.name} className="group border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
              <td className="px-4 py-2.5 font-mono text-gray-900">{v.name}</td>
              <td className="px-3 py-2.5">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", typeColors[v.type])}>{v.type.replace("_", " ")}</span>
              </td>
              <td className="px-3 py-2.5 text-gray-600">{roleLabel[v.role]}</td>
              <td className="px-3 py-2.5">
                <span className={v.missingPercent > 10 ? "text-amber-600 font-medium" : "text-gray-500"}>{v.missingPercent}%</span>
              </td>
              <td className="px-3 py-2.5 text-gray-600">{v.range}</td>
              <td className="px-3 py-2.5 text-gray-500">{v.usedAs}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button title="Edit Meaning" className="p-1 hover:text-gray-900 text-gray-400"><Eraser className="w-3.5 h-3.5" /></button>
                  <button title="Set Role" className="p-1 hover:text-violet-600 text-gray-400"><Layers className="w-3.5 h-3.5" /></button>
                  <button title="Map to Paper Variable" className="p-1 hover:text-sky-600 text-gray-400"><Map className="w-3.5 h-3.5" /></button>
                  <button title="Add Transformation" className="p-1 hover:text-amber-600 text-gray-400"><Wand2 className="w-3.5 h-3.5" /></button>
                  <button title="Exclude From Analysis" className="p-1 hover:text-rose-600 text-gray-400"><CircleSlash className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------- Quality tab ---------------- */

const severityStyle: Record<QualityCheck["severity"], string> = {
  info: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
}
const categoryLabel: Record<QualityCheck["category"], string> = {
  missingness: "Missingness",
  outliers: "Outliers",
  duplicates: "Duplicates",
  invalid_values: "Invalid Values",
  type_problems: "Type Problems",
  clinical_range: "Clinical Range",
  inconsistent_coding: "Inconsistent Coding",
  data_leakage: "Data Leakage",
  small_groups: "Small Group Sizes",
}

function QualityTab({ dataset }: { dataset: ProfiledDataset }) {
  if (!dataset.qualityChecks || dataset.qualityChecks.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">No quality checks have run yet.</p>
  }
  const grouped = dataset.qualityChecks.reduce<Record<string, QualityCheck[]>>((acc, c) => {
    acc[c.category] = acc[c.category] ?? []
    acc[c.category].push(c)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([category, checks]) => (
        <InfoCard key={category} icon={category === "missingness" ? FileWarning : category === "outliers" ? AlertCircle : ListChecks} iconColor="text-amber-500" title={categoryLabel[category as QualityCheck["category"]]}>
          <div className="space-y-2.5">
            {checks.map((c, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", c.severity === "info" ? "bg-emerald-500" : c.severity === "warning" ? "bg-amber-500" : "bg-rose-500")} />
                  <div>
                    {c.variable && <span className="text-xs font-mono text-gray-900 mr-1.5">{c.variable}:</span>}
                    <span className="text-xs text-gray-600 leading-relaxed">{c.issue}</span>
                    {c.rowsAffected !== undefined && <span className="text-[11px] text-gray-400 ml-1.5">({c.rowsAffected} rows)</span>}
                  </div>
                </div>
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0", severityStyle[c.severity])}>{c.severity}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      ))}
    </div>
  )
}

/* ---------------- Distributions tab ---------------- */

function DistributionsTab({ dataset }: { dataset: ProfiledDataset }) {
  const candidates = (dataset.variables ?? []).filter((v) => v.distribution)
  const [selectedName, setSelectedName] = useState(candidates[0]?.name)
  const selected = candidates.find((v) => v.name === selectedName)

  if (candidates.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">No distribution data available for this dataset yet.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {candidates.map((v) => (
          <button
            key={v.name}
            onClick={() => setSelectedName(v.name)}
            className={cn(
              "text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors",
              selectedName === v.name ? "border-[#635BFF]/40 bg-violet-50/60 text-gray-900" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {v.name}
          </button>
        ))}
      </div>

      {selected && (
        <>
          <InfoCard icon={Activity} iconColor="text-violet-600" title={`Distribution — ${selected.name}`}>
            <div className="space-y-4">
              {selected.distribution?.bins && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Histogram</p>
                  <MiniBar bins={selected.distribution.bins} labels={selected.distribution.binLabels} />
                </div>
              )}
              {selected.distribution?.boxplot && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Boxplot</p>
                  <MiniBoxplot box={selected.distribution.boxplot} />
                </div>
              )}
              {selected.distribution?.valueCounts && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Value Counts</p>
                  <div className="space-y-1.5">
                    {selected.distribution.valueCounts.map((vc) => {
                      const max = Math.max(...selected.distribution!.valueCounts!.map((x) => x.count))
                      return (
                        <div key={vc.label}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{vc.label}</span>
                            <span className="text-gray-400">{vc.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(vc.count / max) * 100}%`, backgroundColor: ACCENT }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </InfoCard>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Transform</Button>
            <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Winsorize</Button>
            <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Log-transform</Button>
            <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Create Binary Variable</Button>
            <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Exclude Outliers</Button>
          </div>
          <p className="text-[11px] text-gray-400">Transformations are proposed steps added to the Cleaning pipeline — the raw column is never edited directly.</p>
        </>
      )}
    </div>
  )
}

/* ---------------- Relationships tab ---------------- */

const balanceStyle = {
  balanced: "bg-emerald-50 text-emerald-700 border-emerald-200",
  imbalanced: "bg-amber-50 text-amber-700 border-amber-200",
  missingness_differs: "bg-rose-50 text-rose-700 border-rose-200",
}

function RelationshipsTab({ dataset }: { dataset: ProfiledDataset }) {
  return (
    <div className="space-y-4">
      {dataset.correlations && (
        <InfoCard icon={Network} iconColor="text-sky-600" title="Correlation Matrix">
          <div className="space-y-2">
            {dataset.correlations.map((c) => (
              <div key={`${c.varA}-${c.varB}`} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-1.5 text-xs font-mono text-gray-700">
                  <span>{c.varA}</span>
                  <span className="text-gray-300">↔</span>
                  <span>{c.varB}</span>
                </div>
                <span className={cn("text-xs font-semibold", correlationColor(c.r))}>r = {c.r.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {dataset.groupBalanceChecks && (
        <InfoCard icon={Scale} iconColor="text-orange-500" title={dataset.groupBalanceChecks.label}>
          <div className="space-y-2.5">
            {dataset.groupBalanceChecks.checks.map((c) => (
              <div key={c.variable} className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-mono text-gray-900">{c.variable}</span>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{c.detail}</p>
                </div>
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 capitalize", balanceStyle[c.status])}>{c.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Add as Covariate</Button>
        <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Create Baseline Table</Button>
        <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Run Group Comparison</Button>
        <Link href="/analysis">
          <Button size="sm" className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
            <Send className="w-3.5 h-3.5" /> Send to Analysis
          </Button>
        </Link>
      </div>
    </div>
  )
}

/* ---------------- Cleaning tab ---------------- */

function CleaningTab({ dataset }: { dataset: ProfiledDataset }) {
  const [steps, setSteps] = useState(dataset.cleaningSteps ?? [])

  if (steps.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">No cleaning pipeline defined for this dataset yet.</p>
  }

  function toggleDisabled(id: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status: s.status === "disabled" ? "pending" : "disabled" } : s)))
  }
  function apply(id: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status: "applied" } : s)))
  }

  return (
    <div className="space-y-3">
      <InfoCard icon={GitCommitHorizontal} iconColor="text-violet-600" title="Cleaning Pipeline">
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={s.id} className={cn("flex items-center gap-3 p-3 rounded-lg border", s.status === "disabled" ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-200")}>
              <span className="text-xs text-gray-400 font-mono w-5 shrink-0">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
              </div>
              <span className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0",
                s.status === "applied" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                s.status === "disabled" ? "bg-gray-100 text-gray-500 border-gray-200" :
                "bg-amber-50 text-amber-700 border-amber-200"
              )}>
                {s.status}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button className="text-[11px] font-medium text-gray-400 hover:text-gray-700">Preview</button>
                {s.status !== "applied" && (
                  <button onClick={() => apply(s.id)} className="text-[11px] font-medium" style={{ color: ACCENT }}>Apply</button>
                )}
                <button onClick={() => toggleDisabled(s.id)} className="text-[11px] font-medium text-gray-400 hover:text-gray-700">
                  {s.status === "disabled" ? "Enable" : "Disable"}
                </button>
                <button className="text-[11px] font-medium text-gray-400 hover:text-gray-700">Edit</button>
                <button className="text-[11px] font-medium text-gray-400 hover:text-gray-700">Log</button>
              </div>
            </div>
          ))}
        </div>
      </InfoCard>
      <p className="text-[11px] text-gray-400 px-1">
        The raw dataset stays untouched — applying steps creates a new versioned dataset (e.g. <span className="font-mono">v2 — cleaned</span>) in the Dataset Library on the left.
      </p>
    </div>
  )
}

/* ---------------- Readiness tab ---------------- */

function ReadinessTab({ dataset }: { dataset: ProfiledDataset }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {dataset.analysisReadiness && dataset.analysisReadiness.length > 0 && (
        <InfoCard icon={ListChecks} iconColor="text-violet-600" title="Analysis Readiness Matrix">
          <div className="space-y-2">
            {dataset.analysisReadiness.map((a) => {
              const { cls, icon: Icon } = readinessStyle[a.status]
              const isOpen = expanded === a.analysisType
              return (
                <div key={a.analysisType} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : a.analysisType)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cls.includes("emerald") ? "#059669" : cls.includes("amber") ? "#d97706" : "#e11d48" }} />
                      <span className="text-xs font-medium text-gray-900 truncate">{a.analysisType}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400">{a.missingPiece}</span>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", cls)}>{a.status}</span>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-3 py-3 border-t border-gray-100 bg-gray-50/60 space-y-2">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Required Variables</p>
                        <p className="text-xs text-gray-700 font-mono">{a.requiredVariables.join(", ")}</p>
                      </div>
                      {a.matchedVariables.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Matched</p>
                          <p className="text-xs text-emerald-700 font-mono">{a.matchedVariables.join(", ")}</p>
                        </div>
                      )}
                      {a.missingVariables.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Missing</p>
                          <p className="text-xs text-rose-700 font-mono">{a.missingVariables.join(", ")}</p>
                        </div>
                      )}
                      {a.warnings.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Warnings</p>
                          {a.warnings.map((w, i) => <p key={i} className="text-xs text-amber-700 leading-relaxed">{w}</p>)}
                        </div>
                      )}
                      <Link href="/analysis">
                        <Button size="sm" className="text-white text-xs gap-1.5 mt-1" style={{ backgroundColor: ACCENT }}>
                          <Send className="w-3.5 h-3.5" /> Create Analysis
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </InfoCard>
      )}

      {dataset.paperAlignment && dataset.paperAlignment.length > 0 && (
        <InfoCard icon={Link2} iconColor="text-sky-600" title="Paper-Dataset Alignment">
          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2">Paper Variable</th>
                  <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2">Dataset Match</th>
                  <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {dataset.paperAlignment.map((p) => (
                  <tr key={p.paperVariable} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2 text-gray-700">{p.paperVariable}</td>
                    <td className="px-3 py-2 font-mono text-gray-600">{p.datasetMatch}</td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize",
                        p.status === "matched" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        p.status === "needs_review" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-rose-50 text-rose-700 border-rose-200"
                      )}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/papers" className="text-xs font-medium inline-flex items-center gap-1 mt-3" style={{ color: ACCENT }}>
            View linked paper <Link2 className="w-3 h-3" />
          </Link>
        </InfoCard>
      )}
    </div>
  )
}

/* ---------------- Ask About This Dataset ---------------- */

const genericPrompts = [
  "What variables look like outcomes?",
  "Which variables have the most missing data?",
  "Can this dataset support survival analysis?",
  "What cleaning steps should I do first?",
  "Which variables match the paper?",
  "What analyses are ready to run?",
]

function AskDrawer({ dataset, open, onClose }: { dataset: ProfiledDataset; open: boolean; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [customQuestion, setCustomQuestion] = useState("")
  const [showStub, setShowStub] = useState(false)
  const suggested = dataset.suggestedQuestions ?? []
  const asked = new Set(suggested.map((s) => s.question))
  const extra = genericPrompts.filter((q) => !asked.has(q))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative w-[420px] h-full bg-white border-l border-gray-200 shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" /> Ask About This Dataset
          </h2>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-700">Close</button>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {suggested.map((s, i) => (
                <button
                  key={s.question}
                  onClick={() => { setActiveIdx(i); setShowStub(false) }}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
                    activeIdx === i ? "border-[#635BFF]/40 bg-violet-50/60 text-gray-900" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {s.question}
                </button>
              ))}
              {extra.map((q) => (
                <button key={q} onClick={() => { setActiveIdx(null); setShowStub(true) }} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
                  {q}
                </button>
              ))}
            </div>

            {activeIdx !== null && suggested[activeIdx] && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Answer</p>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{suggested[activeIdx].answer}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border font-medium",
                    suggested[activeIdx].confidence === "high" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {suggested[activeIdx].confidence} confidence
                  </span>
                  <div className="flex items-center gap-3">
                    {suggested[activeIdx].relatedActions.map((a) =>
                      a === "Create Analysis" ? (
                        <Link key={a} href="/analysis" className="text-[11px] font-medium" style={{ color: ACCENT }}>{a}</Link>
                      ) : (
                        <button key={a} className="text-[11px] font-medium text-gray-500 hover:text-gray-800">{a}</button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {showStub && (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldQuestion className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Free-form answers require the agent system, which isn&apos;t wired up yet. The preset questions above demonstrate the operational, source-linked answer format this drawer will use once connected.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-gray-200 flex items-center gap-2">
          <input
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && customQuestion.trim()) { setActiveIdx(null); setShowStub(true) } }}
            placeholder="Type a question about this dataset..."
            className="flex-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
          />
          <button
            onClick={() => { if (customQuestion.trim()) { setActiveIdx(null); setShowStub(true) } }}
            className="text-xs font-medium px-3 py-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: ACCENT }}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Right panel ---------------- */

function RightPanel({ dataset, onAsk }: { dataset: ProfiledDataset; onAsk: () => void }) {
  const { currentProjectId } = useProject()
  const [linkedAnalyses, setLinkedAnalyses] = useState<ExecutedAnalysis[]>([])
  const [projectRulebookEntries, setProjectRulebookEntries] = useState<RulebookEntryApi[]>([])

  useEffect(() => {
    if (!currentProjectId) return
    let cancelled = false
    api.analyses.list(currentProjectId).then((data) => {
      if (!cancelled) setLinkedAnalyses(data.slice(0, 3))
    })
    api.rulebookEntries.list(currentProjectId).then((data) => {
      if (!cancelled) setProjectRulebookEntries(data)
    })
    return () => {
      cancelled = true
    }
  }, [currentProjectId])

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4 space-y-3">
        <button
          onClick={onAsk}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Ask About This Dataset
        </button>

        <CompactPanel title="Agent Findings" icon={Activity}>
          {dataset.agentTrace && dataset.agentTrace.length > 0 ? (
            <div className="space-y-2.5">
              {dataset.agentTrace.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex flex-col items-center pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    {i < dataset.agentTrace!.length - 1 && <span className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 -mt-0.5">
                    <p className="text-[11px] text-gray-700 leading-snug"><span className="font-medium">{t.agent}</span> {t.action}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">No agent activity yet.</p>
          )}
        </CompactPanel>

        <CompactPanel title="Paper Variable Matches" icon={Link2}>
          {dataset.paperAlignment && dataset.paperAlignment.length > 0 ? (
            <div className="space-y-1.5">
              {dataset.paperAlignment.slice(0, 4).map((p) => (
                <div key={p.paperVariable} className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-600 truncate">{p.paperVariable}</span>
                  <span className={cn(
                    "text-[10px] font-medium px-1 py-0.5 rounded shrink-0",
                    p.status === "matched" ? "text-emerald-600" : p.status === "needs_review" ? "text-amber-600" : "text-rose-600"
                  )}>
                    {p.status === "matched" ? "✓" : p.status === "needs_review" ? "?" : "✕"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">No paper linked yet.</p>
          )}
        </CompactPanel>

        <CompactPanel title="Rulebook" icon={BookOpen}>
          {projectRulebookEntries.length > 0 ? (
            <div className="space-y-2">
              {projectRulebookEntries.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-violet-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-gray-600 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">No rules yet.</p>
          )}
        </CompactPanel>

        <CompactPanel title="Warnings" icon={ShieldAlert}>
          {dataset.qualityChecks && dataset.qualityChecks.filter((c) => c.severity !== "info").length > 0 ? (
            <div className="space-y-1.5">
              {dataset.qualityChecks.filter((c) => c.severity !== "info").slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">{c.issue}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">No warnings.</p>
          )}
        </CompactPanel>

        <CompactPanel title="Run History" icon={History}>
          <div className="space-y-2">
            {linkedAnalyses.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-600 truncate">{a.name}</span>
                <span className="text-[10px] text-gray-400 shrink-0">{a.status}</span>
              </div>
            ))}
          </div>
        </CompactPanel>
      </div>
    </ScrollArea>
  )
}

/* ---------------- Dataset detail (center) ---------------- */

function DatasetDetail({ dataset }: { dataset: ProfiledDataset }) {
  const [tab, setTab] = useState("overview")

  if (dataset.libraryStatus === "uploaded" || dataset.libraryStatus === "profiling") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{dataset.libraryStatus === "profiling" ? "Profiling in progress" : "Dataset not yet profiled"}</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Run the Data Agent to detect schema, variable types, missingness, and data quality issues for this dataset.
          </p>
        </div>
        <Button size="sm" className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
          <Sparkles className="w-3.5 h-3.5" /> Profile dataset
        </Button>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="px-6 py-5 space-y-1">
        <div className="mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-gray-900 leading-snug font-mono">{dataset.filename}</h2>
            <LibraryStatusBadge status={dataset.libraryStatus} />
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs italic" style={{ color: ACCENT }}>{dataset.version}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{dataset.rows.toLocaleString()} rows</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{dataset.columns} columns</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{dataset.fileSizeKb} KB</span>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="bg-gray-100 border border-gray-200 h-8 mb-5 flex-wrap">
            {[
              ["overview", "Overview"],
              ["variables", "Variables"],
              ["quality", "Quality"],
              ["distributions", "Distributions"],
              ["relationships", "Relationships"],
              ["cleaning", "Cleaning"],
              ["readiness", "Readiness"],
            ].map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="text-xs h-6 px-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0"><OverviewTab dataset={dataset} onGoTo={setTab} /></TabsContent>
          <TabsContent value="variables" className="mt-0"><VariablesTab dataset={dataset} /></TabsContent>
          <TabsContent value="quality" className="mt-0"><QualityTab dataset={dataset} /></TabsContent>
          <TabsContent value="distributions" className="mt-0"><DistributionsTab dataset={dataset} /></TabsContent>
          <TabsContent value="relationships" className="mt-0"><RelationshipsTab dataset={dataset} /></TabsContent>
          <TabsContent value="cleaning" className="mt-0"><CleaningTab dataset={dataset} /></TabsContent>
          <TabsContent value="readiness" className="mt-0"><ReadinessTab dataset={dataset} /></TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}

/* ---------------- Page ---------------- */

const addDatasetOptions = [
  { key: "upload", label: "Upload file (CSV/Excel)", icon: Upload },
  { key: "redcap", label: "Connect REDCap export", icon: FileSpreadsheet },
  { key: "id", label: "Add by dataset ID", icon: Hash },
] as const

let draftCounter = 0

export default function DataUnderstandingPage() {
  const { currentProjectId } = useProject()
  const [datasets, setDatasets] = useState<ProfiledDataset[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string>("")
  const [addOpen, setAddOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [dialogOption, setDialogOption] = useState<(typeof addDatasetOptions)[number] | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [sensitivityLevel, setSensitivityLevel] = useState<SensitivityLevel>("restricted")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProfiledDataset | null>(null)
  const [deleteWarnings, setDeleteWarnings] = useState<string[]>([])
  const [loadingDeleteWarnings, setLoadingDeleteWarnings] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const selectedDataset = datasets.find((d) => d.id === selected)

  useEffect(() => {
    if (!currentProjectId) return
    let cancelled = false
    setLoading(true)
    api.datasets.list(currentProjectId).then((data) => {
      if (cancelled) return
      setDatasets(data)
      setSelected((prev) => (data.some((d) => d.id === prev) ? prev : (data[0]?.id ?? "")))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [currentProjectId])

  function openAddDialog(option: (typeof addDatasetOptions)[number]) {
    setDialogOption(option)
    setPendingFile(null)
    setSensitivityLevel("restricted")
    setUploadError(null)
    setAddOpen(false)
  }

  async function handleConfirmAdd() {
    if (!dialogOption || !currentProjectId) return
    setUploading(true)
    setUploadError(null)
    try {
      let created: ProfiledDataset
      if (dialogOption.key === "upload") {
        if (!pendingFile) return
        const formData = new FormData()
        formData.append("projectId", currentProjectId)
        formData.append("sensitivityLevel", sensitivityLevel)
        formData.append("file", pendingFile)
        created = await api.datasets.upload(formData)
      } else {
        draftCounter += 1
        const draft: Partial<ProfiledDataset> = {
          id: `dataset_draft_${draftCounter}`,
          projectId: currentProjectId,
          filename: `untitled_dataset_${draftCounter}.csv`,
          status: "pending",
          libraryStatus: "uploaded",
          version: "v1 — raw",
          rows: 0,
          columns: 0,
          fileSizeKb: 0,
          sensitivityLevel,
        }
        created = await api.datasets.create(draft)
      }
      setDatasets((prev) => [created, ...prev])
      setSelected(created.id)
      setDialogOption(null)
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Something went wrong — please try again.")
    } finally {
      setUploading(false)
    }
  }

  async function openDeleteDialog(dataset: ProfiledDataset) {
    setDeleteTarget(dataset)
    setDeleteWarnings([])
    setLoadingDeleteWarnings(true)
    try {
      const d = await api.datasets.dependents(dataset.id)
      const lines: string[] = []
      if (d.derivedVersionCount > 0) {
        lines.push(`${d.derivedVersionCount} dataset version${d.derivedVersionCount === 1 ? "" : "s"} derived from this one will lose that reference and become independent.`)
      }
      lines.push("Karna doesn't yet track which analyses or research questions were built using a specific dataset — review those manually if this dataset was used anywhere.")
      setDeleteWarnings(lines)
    } catch {
      setDeleteWarnings([])
    } finally {
      setLoadingDeleteWarnings(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.datasets.remove(deleteTarget.id)
      setDatasets((prev) => {
        const next = prev.filter((d) => d.id !== deleteTarget.id)
        if (selected === deleteTarget.id) {
          setSelected(next[0]?.id ?? "")
        }
        return next
      })
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">

      {/* Left panel — dataset library */}
      <div className="w-72 shrink-0 border-r border-gray-200 flex flex-col bg-white">
        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-600" /> Dataset Library
          </h2>
          <button onClick={() => setAddOpen((v) => !v)} className="text-xs text-gray-500 hover:text-gray-900 h-7 px-2 flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {addOpen && (
          <div className="px-3 py-2 border-b border-gray-200 space-y-1">
            {addDatasetOptions.map((option) => (
              <button key={option.key} onClick={() => openAddDialog(option)} className="w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                <option.icon className="w-3.5 h-3.5 text-gray-400" /> {option.label}
              </button>
            ))}
          </div>
        )}

        <Dialog open={dialogOption !== null} onOpenChange={(open) => !open && setDialogOption(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogOption?.label}</DialogTitle>
              <DialogDescription>
                {dialogOption?.key === "upload"
                  ? "Choose a CSV or Excel file to upload. It will be encrypted at rest."
                  : "This will add a placeholder entry — full processing for this source isn't built yet."}
              </DialogDescription>
            </DialogHeader>

            {dialogOption?.key === "upload" && (
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
                className="text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
              />
            )}

            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Sensitivity level</div>
              {SENSITIVITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer",
                    sensitivityLevel === opt.value ? "border-sky-300 bg-sky-50" : "border-gray-200"
                  )}
                >
                  <input
                    type="radio"
                    name="sensitivityLevel"
                    className="mt-0.5"
                    checked={sensitivityLevel === opt.value}
                    onChange={() => setSensitivityLevel(opt.value)}
                  />
                  <span>
                    <span className="font-medium text-gray-800">{opt.label}</span>
                    <span className="block text-gray-500">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>

            {uploadError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{uploadError}</p>}

            <DialogFooter>
              <Button
                onClick={handleConfirmAdd}
                disabled={uploading || (dialogOption?.key === "upload" && !pendingFile)}
              >
                {uploading ? "Adding…" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          itemLabel={deleteTarget?.filename ?? ""}
          warningLines={deleteWarnings}
          loadingWarnings={loadingDeleteWarnings}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-3 py-3 space-y-1">
            {loading && <p className="text-xs text-gray-400 px-2 py-2">Loading datasets…</p>}
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className={cn(
                  "group w-full rounded-lg transition-colors border flex items-start",
                  selected === dataset.id
                    ? "bg-violet-50/60 border-[#635BFF]/25 shadow-[0_2px_8px_-2px_rgba(99,91,255,0.18)]"
                    : "hover:bg-gray-50 border-transparent"
                )}
              >
                <button onClick={() => setSelected(dataset.id)} className="flex-1 min-w-0 text-left px-3 py-3">
                  <div className="flex items-start gap-2">
                    <DatasetStatusIcon status={dataset.status} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs leading-snug line-clamp-2 font-mono",
                        selected === dataset.id ? "text-gray-900 font-medium" : "text-gray-600"
                      )}>
                        {dataset.filename}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {dataset.version}{dataset.derivedFrom ? " · derived" : ""}
                      </p>
                      <div className="mt-1.5">
                        <LibraryStatusBadge status={dataset.libraryStatus} />
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => openDeleteDialog(dataset)}
                  className="shrink-0 p-1 mt-3 mr-2 opacity-0 group-hover:opacity-100 hover:text-rose-600 text-gray-300"
                  title="Delete dataset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center — dataset detail */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-gray-200 bg-[#FAFAFB]">
        {selectedDataset && <DatasetDetail dataset={selectedDataset} />}
      </div>

      {/* Right — context panel */}
      <div className="w-[300px] shrink-0 flex flex-col overflow-hidden bg-[#FAFAFB]">
        {selectedDataset && <RightPanel dataset={selectedDataset} onAsk={() => setAskOpen(true)} />}
      </div>

      {selectedDataset && <AskDrawer dataset={selectedDataset} open={askOpen} onClose={() => setAskOpen(false)} />}
    </div>
  )
}
