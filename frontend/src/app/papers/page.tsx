"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Database,
  Link2,
  FlaskConical,
  BookOpen,
  BarChart2,
  ChevronRight,
  ExternalLink,
  XCircle,
  Plus,
  FilePlus2,
  Hash,
  Globe,
  Paperclip,
  FileSearch,
  HelpCircle,
  Target,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Wand2,
  Activity,
  Map,
  CircleSlash,
  Star,
  Send,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InfoCard, PlainCard, CompactPanel } from "@/components/layout/InfoCard"
import {
  type ExtractedPaper,
  type VariableRole,
  type LibraryStatus,
  type MatchStatus,
} from "@/lib/dummy-papers"
import type { ProfiledDataset } from "@/lib/dummy-datasets"
import { useProject } from "@/components/layout/ProjectContext"
import { api, type RulebookEntryApi } from "@/lib/api"

const ACCENT = "#635BFF"

/* ---------------- shared bits ---------------- */

function PaperStatusIcon({ status }: { status: string }) {
  if (status === "processed") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
  if (status === "processing") return <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0 animate-pulse" />
  return <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
}

const libraryStatusStyle: Record<LibraryStatus, string> = {
  processing: "bg-sky-50 text-sky-700 border-sky-200",
  extracted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  needs_review: "bg-amber-50 text-amber-700 border-amber-200",
  mapped_to_dataset: "bg-violet-50 text-violet-700 border-violet-200",
  used_in_analysis: "bg-violet-100 text-violet-800 border-violet-300",
}
const libraryStatusLabel: Record<LibraryStatus, string> = {
  processing: "Processing",
  extracted: "Extracted",
  needs_review: "Needs Review",
  mapped_to_dataset: "Mapped to Dataset",
  used_in_analysis: "Used in Analysis",
}

function LibraryStatusBadge({ status }: { status: LibraryStatus }) {
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border", libraryStatusStyle[status])}>
      {libraryStatusLabel[status]}
    </span>
  )
}

const matchStatusStyle: Record<MatchStatus | "matched" | "possible" | "missing", string> = {
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  matched: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  possible: "bg-amber-50 text-amber-700 border-amber-200",
  missing: "bg-rose-50 text-rose-700 border-rose-200",
}

function MatchBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border capitalize", matchStatusStyle[status as keyof typeof matchStatusStyle] ?? "bg-gray-100 text-gray-600 border-gray-200")}>
      {status.replace("_", " ")}
    </span>
  )
}

function VariableRoleBadge({ role }: { role: VariableRole }) {
  const map: Record<VariableRole, { label: string; cls: string }> = {
    primary_outcome: { label: "Primary outcome", cls: "bg-violet-50 text-violet-700 border-violet-200" },
    secondary_outcome: { label: "Secondary outcome", cls: "bg-sky-50 text-sky-700 border-sky-200" },
    independent: { label: "Independent var", cls: "bg-orange-50 text-orange-700 border-orange-200" },
    covariate: { label: "Covariate", cls: "bg-gray-100 text-gray-600 border-gray-200" },
    identifier: { label: "Identifier", cls: "bg-gray-100 text-gray-600 border-gray-200" },
    time_variable: { label: "Time variable", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    event_indicator: { label: "Event indicator", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  }
  const { label, cls } = map[role] ?? { label: role, cls: "bg-gray-100 text-gray-600 border-gray-200" }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${cls}`}>
      {label}
    </span>
  )
}

function ReplicabilityBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500"
  const labelColor = score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-rose-600"
  const label = score >= 70 ? "High" : score >= 40 ? "Moderate" : "Low"
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Overall replicability score</span>
        <span className={`font-semibold ${labelColor}`}>{label} ({score}%)</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function MethodBlock({
  title,
  content,
  pageRef,
  confidence,
}: {
  title: string
  content: string | string[]
  pageRef?: string
  confidence?: "high" | "medium" | "low"
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-4 py-3.5">
        {Array.isArray(content) ? (
          <ul className="space-y-1.5">
            {content.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                <span className="text-sm text-gray-700 leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          {pageRef && <span>{pageRef}</span>}
          {confidence && (
            <span className={cn(
              "px-1.5 py-0.5 rounded border font-medium",
              confidence === "high" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              confidence === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-rose-50 text-rose-700 border-rose-200"
            )}>
              {confidence} confidence
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[11px] font-medium text-gray-400 hover:text-gray-700">Edit</button>
          <button className="text-[11px] font-medium" style={{ color: ACCENT }}>Send to Analysis</button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Overview tab ---------------- */

function OverviewTab({ paper }: { paper: ExtractedPaper }) {
  return (
    <div className="space-y-4">
      <InfoCard icon={FileText} iconColor="text-violet-600" title="Paper Identity">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Authors</p>
            <p className="text-xs text-gray-700">{paper.authors}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Year</p>
            <p className="text-xs text-gray-700">{paper.year}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Journal</p>
            <p className="text-xs text-gray-700 italic">{paper.journal}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">DOI</p>
            {paper.doi ? (
              <a href="#" className="text-xs flex items-center gap-1" style={{ color: ACCENT }}>
                {paper.doi} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ) : (
              <p className="text-xs text-gray-400">—</p>
            )}
          </div>
        </div>
      </InfoCard>

      {paper.researchQuestion && (
        <InfoCard icon={HelpCircle} iconColor="text-amber-500" title="Structured Summary">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Research Question</p>
              <p className="text-sm text-gray-700 leading-relaxed">{paper.researchQuestion}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2 border-t border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Study Design</p>
                <p className="text-xs text-gray-700">{paper.studyType}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Outcome</p>
                <p className="text-xs text-gray-700">{paper.primaryEndpoint}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Population</p>
                <p className="text-xs text-gray-700 leading-relaxed">{paper.population}</p>
              </div>
              {paper.claims && paper.claims[0] && (
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Main Finding</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{paper.claims[0].finding} ({paper.claims[0].statistic}{paper.claims[0].pValue ? `, ${paper.claims[0].pValue}` : ""})</p>
                </div>
              )}
              {paper.limitations && (
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Limitations</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{paper.limitations[0]}</p>
                </div>
              )}
            </div>
          </div>
        </InfoCard>
      )}

      {paper.keyTakeaways && (
        <InfoCard icon={Lightbulb} iconColor="text-amber-500" title="Key Takeaways">
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <Activity className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed"><span className="font-medium text-gray-800">Clinical relevance — </span>{paper.keyTakeaways.clinicalRelevance}</p>
            </div>
            <div className="flex items-start gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed"><span className="font-medium text-gray-800">Statistical approach — </span>{paper.keyTakeaways.statisticalApproach}</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed"><span className="font-medium text-gray-800">What can be reused — </span>{paper.keyTakeaways.reusable}</p>
            </div>
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed"><span className="font-medium text-gray-800">What needs caution — </span>{paper.keyTakeaways.caution}</p>
            </div>
          </div>
        </InfoCard>
      )}

      <div className="flex items-center gap-2">
        {paper.status === "pending" ? (
          <Button size="sm" className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
            <Sparkles className="w-3.5 h-3.5" /> Extract Methods
          </Button>
        ) : (
          <>
            <Link href="/question">
              <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Create Research Question
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------------- Methods tab ---------------- */

function MethodsTab({ paper }: { paper: ExtractedPaper }) {
  if (paper.status === "pending") {
    return <p className="text-sm text-gray-400 text-center py-12">Methods have not been extracted yet — run Extract Methods from the Overview tab.</p>
  }
  return (
    <div className="space-y-3">
      {paper.studyType && <MethodBlock title="Study Design" content={paper.studyType} pageRef={paper.methodsPageRef} confidence={paper.extractionConfidence} />}
      {paper.population && <MethodBlock title="Population" content={paper.population} pageRef={paper.methodsPageRef} confidence={paper.extractionConfidence} />}
      {paper.inclusionCriteria && <MethodBlock title="Inclusion Criteria" content={paper.inclusionCriteria} pageRef={paper.methodsPageRef} confidence={paper.extractionConfidence} />}
      {paper.exclusionCriteria && <MethodBlock title="Exclusion Criteria" content={paper.exclusionCriteria} pageRef={paper.methodsPageRef} confidence={paper.extractionConfidence} />}
      {paper.primaryEndpoint && <MethodBlock title="Primary Endpoint" content={paper.primaryEndpoint} pageRef={paper.methodsPageRef} confidence={paper.extractionConfidence} />}
      {paper.statisticalMethods && <MethodBlock title="Statistical Tests" content={paper.statisticalMethods} pageRef={paper.methodsPageRef} confidence={paper.extractionConfidence} />}
      {paper.softwareUsed && <MethodBlock title="Software Used" content={paper.softwareUsed} pageRef={paper.methodsPageRef} confidence={paper.extractionConfidence} />}
    </div>
  )
}

/* ---------------- Variables tab ---------------- */

function VariablesTab({ paper }: { paper: ExtractedPaper }) {
  if (!paper.variables || paper.variables.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">No variables extracted for this paper type.</p>
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-4 py-2.5">Variable</th>
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2.5">Role</th>
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2.5">Type</th>
            <th className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-3 py-2.5">Dataset Match</th>
            <th className="px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {paper.variables.map((v) => (
            <tr key={v.name} className="group border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
              <td className="px-4 py-2.5 font-mono text-gray-900">{v.name}</td>
              <td className="px-3 py-2.5"><VariableRoleBadge role={v.role} /></td>
              <td className="px-3 py-2.5 text-gray-600">{v.type.replace("_", " ")}</td>
              <td className="px-3 py-2.5">
                {v.datasetMatch ? (
                  <span className="flex items-center gap-1 font-mono text-emerald-600">
                    <Link2 className="w-3 h-3" /> {v.datasetMatch}
                  </span>
                ) : (
                  <span className="text-gray-400">missing</span>
                )}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button title="Map to Dataset Variable" className="p-1 hover:text-gray-900 text-gray-400"><Map className="w-3.5 h-3.5" /></button>
                  <button title="Mark as Missing" className="p-1 hover:text-rose-600 text-gray-400"><CircleSlash className="w-3.5 h-3.5" /></button>
                  <button title="Add to Rulebook" className="p-1 hover:text-violet-600 text-gray-400"><BookOpen className="w-3.5 h-3.5" /></button>
                  <button title="Use in Analysis" className="p-1 hover:text-emerald-600 text-gray-400"><Send className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------- Results tab ---------------- */

function ResultsTab({ paper }: { paper: ExtractedPaper }) {
  if (!paper.claims || paper.claims.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">No results extracted for this paper yet.</p>
  }
  return (
    <div className="space-y-3">
      {paper.claims.map((c, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4">
          <p className="text-sm text-gray-900 font-medium leading-relaxed mb-2">{c.finding}</p>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-mono bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded border border-violet-200">{c.statistic}</span>
            {c.ci && <span className="text-[11px] font-mono bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{c.ci}</span>}
            {c.pValue && <span className="text-[11px] font-mono bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{c.pValue}</span>}
          </div>
          {c.model && <p className="text-xs text-gray-500 mb-1">Model: {c.model}{c.covariates ? ` (adjusted for ${c.covariates.join(", ")})` : ""}</p>}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">Source: {c.sourceRef}</span>
            <div className="flex items-center gap-3">
              <button className="text-[11px] font-medium text-gray-400 hover:text-gray-700">Compare With My Analysis</button>
              <button className="text-[11px] font-medium" style={{ color: ACCENT }}>Add to Replication Target</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Replication tab ---------------- */

function ReplicationTab({ paper }: { paper: ExtractedPaper }) {
  const rr = paper.replicationReadiness
  return (
    <div className="space-y-4">
      {paper.methodCard && (
        <div className="rounded-2xl border" style={{ borderColor: `${ACCENT}40`, backgroundColor: `${ACCENT}08` }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: `${ACCENT}30` }}>
            <Wand2 className="w-4 h-4" style={{ color: ACCENT }} />
            <h3 className="text-sm font-semibold text-gray-900">Method Card — {paper.methodCard.name}</h3>
          </div>
          <div className="px-4 py-4 grid grid-cols-2 gap-x-8 gap-y-2.5">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Used in Paper</p>
              <p className="text-xs text-gray-700">{paper.methodCard.usedInPaper ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Dataset Readiness</p>
              <p className="text-xs text-gray-700">{paper.methodCard.datasetReadiness}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Endpoint</p>
              <p className="text-xs text-gray-700">{paper.methodCard.endpoint}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Exposure</p>
              <p className="text-xs text-gray-700">{paper.methodCard.exposure}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Covariates</p>
              <p className="text-xs text-gray-700">{paper.methodCard.covariates.join(", ") || "None"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Reported Result</p>
              <p className="text-xs text-gray-700 font-mono">{paper.methodCard.reportedResult}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border-t" style={{ borderColor: `${ACCENT}30` }}>
            <Link href="/analysis">
              <Button size="sm" className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
                <Send className="w-3.5 h-3.5" /> Create Matching Analysis
              </Button>
            </Link>
            <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Edit Method Card</Button>
            <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Save to Rulebook</Button>
          </div>
        </div>
      )}

      {rr ? (
        <>
          {paper.replicabilityScore !== undefined && (
            <PlainCard>
              <ReplicabilityBar score={paper.replicabilityScore} />
            </PlainCard>
          )}

          <InfoCard icon={Target} iconColor="text-violet-600" title="Replication Readiness">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-900 font-medium">Endpoint</p>
                  <p className="text-xs text-gray-500">{rr.endpoint.paper} → <span className="font-mono">{rr.endpoint.dataset}</span></p>
                </div>
                <MatchBadge status={rr.endpoint.status} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-900 font-medium">Exposure</p>
                  <p className="text-xs text-gray-500">{rr.exposure.paper} → <span className="font-mono">{rr.exposure.dataset}</span></p>
                </div>
                <MatchBadge status={rr.exposure.status} />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-900 font-medium mb-1.5">Covariates</p>
                <div className="space-y-1.5">
                  {rr.covariates.map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-mono">{c.name}</span>
                      <MatchBadge status={c.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard icon={Sparkles} iconColor="text-violet-600" title="Recommended Replication Analysis">
            <div className="space-y-1.5">
              {rr.recommendedAnalyses.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </InfoCard>

          {rr.warnings.length > 0 && (
            <div className="bg-amber-50/40 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200/60">
                <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <h3 className="text-sm font-semibold text-amber-800">Warnings</h3>
              </div>
              <div className="px-4 py-4 space-y-1.5">
                {rr.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link href="/analysis">
              <Button size="sm" className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
                <Send className="w-3.5 h-3.5" /> Send to Analysis Execution
              </Button>
            </Link>
            <Button size="sm" variant="outline" className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">Generate Replication Plan</Button>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <Database className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            {paper.datasetConnectionSummary ?? "This paper type isn't a primary dataset study, so direct replication isn't applicable — use it as an external benchmark instead."}
          </p>
        </div>
      )}
    </div>
  )
}

/* ---------------- Concepts tab ---------------- */

function ConceptsTab({ paper }: { paper: ExtractedPaper }) {
  if (!paper.concepts || paper.concepts.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">No related concepts surfaced for this paper yet.</p>
  }
  const supportStyle: Record<string, string> = {
    supported: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    not_supported: "bg-gray-100 text-gray-500 border-gray-200",
  }
  const supportLabel: Record<string, string> = { supported: "Dataset supports this", partial: "Partially supported", not_supported: "Not supported by dataset" }
  return (
    <div className="space-y-3">
      {paper.concepts.map((c) => (
        <div key={c.name} className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", supportStyle[c.datasetSupport])}>{supportLabel[c.datasetSupport]}</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-1.5"><span className="font-medium text-gray-800">Why it matters — </span>{c.whyItMatters}</p>
          <p className="text-xs text-gray-600 leading-relaxed"><span className="font-medium text-gray-800">How to check — </span>{c.howToCheck}</p>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Questions tab ("Ask About This Paper") ---------------- */

const genericPrompts = [
  "What statistical tests did this paper use?",
  "What variables should I map to my dataset?",
  "Can I replicate this paper?",
  "What are the major limitations?",
  "What assumptions should I check?",
  "What analysis should I run next?",
]

function QuestionsTab({ paper }: { paper: ExtractedPaper }) {
  const [activeAnswerIdx, setActiveAnswerIdx] = useState<number | null>(null)
  const [customQuestion, setCustomQuestion] = useState("")
  const [showStub, setShowStub] = useState(false)

  const suggested = paper.suggestedQuestions ?? []
  const askedQuestions = new Set(suggested.map((s) => s.question))
  const extraPrompts = genericPrompts.filter((q) => !askedQuestions.has(q))

  return (
    <div className="space-y-4">
      <InfoCard icon={HelpCircle} iconColor="text-amber-500" title="Ask About This Paper">
        <div className="flex flex-wrap gap-2 mb-3">
          {suggested.map((s, i) => (
            <button
              key={s.question}
              onClick={() => {
                setActiveAnswerIdx(i)
                setShowStub(false)
              }}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
                activeAnswerIdx === i ? "border-[#635BFF]/40 bg-violet-50/60 text-gray-900" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {s.question}
            </button>
          ))}
          {extraPrompts.map((q) => (
            <button
              key={q}
              onClick={() => {
                setActiveAnswerIdx(null)
                setShowStub(true)
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customQuestion.trim()) {
                setActiveAnswerIdx(null)
                setShowStub(true)
              }
            }}
            placeholder="Type a question about this paper..."
            className="flex-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
          />
          <button
            onClick={() => {
              if (customQuestion.trim()) {
                setActiveAnswerIdx(null)
                setShowStub(true)
              }
            }}
            className="text-xs font-medium px-3 py-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: ACCENT }}
          >
            Ask
          </button>
        </div>
      </InfoCard>

      {activeAnswerIdx !== null && suggested[activeAnswerIdx] && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Answer</p>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{suggested[activeAnswerIdx].answer}</p>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span>Sources: {suggested[activeAnswerIdx].sources}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded border font-medium",
                suggested[activeAnswerIdx].confidence === "high" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                suggested[activeAnswerIdx].confidence === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-rose-50 text-rose-700 border-rose-200"
              )}>
                {suggested[activeAnswerIdx].confidence} confidence
              </span>
            </div>
            {suggested[activeAnswerIdx].relatedActions.length > 0 && (
              <div className="flex items-center gap-3">
                {suggested[activeAnswerIdx].relatedActions.map((action) =>
                  action === "Create Analysis" ? (
                    <Link key={action} href="/analysis" className="text-[11px] font-medium" style={{ color: ACCENT }}>{action}</Link>
                  ) : (
                    <button key={action} className="text-[11px] font-medium text-gray-500 hover:text-gray-800">{action}</button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showStub && (
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-4 flex items-start gap-3">
          <ShieldQuestion className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Free-form answers require the agent system, which isn&apos;t wired up yet. The questions above with canned answers demonstrate the source-grounded answer format this panel will use once it&apos;s connected.
          </p>
        </div>
      )}
    </div>
  )
}

/* ---------------- Right panel ---------------- */

function RightPanel({ paper }: { paper: ExtractedPaper }) {
  const { currentProjectId } = useProject()
  const [dataset, setDataset] = useState<ProfiledDataset | null>(null)
  const [projectRulebookEntries, setProjectRulebookEntries] = useState<RulebookEntryApi[]>([])

  useEffect(() => {
    if (!currentProjectId) return
    let cancelled = false
    api.datasets.list(currentProjectId).then((datasets) => {
      if (!cancelled) setDataset(datasets[0] ?? null)
    })
    api.rulebookEntries.list(currentProjectId).then((entries) => {
      if (!cancelled) setProjectRulebookEntries(entries)
    })
    return () => {
      cancelled = true
    }
  }, [currentProjectId])

  const warnings = paper.replicationReadiness?.warnings ?? paper.limitations ?? []

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4 space-y-3">
        <CompactPanel title="Linked Dataset" icon={Database}>
          {dataset ? (
            <Link href="/data" className="block group">
              <p className="text-xs font-mono text-gray-700 group-hover:text-gray-900">{dataset.filename}</p>
              <p className="text-[11px] text-gray-400 mt-1">{dataset.rows} rows · {dataset.columns} columns</p>
            </Link>
          ) : (
            <p className="text-[11px] text-gray-400">No dataset linked yet.</p>
          )}
        </CompactPanel>

        <CompactPanel title="Extracted Methods" icon={FlaskConical}>
          {paper.statisticalMethods && paper.statisticalMethods.length > 0 ? (
            <div className="space-y-1.5">
              {paper.statisticalMethods.slice(0, 4).map((m) => (
                <div key={m} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-sky-400 shrink-0" />
                  <p className="text-[11px] text-gray-600">{m}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">Not extracted yet.</p>
          )}
        </CompactPanel>

        <CompactPanel title="Rulebook" icon={BookOpen}>
          {projectRulebookEntries.length > 0 ? (
            <div className="space-y-2">
              {projectRulebookEntries.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-violet-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-gray-600 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">No rules yet.</p>
          )}
        </CompactPanel>

        <CompactPanel title="Agent Trace" icon={Activity}>
          {paper.agentTrace && paper.agentTrace.length > 0 ? (
            <div className="space-y-2.5">
              {paper.agentTrace.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex flex-col items-center pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    {i < paper.agentTrace!.length - 1 && <span className="w-px flex-1 bg-gray-200 mt-1" />}
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

        <CompactPanel title="Warnings" icon={ShieldAlert}>
          {warnings.length > 0 ? (
            <div className="space-y-1.5">
              {warnings.slice(0, 4).map((w, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">No warnings.</p>
          )}
        </CompactPanel>
      </div>
    </ScrollArea>
  )
}

/* ---------------- Paper detail (center) ---------------- */

function PaperDetail({ paper }: { paper: ExtractedPaper }) {
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="px-6 py-5 space-y-1">
        <div className="mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-gray-900 leading-snug">{paper.title}</h2>
            <LibraryStatusBadge status={paper.libraryStatus} />
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs italic" style={{ color: ACCENT }}>{paper.journal}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{paper.year}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{paper.pageCount} pages</span>
            {paper.extractionConfidence && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">Extraction confidence: {paper.extractionConfidence}</span>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-gray-100 border border-gray-200 h-8 mb-5 flex-wrap">
            {[
              ["overview", "Overview"],
              ["methods", "Methods"],
              ["variables", "Variables"],
              ["results", "Results"],
              ["replication", "Replication"],
              ["concepts", "Concepts"],
              ["questions", "Questions"],
            ].map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="text-xs h-6 px-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0"><OverviewTab paper={paper} /></TabsContent>
          <TabsContent value="methods" className="mt-0"><MethodsTab paper={paper} /></TabsContent>
          <TabsContent value="variables" className="mt-0"><VariablesTab paper={paper} /></TabsContent>
          <TabsContent value="results" className="mt-0"><ResultsTab paper={paper} /></TabsContent>
          <TabsContent value="replication" className="mt-0"><ReplicationTab paper={paper} /></TabsContent>
          <TabsContent value="concepts" className="mt-0"><ConceptsTab paper={paper} /></TabsContent>
          <TabsContent value="questions" className="mt-0"><QuestionsTab paper={paper} /></TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}

/* ---------------- Add Paper chooser ---------------- */

const addPaperOptions = [
  { key: "pdf", label: "Upload PDF", icon: Upload },
  { key: "doi", label: "Add DOI", icon: Hash },
  { key: "pubmed", label: "Add PubMed link", icon: Globe },
  { key: "supplement", label: "Add supplemental file", icon: Paperclip },
  { key: "related", label: "Add related paper", icon: FileSearch },
] as const

/* ---------------- Page ---------------- */

let paperDraftCounter = 0

export default function PapersPage() {
  const { currentProjectId } = useProject()
  const [papers, setPapers] = useState<ExtractedPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string>("")
  const [addOpen, setAddOpen] = useState(false)
  const selectedPaper = papers.find((p) => p.id === selected)

  useEffect(() => {
    if (!currentProjectId) return
    let cancelled = false
    setLoading(true)
    api.papers.list(currentProjectId).then((data) => {
      if (cancelled) return
      setPapers(data)
      setSelected((prev) => (data.some((p) => p.id === prev) ? prev : (data[0]?.id ?? "")))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [currentProjectId])

  async function handleAddPaper(optionLabel: string) {
    paperDraftCounter += 1
    const draft: Partial<ExtractedPaper> = {
      id: `paper_draft_${paperDraftCounter}`,
      projectId: currentProjectId,
      title: `Untitled paper (via ${optionLabel})`,
      authors: "—",
      journal: "—",
      year: new Date().getFullYear(),
      pageCount: 0,
      status: "pending",
      libraryStatus: "processing",
    }
    const created = await api.papers.create(draft)
    setPapers((prev) => [created, ...prev])
    setSelected(created.id)
    setAddOpen(false)
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">

      {/* Left panel — paper library */}
      <div className="w-72 shrink-0 border-r border-gray-200 flex flex-col bg-white">
        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-600" /> Paper Library
          </h2>
          <button
            onClick={() => setAddOpen((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-900 h-7 px-2 flex items-center gap-1"
          >
            <FilePlus2 className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {addOpen && (
          <div className="px-3 py-2 border-b border-gray-200 space-y-1">
            {addPaperOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleAddPaper(label)}
                className="w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
              >
                <Icon className="w-3.5 h-3.5 text-gray-400" /> {label}
              </button>
            ))}
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-3 py-3 space-y-1">
            {loading && <p className="text-xs text-gray-400 px-2 py-2">Loading papers…</p>}
            {papers.map((paper) => (
              <button
                key={paper.id}
                onClick={() => setSelected(paper.id)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg transition-colors group border",
                  selected === paper.id
                    ? "bg-violet-50/60 border-[#635BFF]/25 shadow-[0_2px_8px_-2px_rgba(99,91,255,0.18)]"
                    : "hover:bg-gray-50 border-transparent"
                )}
              >
                <div className="flex items-start gap-2">
                  <PaperStatusIcon status={paper.status} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs leading-snug line-clamp-2",
                      selected === paper.id ? "text-gray-900 font-medium" : "text-gray-600"
                    )}>
                      {paper.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {paper.year} &middot; {paper.pageCount} pp
                    </p>
                    <div className="mt-1.5">
                      <LibraryStatusBadge status={paper.libraryStatus} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center — paper detail */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-gray-200 bg-[#FAFAFB]">
        {selectedPaper && <PaperDetail paper={selectedPaper} />}
      </div>

      {/* Right — context panel */}
      <div className="w-[300px] shrink-0 flex flex-col overflow-hidden bg-[#FAFAFB]">
        {selectedPaper && <RightPanel paper={selectedPaper} />}
      </div>
    </div>
  )
}
