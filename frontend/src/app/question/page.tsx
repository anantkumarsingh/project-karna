"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  HelpCircle,
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  Sparkles,
  Target,
  FlaskConical,
  ShieldAlert,
  ShieldCheck,
  BarChart2,
  ArrowUpRight,
  ArrowLeft,
  Wand2,
  Lightbulb,
  Quote,
  BookOpen,
  Activity,
  Send,
  X,
  History,
  Database,
  Archive,
  Layers,
  Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InfoCard, PlainCard, CompactPanel } from "@/components/layout/InfoCard"
import { StatusPill } from "@/components/layout/StatusPill"
import {
  researchQuestions as initialQuestions,
  recommendedQuestions,
  type ResearchQuestionDetail,
  type RecommendedQuestion,
  type RecommendationGroup,
  type QuestionStatus,
  type MatchLevel,
  type StrengthLevel,
  type Feasibility,
  type EvidenceEntry,
} from "@/lib/dummy-questions"
import { extractedPapers } from "@/lib/dummy-papers"
import { dummyAnalyses, dummyRulebookEntries } from "@/lib/dummy-data"
import { useProject } from "@/components/layout/ProjectContext"

const ACCENT = "#635BFF"

const QUESTION_TYPES = ["Association", "Prediction", "Comparison", "Survival", "Mediation", "Subgroup", "Replication", "Exploratory"] as const
const BUILDER_GOALS = ["Replicate paper", "Extend paper", "Explore new idea", "Test mechanism", "Build prediction model"] as const

/* ---------------- status badges ---------------- */

const statusStyle: Record<QuestionStatus, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  needs_mapping: "bg-amber-50 text-amber-700 border-amber-200",
  feasible: "bg-sky-50 text-sky-700 border-sky-200",
  feasible_with_caveats: "bg-amber-50 text-amber-700 border-amber-200",
  blocked: "bg-rose-50 text-rose-700 border-rose-200",
  ready_for_analysis: "bg-violet-50 text-violet-700 border-violet-200",
  used_in_analysis: "bg-violet-100 text-violet-800 border-violet-300",
  archived: "bg-gray-100 text-gray-400 border-gray-200",
}
const statusLabel: Record<QuestionStatus, string> = {
  draft: "Draft",
  needs_mapping: "Needs Dataset Mapping",
  feasible: "Feasible",
  feasible_with_caveats: "Feasible With Caveats",
  blocked: "Blocked",
  ready_for_analysis: "Ready for Analysis",
  used_in_analysis: "Used in Analysis",
  archived: "Archived",
}

function QuestionStatusBadge({ status }: { status: QuestionStatus }) {
  return <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border", statusStyle[status])}>{statusLabel[status]}</span>
}

const matchDot: Record<MatchLevel, string> = { matched: "bg-emerald-500", partial: "bg-amber-500", missing: "bg-rose-500" }
const matchLabel: Record<MatchLevel, string> = { matched: "Matched", partial: "Partial", missing: "Missing" }

function MatchPill({ status }: { status: MatchLevel }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600">
      <span className={cn("w-1.5 h-1.5 rounded-full", matchDot[status])} /> {matchLabel[status]}
    </span>
  )
}

const strengthStyle: Record<string, string> = {
  strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  weak: "bg-rose-50 text-rose-700 border-rose-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
}

function ConfidencePill({ label, level }: { label: string; level: StrengthLevel }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", strengthStyle[level])}>{level}</span>
    </div>
  )
}

/* ---------------- adapter: RecommendedQuestion -> ResearchQuestionDetail-shaped read view ---------------- */

function recToDetailShape(rec: RecommendedQuestion): ResearchQuestionDetail {
  return {
    id: rec.id,
    projectId: rec.projectId,
    paperId: rec.paperId,
    question: rec.question,
    createdAt: "",
    status: rec.status === "Blocked" ? "blocked" : rec.status === "Ready for analysis" ? "ready_for_analysis" : "feasible_with_caveats",
    primaryAnalysis: rec.recommendedAnalysis,
    alternativeAnalyses: rec.recommendedTests,
    assumptionsToCheck: rec.assumptionsToCheck ?? [],
    feasibility: rec.feasibility,
    evidenceMap: rec.evidenceMap ?? [],
    limitations: rec.limitations,
    linkedAnalysisIds: [],
  }
}

/* ---------------- Builder / Overview tab ---------------- */

function BuilderTab({ q, onChange, readOnly }: { q: ResearchQuestionDetail; onChange?: (patch: Partial<ResearchQuestionDetail>) => void; readOnly?: boolean }) {
  const [newCovariate, setNewCovariate] = useState("")

  function autoGenerateHypothesis() {
    if (!onChange) return
    const exposure = q.independentVariable ?? "the exposure"
    const outcome = q.dependentVariable ?? "the outcome"
    onChange({
      nullHypothesis: `There is no association between ${exposure} and ${outcome}.`,
      alternativeHypothesis: `${exposure} is associated with ${outcome}.`,
      expectedDirection: q.expectedDirection || "Direction not yet specified",
    })
  }

  return (
    <div className="space-y-4">
      <InfoCard icon={HelpCircle} iconColor="text-amber-500" title="My Question">
        <textarea
          value={q.question}
          onChange={(e) => onChange?.({ question: e.target.value })}
          readOnly={readOnly}
          rows={2}
          className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
        />
      </InfoCard>

      <PlainCard>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Question Type</p>
            <select
              value={q.questionType ?? ""}
              disabled={readOnly}
              onChange={(e) => onChange?.({ questionType: e.target.value as ResearchQuestionDetail["questionType"] })}
              className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
            >
              <option value="" disabled>Select type...</option>
              {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Population</p>
            <input
              value={q.population ?? ""}
              readOnly={readOnly}
              onChange={(e) => onChange?.({ population: e.target.value })}
              className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Exposure / Predictor</p>
            <input
              value={q.independentVariable ?? ""}
              readOnly={readOnly}
              onChange={(e) => onChange?.({ independentVariable: e.target.value })}
              className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Outcome</p>
            <input
              value={q.dependentVariable ?? ""}
              readOnly={readOnly}
              onChange={(e) => onChange?.({ dependentVariable: e.target.value })}
              className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
            />
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Covariates</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(q.covariates ?? []).map((c) => (
                <span key={c} className="flex items-center gap-1 text-[11px] font-mono bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200">
                  {c}
                  {!readOnly && (
                    <button onClick={() => onChange?.({ covariates: (q.covariates ?? []).filter((x) => x !== c) })}>
                      <X className="w-3 h-3 text-gray-400 hover:text-gray-700" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {!readOnly && (
              <div className="flex items-center gap-1.5">
                <input
                  value={newCovariate}
                  onChange={(e) => setNewCovariate(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCovariate.trim()) {
                      onChange?.({ covariates: [...(q.covariates ?? []), newCovariate.trim()] })
                      setNewCovariate("")
                    }
                  }}
                  placeholder="Add covariate..."
                  className="flex-1 text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
                />
                <button
                  onClick={() => {
                    if (newCovariate.trim()) {
                      onChange?.({ covariates: [...(q.covariates ?? []), newCovariate.trim()] })
                      setNewCovariate("")
                    }
                  }}
                  className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </PlainCard>

      <InfoCard
        icon={FlaskConical}
        iconColor="text-sky-600"
        title="Hypothesis"
        action={
          !readOnly ? (
            <button onClick={autoGenerateHypothesis} className="text-xs font-medium flex items-center gap-1" style={{ color: ACCENT }}>
              <Wand2 className="w-3 h-3" /> Auto-generate
            </button>
          ) : undefined
        }
      >
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Null Hypothesis</p>
            <textarea
              value={q.nullHypothesis ?? ""}
              readOnly={readOnly}
              onChange={(e) => onChange?.({ nullHypothesis: e.target.value })}
              rows={2}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Alternative Hypothesis</p>
            <textarea
              value={q.alternativeHypothesis ?? ""}
              readOnly={readOnly}
              onChange={(e) => onChange?.({ alternativeHypothesis: e.target.value })}
              rows={2}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Expected Direction</p>
            <input
              value={q.expectedDirection ?? ""}
              readOnly={readOnly}
              onChange={(e) => onChange?.({ expectedDirection: e.target.value })}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
            />
          </div>
        </div>
      </InfoCard>

      {q.versions && q.versions.length > 0 && (
        <InfoCard icon={History} iconColor="text-gray-500" title="Question Versions">
          <div className="space-y-2">
            {q.versions.map((v) => (
              <div key={v.label} className="flex items-start gap-2">
                <span className="text-[10px] font-mono text-gray-400 mt-0.5 shrink-0 w-16">{v.label}</span>
                <p className="text-xs text-gray-600 leading-relaxed">{v.question}</p>
              </div>
            ))}
          </div>
        </InfoCard>
      )}
    </div>
  )
}

/* ---------------- Recommendation card ---------------- */

function RecommendationCard({
  rec,
  onUse,
  onView,
}: {
  rec: RecommendedQuestion
  onUse: (rec: RecommendedQuestion) => void
  onView: (rec: RecommendedQuestion, tab: "feasibility" | "evidence" | "plan") => void
}) {
  const isBlocked = rec.status === "Blocked"
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-violet-50 text-violet-700 border-violet-200">{rec.category}</span>
        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", isBlocked ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-gray-50 text-gray-500 border-gray-200")}>
          {rec.status}
        </span>
      </div>

      <p className="text-sm text-gray-900 font-medium leading-relaxed mb-2">{rec.question}</p>

      {rec.referenceTitle && (
        <div className="flex items-start gap-1.5 text-[11px] text-sky-700 bg-sky-50 border border-sky-200 rounded px-2 py-1 mb-2">
          <Link2 className="w-3 h-3 mt-0.5 shrink-0" />
          <span>Reference: <span className="font-medium">{rec.referenceTitle}</span>{rec.referenceAuthors ? ` (${rec.referenceAuthors})` : ""}</span>
        </div>
      )}
      {rec.concept && (
        <div className="flex items-start gap-1.5 text-[11px] text-violet-700 bg-violet-50 border border-violet-200 rounded px-2 py-1 mb-2">
          <Layers className="w-3 h-3 mt-0.5 shrink-0" />
          <span>Concept: <span className="font-medium">{rec.concept}</span>{rec.conceptField ? ` (${rec.conceptField})` : ""}</span>
        </div>
      )}
      {rec.gapSource && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">From research gap: {rec.gapSource}</p>
      )}

      <p className="text-xs text-gray-600 leading-relaxed mb-2"><span className="font-medium text-gray-800">Idea — </span>{rec.idea}</p>

      <p className="text-xs text-gray-500 leading-relaxed mb-2">
        <span className="font-medium text-gray-700">Source — </span>
        {rec.howReferenceConnects ?? rec.whyItConnects ?? rec.paperEvidence}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1.5 mb-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
        <ConfidencePill label="Paper support" level={rec.confidence.paperSupport} />
        <ConfidencePill label="Dataset feasibility" level={rec.confidence.datasetFeasibility} />
        <ConfidencePill label="Statistical viability" level={rec.confidence.statisticalViability} />
        <ConfidencePill label="Novelty / extension" level={rec.confidence.novelty} />
      </div>

      <div className="mb-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Recommended Tests</p>
        <div className="flex flex-wrap gap-1.5">
          {rec.recommendedTests.map((t, i) => (
            <span key={i} className="text-[11px] text-gray-600 bg-white border border-gray-200 rounded px-1.5 py-0.5">{t}</span>
          ))}
        </div>
      </div>

      {rec.feasibilityNote && (
        <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-1.5 mb-2 leading-relaxed">{rec.feasibilityNote}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-2">
        {rec.datasetFeasibility.map((d) => (
          <span key={d.variable} className="flex items-center gap-1 text-[11px] font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
            {d.variable} <MatchPill status={d.status} />
          </span>
        ))}
      </div>

      {rec.limitations.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Limitations</p>
          {rec.limitations.map((r, i) => (
            <p key={i} className="text-[11px] text-amber-700 leading-relaxed">⚠ {r}</p>
          ))}
        </div>
      )}

      <div className="mb-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Concrete Approach</p>
        <ol className="space-y-1">
          {rec.concreteApproach.map((step, i) => (
            <li key={i} className="text-[11px] text-gray-600 leading-relaxed flex gap-1.5">
              <span className="text-gray-400 shrink-0">{i + 1}.</span> {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100 flex-wrap">
        <button onClick={() => onUse(rec)} className="text-xs font-medium px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: ACCENT }}>
          Use This Question
        </button>
        <button onClick={() => onView(rec, "feasibility")} className="text-xs font-medium text-gray-500 hover:text-gray-800">View Feasibility</button>
        <button onClick={() => onView(rec, "evidence")} className="text-xs font-medium text-gray-500 hover:text-gray-800">View Evidence</button>
        <button onClick={() => onView(rec, "plan")} className="text-xs font-medium" style={{ color: ACCENT }}>View Analysis Plan</button>
      </div>
    </div>
  )
}

/* ---------------- Feasibility tab ---------------- */

function FeasibilityTab({ q }: { q: ResearchQuestionDetail }) {
  if (!q.feasibility) {
    return <p className="text-sm text-gray-400 text-center py-12">Feasibility hasn&apos;t been checked for this question yet — fill in the Builder tab and check feasibility.</p>
  }
  const f: Feasibility = q.feasibility
  return (
    <div className="space-y-4">
      <InfoCard icon={Target} iconColor="text-violet-600" title="Feasibility Score">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Paper support</span>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", strengthStyle[f.paperSupport])}>{f.paperSupport}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Dataset support</span>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", strengthStyle[f.datasetSupport])}>{f.datasetSupport}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Statistical viability</span>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", strengthStyle[f.statisticalViability])}>{f.statisticalViability}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Clinical relevance</span>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", strengthStyle[f.clinicalRelevance])}>{f.clinicalRelevance}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Risk of bias</span>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", strengthStyle[f.riskOfBias])}>{f.riskOfBias}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed pt-3 border-t border-gray-100">{f.overall}</p>
      </InfoCard>

      <InfoCard icon={ShieldCheck} iconColor="text-emerald-600" title="Breakdown">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Outcome</span><MatchPill status={f.breakdown.outcome} /></div>
          <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Exposure</span><MatchPill status={f.breakdown.exposure} /></div>
          <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Covariates matched</span><span className="text-xs font-mono text-gray-700">{f.breakdown.covariatesMatched}</span></div>
          <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Sample size</span><span className="text-xs text-gray-700 capitalize">{f.breakdown.sampleSize}</span></div>
          <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Missingness</span><span className="text-xs text-gray-700 capitalize">{f.breakdown.missingness}</span></div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Design Fit</p>
            <p className="text-xs text-gray-600 leading-relaxed">{f.breakdown.designFit}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Recommended Analysis</p>
            <p className="text-xs text-gray-600 leading-relaxed">{f.breakdown.recommendedAnalysisNote}</p>
          </div>
        </div>
      </InfoCard>
    </div>
  )
}

/* ---------------- Evidence tab ---------------- */

function EvidenceTab({ q }: { q: ResearchQuestionDetail }) {
  if (!q.evidenceMap || q.evidenceMap.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">No evidence mapped for this question yet.</p>
  }
  return (
    <div className="space-y-3">
      <InfoCard icon={Quote} iconColor="text-violet-600" title="Evidence Map">
        <div className="space-y-3">
          {q.evidenceMap.map((e: EvidenceEntry, i: number) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 mb-1">{e.section}</p>
                <p className="text-xs text-gray-600 italic leading-relaxed">&ldquo;{e.quote}&rdquo;</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-gray-400">{e.pageRef}</p>
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded border mt-1 inline-block",
                  e.confidence === "high" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  e.confidence === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-rose-50 text-rose-700 border-rose-200"
                )}>
                  {e.confidence}
                </span>
              </div>
            </div>
          ))}
        </div>
      </InfoCard>

      {q.limitations && q.limitations.length > 0 && (
        <div className="bg-amber-50/40 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200/60">
            <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <h3 className="text-sm font-semibold text-amber-800">Limitations</h3>
          </div>
          <div className="px-4 py-4 space-y-1.5">
            {q.limitations.map((l, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">{l}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Analysis Plan tab ---------------- */

function AnalysisPlanTab({ q }: { q: ResearchQuestionDetail }) {
  const linkedAnalyses = dummyAnalyses.filter((a) => q.linkedAnalysisIds.includes(a.id))

  return (
    <div className="space-y-4">
      <InfoCard icon={BarChart2} iconColor="text-emerald-600" title="Analysis Plan">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Statistical Family</p>
            <p className="text-xs text-gray-700">{q.statisticalFamily ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Endpoint</p>
            <p className="text-xs text-gray-700">{q.endpoint ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Outcome</p>
            <p className="text-xs text-gray-700 font-mono">{q.dependentVariable ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Exposure</p>
            <p className="text-xs text-gray-700 font-mono">{q.independentVariable ?? "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Covariates</p>
            <p className="text-xs text-gray-700 font-mono">{(q.covariates ?? []).join(", ") || "None"}</p>
          </div>
          <div className="col-span-2 pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Primary Analysis</p>
            <p className="text-sm text-gray-700 leading-relaxed">{q.primaryAnalysis ?? "—"}</p>
          </div>
          {q.alternativeAnalyses && q.alternativeAnalyses.length > 0 && (
            <div className="col-span-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Supporting Tests</p>
              <ul className="space-y-1">
                {q.alternativeAnalyses.map((a, i) => (
                  <li key={i} className="text-xs text-gray-600 leading-relaxed">• {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </InfoCard>

      {q.assumptionsToCheck && q.assumptionsToCheck.length > 0 && (
        <InfoCard icon={ShieldAlert} iconColor="text-amber-500" title="Recommended Checks">
          <div className="space-y-1.5">
            {q.assumptionsToCheck.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      <div>
        <Link href="/analysis">
          <Button size="sm" className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
            <Send className="w-3.5 h-3.5" /> Create Analysis From Question
          </Button>
        </Link>
      </div>

      {linkedAnalyses.length > 0 && (
        <InfoCard icon={BarChart2} iconColor="text-emerald-600" title="Linked Analyses" action={
          <span className="text-xs font-medium flex items-center gap-0.5" style={{ color: ACCENT }}>View all <ArrowUpRight className="w-3 h-3" /></span>
        }>
          <div className="space-y-1">
            {linkedAnalyses.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-1 py-2 rounded-lg hover:bg-gray-50">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-snug">{a.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{a.primaryResult}</p>
                </div>
                <StatusPill status={a.status} />
              </div>
            ))}
          </div>
        </InfoCard>
      )}
    </div>
  )
}

/* ---------------- Question detail view (shared by recommendations + saved) ---------------- */

type DetailTab = "overview" | "feasibility" | "evidence" | "plan"

function QuestionDetailView({
  detail,
  editable,
  onChange,
  onBack,
  backLabel,
  tab,
  setTab,
}: {
  detail: ResearchQuestionDetail
  editable: boolean
  onChange?: (patch: Partial<ResearchQuestionDetail>) => void
  onBack: () => void
  backLabel: string
  tab: DetailTab
  setTab: (t: DetailTab) => void
}) {
  return (
    <div className="px-6 py-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> {backLabel}
      </button>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <h1 className="text-sm font-semibold text-gray-900">{detail.question || "Untitled question"}</h1>
        <QuestionStatusBadge status={detail.status} />
      </div>

      <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-lg p-1 gap-1 mb-5">
        {([
          ["overview", "Overview"],
          ["feasibility", "Feasibility"],
          ["evidence", "Evidence"],
          ["plan", "Analysis Plan"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-md transition-all",
              tab === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && <BuilderTab q={detail} onChange={onChange} readOnly={!editable} />}
      {tab === "feasibility" && <FeasibilityTab q={detail} />}
      {tab === "evidence" && <EvidenceTab q={detail} />}
      {tab === "plan" && <AnalysisPlanTab q={detail} />}
    </div>
  )
}

/* ---------------- Question Builder (form) tab ---------------- */

interface BuilderFormState {
  question: string
  questionType: typeof QUESTION_TYPES[number] | ""
  paperId: string
  outcome: string
  exposure: string
  covariates: string
  population: string
  expectedDirection: string
  goal: typeof BUILDER_GOALS[number] | ""
}

function QuestionBuilderForm({
  paperId,
  onRefine,
}: {
  paperId: string
  onRefine: (rec: RecommendedQuestion) => void
}) {
  const { currentProjectId } = useProject()
  const visiblePapers = extractedPapers.filter((p) => p.projectId === currentProjectId)
  const [form, setForm] = useState<BuilderFormState>({
    question: "", questionType: "", paperId, outcome: "", exposure: "", covariates: "", population: "", expectedDirection: "", goal: "",
  })
  const [refined, setRefined] = useState<RecommendedQuestion | null>(null)

  function patch(p: Partial<BuilderFormState>) {
    setForm((f) => ({ ...f, ...p }))
  }

  function refine() {
    if (!form.question.trim()) return
    const covariateList = form.covariates.split(",").map((c) => c.trim()).filter(Boolean)
    const rec: RecommendedQuestion = {
      id: `builder_${Date.now()}`,
      projectId: currentProjectId,
      paperId: form.paperId,
      group: "paper_focused_direct",
      category: "Methodological",
      question: form.question.trim(),
      idea: `User-authored question targeting ${form.outcome || "an outcome"} as a function of ${form.exposure || "an exposure"}${covariateList.length ? `, adjusted for ${covariateList.join(", ")}` : ""}. Goal: ${form.goal || "not specified"}.`,
      whyItMatters: "Drafted directly by the user from the Question Builder — not yet AI-validated against the paper or dataset.",
      paperEvidence: form.population ? `Population specified: ${form.population}` : "No paper section linked yet.",
      datasetFeasibility: [
        ...(form.exposure ? [{ variable: form.exposure, status: "partial" as MatchLevel }] : []),
        ...(form.outcome ? [{ variable: form.outcome, status: "partial" as MatchLevel }] : []),
      ],
      confidence: { paperSupport: "weak", datasetFeasibility: "moderate", statisticalViability: "moderate", novelty: "moderate" },
      recommendedAnalysis: form.questionType ? `Suggested approach based on question type: ${form.questionType}` : "Not yet determined",
      recommendedTests: form.questionType ? [`Statistical test family typical for "${form.questionType}" questions`] : [],
      concreteApproach: [
        "Map outcome and exposure variables to dataset columns.",
        "Confirm covariates are available and correctly typed.",
        "Run feasibility check against the linked paper and dataset.",
        "Generate a draft analysis plan.",
      ],
      limitations: ["This question was templated from form input, not generated by the agent system — review before treating it as a vetted recommendation."],
      status: "Feasible with caveats",
    }
    setRefined(rec)
    onRefine(rec)
  }

  return (
    <div className="space-y-4">
      <PlainCard>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">My question</p>
            <textarea
              value={form.question}
              onChange={(e) => patch({ question: e.target.value })}
              rows={2}
              placeholder="Does biomarker X predict treatment response?"
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 leading-relaxed resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Question type</p>
              <select
                value={form.questionType}
                onChange={(e) => patch({ questionType: e.target.value as BuilderFormState["questionType"] })}
                className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              >
                <option value="">Select...</option>
                {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Paper link</p>
              <select
                value={form.paperId}
                onChange={(e) => patch({ paperId: e.target.value })}
                className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              >
                {visiblePapers.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Outcome</p>
              <input
                value={form.outcome}
                onChange={(e) => patch({ outcome: e.target.value })}
                placeholder="e.g. pfs_months"
                className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Exposure / predictor</p>
              <input
                value={form.exposure}
                onChange={(e) => patch({ exposure: e.target.value })}
                placeholder="e.g. il6_baseline"
                className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Covariates</p>
              <input
                value={form.covariates}
                onChange={(e) => patch({ covariates: e.target.value })}
                placeholder="comma-separated"
                className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Population</p>
              <input
                value={form.population}
                onChange={(e) => patch({ population: e.target.value })}
                className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Expected direction (optional)</p>
              <input
                value={form.expectedDirection}
                onChange={(e) => patch({ expectedDirection: e.target.value })}
                className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">What do you want?</p>
              <select
                value={form.goal}
                onChange={(e) => patch({ goal: e.target.value as BuilderFormState["goal"] })}
                className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              >
                <option value="">Select...</option>
                {BUILDER_GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <Button size="sm" onClick={refine} className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
            <Wand2 className="w-3.5 h-3.5" /> Refine Question
          </Button>
        </div>
      </PlainCard>

      {refined && (
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Refined question card</p>
          <RecommendationCard rec={refined} onUse={() => {}} onView={() => {}} />
        </div>
      )}
    </div>
  )
}

/* ---------------- Right panel ---------------- */

function RightPanel({ q, paper }: { q: ResearchQuestionDetail | null; paper: (typeof extractedPapers)[number] | undefined }) {
  const { currentProjectId } = useProject()
  const projectRulebookEntries = dummyRulebookEntries.filter((r) => r.projectId === currentProjectId)
  if (!q) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
        <Sparkles className="w-6 h-6 text-gray-300" />
        <p className="text-sm text-gray-500">Select or create a question to see paper evidence, dataset fit, and agent trace.</p>
      </div>
    )
  }
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4 space-y-3">
        <CompactPanel title="Paper Evidence" icon={FileText}>
          {q.evidenceMap && q.evidenceMap.length > 0 ? (
            <p className="text-[11px] text-gray-600 leading-relaxed">&ldquo;{q.evidenceMap[0].quote}&rdquo; <span className="text-gray-400">({q.evidenceMap[0].pageRef})</span></p>
          ) : (
            <p className="text-[11px] text-gray-400">No evidence linked yet.</p>
          )}
          {paper && (
            <Link href="/papers" className="text-[11px] font-medium inline-flex items-center gap-1 mt-2" style={{ color: ACCENT }}>
              View {paper.title.slice(0, 28)}... <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </CompactPanel>

        <CompactPanel title="Dataset Fit" icon={Database}>
          {q.feasibility ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between"><span className="text-[11px] text-gray-600">Outcome</span><MatchPill status={q.feasibility.breakdown.outcome} /></div>
              <div className="flex items-center justify-between"><span className="text-[11px] text-gray-600">Exposure</span><MatchPill status={q.feasibility.breakdown.exposure} /></div>
              <div className="flex items-center justify-between"><span className="text-[11px] text-gray-600">Covariates</span><span className="text-[11px] font-mono text-gray-500">{q.feasibility.breakdown.covariatesMatched}</span></div>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">Not checked yet.</p>
          )}
        </CompactPanel>

        <CompactPanel title="Related Concepts" icon={Lightbulb}>
          {q.relatedConcepts && q.relatedConcepts.length > 0 ? (
            <div className="space-y-2">
              {q.relatedConcepts.map((c) => (
                <div key={c.name}>
                  <p className="text-[11px] font-medium text-gray-800">{c.name}</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{c.whyItMatters}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">None surfaced yet.</p>
          )}
        </CompactPanel>

        <CompactPanel title="Suggested Papers" icon={BookOpen}>
          {q.suggestedPapers && q.suggestedPapers.length > 0 ? (
            <div className="space-y-2">
              {q.suggestedPapers.map((p) => (
                <div key={p.title}>
                  <p className="text-[11px] font-medium text-gray-800 leading-snug">{p.title}</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{p.howItConnects}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">None suggested yet.</p>
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
          {q.agentTrace && q.agentTrace.length > 0 ? (
            <div className="space-y-2.5">
              {q.agentTrace.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex flex-col items-center pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    {i < q.agentTrace!.length - 1 && <span className="w-px flex-1 bg-gray-200 mt-1" />}
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
      </div>
    </ScrollArea>
  )
}

/* ---------------- Page ---------------- */

let draftCounter = 0

type TopTab = "recommended" | "builder" | "saved"
type Viewing = { kind: "recommendation"; id: string; tab: DetailTab } | { kind: "saved"; id: string; tab: DetailTab } | null

const GROUP_SECTIONS: { group: RecommendationGroup; title: string; subtitle: string }[] = [
  { group: "paper_focused_direct", title: "From This Paper", subtitle: "Derived directly from the paper's methods, results, and limitations" },
  { group: "paper_focused_reference", title: "From This Paper's References", subtitle: "Derived from papers this one cites" },
]

export default function ResearchQuestionPage() {
  const { currentProjectId } = useProject()
  const visiblePapers = extractedPapers.filter((p) => p.projectId === currentProjectId)
  const [questions, setQuestions] = useState<ResearchQuestionDetail[]>(initialQuestions)
  const [selectedPaperId, setSelectedPaperId] = useState<string>(visiblePapers[0]?.id ?? initialQuestions[0].paperId)
  const [topTab, setTopTab] = useState<TopTab>("recommended")
  const [viewing, setViewing] = useState<Viewing>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    paper_focused: true, paper_focused_direct: true, paper_focused_reference: true, cross_concept: true,
  })

  useEffect(() => {
    if (!visiblePapers.some((p) => p.id === selectedPaperId)) {
      setSelectedPaperId(visiblePapers[0]?.id ?? "")
      setViewing(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId])

  const selectedPaper = extractedPapers.find((p) => p.id === selectedPaperId)
  const paperRecs = recommendedQuestions.filter((r) => r.paperId === selectedPaperId)
  const paperQuestions = questions.filter((q) => q.paperId === selectedPaperId)

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function updateSelected(patch: Partial<ResearchQuestionDetail>) {
    if (!viewing || viewing.kind !== "saved") return
    setQuestions((prev) => prev.map((q) => (q.id === viewing.id ? { ...q, ...patch } : q)))
  }

  function handleNewQuestion() {
    draftCounter += 1
    const draft: ResearchQuestionDetail = {
      id: `draft_q_${draftCounter}`,
      projectId: currentProjectId,
      paperId: selectedPaperId,
      question: "",
      createdAt: new Date().toISOString().slice(0, 10),
      status: "draft",
      linkedAnalysisIds: [],
    }
    setQuestions((prev) => [draft, ...prev])
    setTopTab("saved")
    setViewing({ kind: "saved", id: draft.id, tab: "overview" })
  }

  function statusFromRecLabel(label: string): QuestionStatus {
    if (label === "Ready for analysis") return "ready_for_analysis"
    if (label === "Feasible with caveats") return "feasible_with_caveats"
    if (label === "Blocked") return "blocked"
    return "feasible"
  }

  function handleUseRecommendation(rec: RecommendedQuestion) {
    draftCounter += 1
    const created: ResearchQuestionDetail = {
      id: `draft_q_${draftCounter}`,
      projectId: rec.projectId,
      paperId: rec.paperId,
      question: rec.question,
      createdAt: new Date().toISOString().slice(0, 10),
      status: statusFromRecLabel(rec.status),
      primaryAnalysis: rec.recommendedAnalysis,
      alternativeAnalyses: rec.recommendedTests,
      assumptionsToCheck: rec.assumptionsToCheck ?? rec.limitations,
      feasibility: rec.feasibility,
      evidenceMap: rec.evidenceMap,
      limitations: rec.limitations,
      gapSource: rec.gapSource,
      linkedAnalysisIds: [],
    }
    setQuestions((prev) => [created, ...prev])
    setSelectedPaperId(rec.paperId)
    setTopTab("saved")
    setViewing({ kind: "saved", id: created.id, tab: "overview" })
  }

  function handleViewRecommendation(rec: RecommendedQuestion, tab: DetailTab) {
    setViewing({ kind: "recommendation", id: rec.id, tab })
  }

  function handleArchive(id: string) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, status: "archived" } : q)))
  }

  // resolve current detail view
  let detailDetail: ResearchQuestionDetail | null = null
  let detailEditable = false
  if (viewing) {
    if (viewing.kind === "recommendation") {
      const rec = recommendedQuestions.find((r) => r.id === viewing.id)
      detailDetail = rec ? recToDetailShape(rec) : null
      detailEditable = false
    } else {
      const saved = questions.find((q) => q.id === viewing.id) ?? null
      detailDetail = saved
      detailEditable = true
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Center workspace */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-gray-200 bg-[#FAFAFB]">
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-600" />
              <span className="text-xs text-gray-500">Paper:</span>
              <select
                value={selectedPaperId}
                onChange={(e) => { setSelectedPaperId(e.target.value); setViewing(null) }}
                className="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              >
                {visiblePapers.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <Button size="sm" onClick={handleNewQuestion} className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
              <Plus className="w-3.5 h-3.5" /> New Question
            </Button>
          </div>

          {!viewing && (
            <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-lg p-1 gap-1 mt-3">
              {([
                ["recommended", "Recommended Questions"],
                ["builder", "Question Builder"],
                ["saved", "Saved Questions"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTopTab(value)}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-md transition-all",
                    topTab === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {viewing && detailDetail ? (
            <QuestionDetailView
              detail={detailDetail}
              editable={detailEditable}
              onChange={updateSelected}
              onBack={() => setViewing(null)}
              backLabel={viewing.kind === "recommendation" ? "Back to Recommended Questions" : "Back to Saved Questions"}
              tab={viewing.tab}
              setTab={(t) => setViewing((v) => (v ? { ...v, tab: t } : v))}
            />
          ) : (
            <div className="px-6 py-5">
              {topTab === "recommended" && (
                <div className="space-y-6">
                  <div>
                    <button onClick={() => toggleGroup("paper_focused")} className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-3">
                      {expandedGroups.paper_focused ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      Paper-Focused
                    </button>
                    {expandedGroups.paper_focused && (
                      <div className="space-y-5 ml-1">
                        {GROUP_SECTIONS.map((section) => {
                          const recs = paperRecs.filter((r) => r.group === section.group)
                          if (recs.length === 0) return null
                          return (
                            <div key={section.group}>
                              <button onClick={() => toggleGroup(section.group)} className="flex items-center gap-1.5 mb-2">
                                {expandedGroups[section.group] ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                <span className="text-xs font-semibold text-gray-700">{section.title}</span>
                                <span className="text-[10px] text-gray-400">{section.subtitle}</span>
                              </button>
                              {expandedGroups[section.group] && (
                                <div className="space-y-3">
                                  {recs.map((rec) => (
                                    <RecommendationCard key={rec.id} rec={rec} onUse={handleUseRecommendation} onView={handleViewRecommendation} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <button onClick={() => toggleGroup("cross_concept")} className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-3">
                      {expandedGroups.cross_concept ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      Cross-Concept
                      <span className="text-[10px] text-gray-400 font-normal ml-1">This paper + a related concept or method from another field</span>
                    </button>
                    {expandedGroups.cross_concept && (
                      <div className="space-y-3 ml-1">
                        {paperRecs.filter((r) => r.group === "cross_concept").map((rec) => (
                          <RecommendationCard key={rec.id} rec={rec} onUse={handleUseRecommendation} onView={handleViewRecommendation} />
                        ))}
                      </div>
                    )}
                  </div>

                  {paperRecs.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-12">No recommendations generated for this paper yet.</p>
                  )}
                </div>
              )}

              {topTab === "builder" && (
                <QuestionBuilderForm paperId={selectedPaperId} onRefine={() => {}} />
              )}

              {topTab === "saved" && (
                <div className="space-y-2">
                  {paperQuestions.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-12">No saved questions for this paper yet — use a recommendation or create one in Question Builder.</p>
                  )}
                  {paperQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#635BFF]/30 cursor-pointer"
                      onClick={() => setViewing({ kind: "saved", id: q.id, tab: "overview" })}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-snug truncate">{q.question || "Untitled question"}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{q.createdAt}</p>
                      </div>
                      <QuestionStatusBadge status={q.status} />
                      {q.status !== "archived" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleArchive(q.id) }}
                          className="text-gray-400 hover:text-gray-700"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right panel */}
      <div className="w-[300px] shrink-0 flex flex-col overflow-hidden bg-[#FAFAFB]">
        <RightPanel q={detailDetail} paper={selectedPaper} />
      </div>
    </div>
  )
}
