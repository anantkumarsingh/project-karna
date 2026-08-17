"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Circle,
  ArrowUpRight,
  Wand2,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Database,
  BarChart2,
  ImageIcon,
  Table2,
  Quote,
  EyeOff,
  Download,
  History,
  MessageSquare,
  ListChecks,
  FlaskConical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InfoCard, PlainCard, CompactPanel } from "@/components/layout/InfoCard"
import {
  questionReports,
  validationChecks,
  SECTION_ORDER,
  type SectionId,
  type ReportSection,
  type Claim,
  type ClaimStatus,
} from "@/lib/dummy-reports"
import { extractedPapers } from "@/lib/dummy-papers"
import { researchQuestions } from "@/lib/dummy-questions"
import { executedAnalyses } from "@/lib/dummy-analyses"
import { artifacts } from "@/lib/dummy-visualizations"
import { dummyRulebookEntries } from "@/lib/dummy-data"
import { useProject } from "@/components/layout/ProjectContext"

const ACCENT = "#635BFF"

const reportStatusStyle: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-500 border-gray-200",
  draft_in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  draft_complete: "bg-sky-50 text-sky-700 border-sky-200",
  validated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  exported: "bg-violet-50 text-violet-700 border-violet-200",
}
const reportStatusLabel: Record<string, string> = {
  not_started: "Not Started",
  draft_in_progress: "Draft In Progress",
  draft_complete: "Draft Complete",
  validated: "Validated",
  exported: "Exported",
}

const sectionDotColor: Record<ReportSection["status"], string> = {
  empty: "bg-gray-300",
  drafted: "bg-sky-500",
  edited: "bg-amber-500",
}

const claimIcon: Record<ClaimStatus, { Icon: typeof CheckCircle2; color: string }> = {
  supported: { Icon: CheckCircle2, color: "text-emerald-600" },
  warning: { Icon: AlertTriangle, color: "text-amber-600" },
  unsupported: { Icon: XCircle, color: "text-rose-600" },
}

const writingActions = ["Generate Section", "Regenerate From Latest Results", "Improve Clarity", "Make More Formal", "Shorten", "Add Limitations", "Insert Figure Reference"]

/* ---------------- claim row ---------------- */

function ClaimRow({ claim }: { claim: Claim }) {
  const { Icon, color } = claimIcon[claim.status]
  return (
    <div className={cn("rounded-lg border px-3 py-2", claim.status === "warning" ? "border-amber-200 bg-amber-50/50" : claim.status === "unsupported" ? "border-rose-200 bg-rose-50/50" : "border-gray-100 bg-gray-50/50")}>
      <div className="flex items-start gap-2">
        <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", color)} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-700 italic leading-relaxed">&ldquo;{claim.text}&rdquo;</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {claim.sources.map((s, i) => (
              <span key={i} className="text-[10px] text-gray-500 bg-white border border-gray-200 rounded px-1.5 py-0.5">{s.label}</span>
            ))}
          </div>
          {claim.warningDetail && (
            <p className="text-[11px] text-amber-700 mt-1.5 leading-relaxed">{claim.warningDetail}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Draft tab ---------------- */

function DraftTab({
  section,
  onChange,
}: {
  section: ReportSection
  onChange: (patch: Partial<ReportSection>) => void
}) {
  return (
    <div className="space-y-4">
      <PlainCard>
        <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-100">
          {writingActions.map((label, i) => (
            <button
              key={label}
              title={i === 0 ? undefined : "Requires the agent system"}
              disabled={i !== 0}
              onClick={i === 0 ? () => onChange({ status: section.status === "empty" ? "drafted" : section.status }) : undefined}
              className={cn(
                "text-[11px] font-medium px-2.5 py-1.5 rounded-lg border flex items-center gap-1",
                i === 0 ? "text-white border-transparent" : "text-gray-400 border-gray-200 cursor-not-allowed"
              )}
              style={i === 0 ? { backgroundColor: ACCENT } : undefined}
            >
              <Wand2 className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
        <textarea
          value={section.body}
          onChange={(e) => onChange({ body: e.target.value, status: "edited" })}
          rows={10}
          placeholder="Nothing drafted yet — use Generate Section, or write directly."
          className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 leading-relaxed resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
        />
      </PlainCard>

      {section.claims.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Quote className="w-3.5 h-3.5 text-violet-500" /> Claim traceability</p>
          <div className="space-y-2">
            {section.claims.map((c) => <ClaimRow key={c.id} claim={c} />)}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Sources tab ---------------- */

function SourceRow({
  label,
  detail,
  excluded,
  onInsert,
  onUse,
  onToggleExclude,
  viewHref,
}: {
  label: string
  detail?: string
  excluded: boolean
  onInsert: () => void
  onUse: () => void
  onToggleExclude: () => void
  viewHref?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0", excluded && "opacity-40")}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800">{label}</p>
        {detail && <p className="text-[11px] text-gray-500 mt-0.5">{detail}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onInsert} className="text-[11px] font-medium" style={{ color: ACCENT }}>Insert citation</button>
        {viewHref && <Link href={viewHref} className="text-[11px] font-medium text-gray-500 hover:text-gray-800">View source</Link>}
        <button onClick={onUse} className="text-[11px] font-medium text-gray-500 hover:text-gray-800">Use in section</button>
        <button onClick={onToggleExclude} className="text-gray-400 hover:text-gray-700" title="Exclude from report">
          <EyeOff className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ---------------- Page ---------------- */

type MainTab = "draft" | "sources" | "artifacts" | "validation" | "export"

function defaultQuestionIdForPaper(paperId: string): string {
  return researchQuestions.find((q) => q.paperId === paperId)?.id ?? questionReports[0].questionId
}

export default function ReportBuilderPage() {
  const { currentProjectId, currentProject } = useProject()
  const visiblePapers = extractedPapers.filter((p) => p.projectId === currentProjectId)
  const [selectedPaperId, setSelectedPaperId] = useState<string>(visiblePapers[0]?.id ?? extractedPapers[0].id)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(defaultQuestionIdForPaper(visiblePapers[0]?.id ?? extractedPapers[0].id))
  const [mainTab, setMainTab] = useState<MainTab>("draft")
  const [activeSectionId, setActiveSectionId] = useState<SectionId>("results")
  const [excludedSourceIds, setExcludedSourceIds] = useState<Set<string>>(new Set())
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [reportsState, setReportsState] = useState(() =>
    Object.fromEntries(questionReports.map((r) => [r.questionId, r.sections]))
  )

  useEffect(() => {
    if (!visiblePapers.some((p) => p.id === selectedPaperId)) {
      const nextPaperId = visiblePapers[0]?.id ?? ""
      setSelectedPaperId(nextPaperId)
      setSelectedQuestionId(defaultQuestionIdForPaper(nextPaperId))
      setActiveSectionId("results")
      setMainTab("draft")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId])

  // AppShell only mounts pages once projects have loaded, so this should never
  // render — guarded anyway so this can't silently crash on `.name` if that
  // invariant is ever broken by a future change.
  if (!currentProject) return null

  const selectedPaper = extractedPapers.find((p) => p.id === selectedPaperId)
  const paperQuestions = researchQuestions.filter((q) => q.paperId === selectedPaperId)
  const reportMeta = questionReports.find((r) => r.questionId === selectedQuestionId) ?? questionReports[0]
  const sections = reportsState[selectedQuestionId] ?? []
  const activeSection = sections.find((s) => s.id === activeSectionId) ?? sections[0]
  const selectedQuestion = researchQuestions.find((q) => q.id === selectedQuestionId) ?? null
  const checksForQuestion = validationChecks.filter((c) => c.questionId === selectedQuestionId)
  const questionAnalyses = executedAnalyses.filter((a) => a.researchQuestionId === selectedQuestionId)
  const questionArtifacts = artifacts.filter((a) => a.questionId === selectedQuestionId)

  function updateSection(sectionId: SectionId, patch: Partial<ReportSection>) {
    setReportsState((prev) => ({
      ...prev,
      [selectedQuestionId]: (prev[selectedQuestionId] ?? []).map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    }))
  }

  function appendToSection(sectionId: SectionId, text: string) {
    setReportsState((prev) => ({
      ...prev,
      [selectedQuestionId]: (prev[selectedQuestionId] ?? []).map((s) =>
        s.id === sectionId ? { ...s, body: s.body ? `${s.body}\n\n${text}` : text, status: "edited" } : s
      ),
    }))
  }

  function toggleExclude(id: string) {
    setExcludedSourceIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateCaption(artifactId: string, caption: string) {
    const idx = artifacts.findIndex((a) => a.id === artifactId)
    if (idx >= 0) artifacts[idx] = { ...artifacts[idx], caption }
  }

  function runExport(label: string) {
    setExportMessage(`${label} started (simulated) — connect the backend to generate real files.`)
  }

  function selectQuestion(qId: string) {
    setSelectedQuestionId(qId)
    setActiveSectionId("results")
    setMainTab("draft")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-400">Project: {currentProject.name}</span>
        <span className="text-gray-300">/</span>
        <select
          value={selectedPaperId}
          onChange={(e) => { setSelectedPaperId(e.target.value); const qs = researchQuestions.filter((q) => q.paperId === e.target.value); if (qs[0]) selectQuestion(qs[0].id) }}
          className="text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
        >
          {visiblePapers.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <span className="text-gray-300">/</span>
        <select
          value={selectedQuestionId}
          onChange={(e) => selectQuestion(e.target.value)}
          className="text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 max-w-xs truncate focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
        >
          {paperQuestions.map((q) => <option key={q.id} value={q.id}>{q.question}</option>)}
        </select>
        <span className="text-gray-300">/</span>
        <span className={cn("text-[11px] font-medium px-2 py-1 rounded border", reportStatusStyle[reportMeta.status])}>{reportStatusLabel[reportMeta.status]}</span>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left rail */}
        <div className="w-72 shrink-0 border-r border-gray-200 flex flex-col bg-white">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-600" /> Report Outline
            </h2>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-2 py-2">
              {SECTION_ORDER.map(({ id, title }) => {
                const sec = sections.find((s) => s.id === id)
                return (
                  <button
                    key={id}
                    onClick={() => { setActiveSectionId(id); setMainTab("draft") }}
                    className={cn(
                      "w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-lg",
                      activeSectionId === id ? "bg-violet-50/60 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", sectionDotColor[sec?.status ?? "empty"])} />
                    <span className="text-xs flex-1 truncate">{title}</span>
                  </button>
                )
              })}
            </div>

            <div className="px-3 pb-3">
              <InfoCard icon={ListChecks} iconColor="text-violet-600" title="Question Report">
                <p className="text-xs text-gray-700 leading-relaxed mb-2">{selectedQuestion?.question}</p>
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border inline-block mb-2", reportStatusStyle[reportMeta.status])}>{reportStatusLabel[reportMeta.status]}</span>
                {reportMeta.included.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Included</p>
                    {reportMeta.included.map((inc, i) => (
                      <p key={i} className="text-[11px] text-gray-600 flex items-start gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {inc}</p>
                    ))}
                  </div>
                )}
                {reportMeta.missing.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Missing</p>
                    {reportMeta.missing.map((m, i) => (
                      <p key={i} className="text-[11px] text-amber-700 flex items-start gap-1"><Circle className="w-3 h-3 mt-0.5 shrink-0" /> {m}</p>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => setMainTab("draft")} className="text-[11px] font-medium" style={{ color: ACCENT }}>Open Report</button>
                  <button onClick={() => setMainTab("export")} className="text-[11px] font-medium text-gray-500 hover:text-gray-800">Export</button>
                  <button onClick={() => setMainTab("validation")} className="text-[11px] font-medium text-gray-500 hover:text-gray-800">Run Validation</button>
                </div>
              </InfoCard>
            </div>
          </ScrollArea>
        </div>

        {/* Center workspace */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-gray-200 bg-[#FAFAFB]">
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <h1 className="text-sm font-semibold text-gray-900">{SECTION_ORDER.find((s) => s.id === activeSectionId)?.title}</h1>
            <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-lg p-1 gap-1 mt-3">
              {([
                ["draft", "Draft"],
                ["sources", "Sources"],
                ["artifacts", "Artifacts"],
                ["validation", "Validation"],
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
              {mainTab === "draft" && activeSection && (
                <DraftTab section={activeSection} onChange={(patch) => updateSection(activeSectionId, patch)} />
              )}

              {mainTab === "sources" && (
                <div className="space-y-4">
                  <InfoCard icon={FileText} iconColor="text-violet-600" title="Paper Evidence">
                    {selectedQuestion?.evidenceMap && selectedQuestion.evidenceMap.length > 0 ? (
                      selectedQuestion.evidenceMap.map((e, i) => (
                        <SourceRow
                          key={i}
                          label={`${e.section} — ${e.pageRef}`}
                          detail={e.quote}
                          excluded={excludedSourceIds.has(`paper_${i}`)}
                          onInsert={() => appendToSection(activeSectionId, `(${selectedPaper?.authors.split(",")[0]} et al., ${selectedPaper?.year}, ${e.pageRef})`)}
                          onUse={() => appendToSection(activeSectionId, e.quote)}
                          onToggleExclude={() => toggleExclude(`paper_${i}`)}
                          viewHref="/papers"
                        />
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No paper evidence linked to this question yet.</p>
                    )}
                  </InfoCard>

                  <InfoCard icon={Database} iconColor="text-sky-600" title="Dataset Evidence">
                    <SourceRow label="N = 312 patients" detail="Cleaned NSCLC cohort (dataset_001_v2)" excluded={excludedSourceIds.has("ds_n")} onInsert={() => appendToSection(activeSectionId, "(N = 312)")} onUse={() => appendToSection(activeSectionId, "The analysis cohort comprised 312 patients.")} onToggleExclude={() => toggleExclude("ds_n")} viewHref="/data" />
                    <SourceRow label="Events = 194 of 312 (62.2%)" detail="From analysis_003 statistical output" excluded={excludedSourceIds.has("ds_events")} onInsert={() => appendToSection(activeSectionId, "(194 events, 62.2%)")} onUse={() => appendToSection(activeSectionId, "194 of 312 patients (62.2%) experienced a PFS event.")} onToggleExclude={() => toggleExclude("ds_events")} viewHref="/data" />
                    <SourceRow label="Missingness — ecog_ps 22.4%, pdl1_tps 18.0%" excluded={excludedSourceIds.has("ds_missing")} onInsert={() => appendToSection(activeSectionId, "(ECOG missing 22.4%, PD-L1 TPS missing 18.0%)")} onUse={() => appendToSection(activeSectionId, "ECOG performance status was missing in 22.4% of patients and PD-L1 TPS in 18.0%.")} onToggleExclude={() => toggleExclude("ds_missing")} viewHref="/data" />
                  </InfoCard>

                  <InfoCard icon={BarChart2} iconColor="text-emerald-600" title="Analysis Evidence">
                    {questionAnalyses.length === 0 ? (
                      <p className="text-xs text-gray-400">No analyses linked to this question yet.</p>
                    ) : (
                      questionAnalyses.map((a) => (
                        <SourceRow
                          key={a.id}
                          label={a.name}
                          detail={a.interpretation ? a.interpretation.slice(0, 90) + "..." : `Status: ${a.status}`}
                          excluded={excludedSourceIds.has(a.id)}
                          onInsert={() => appendToSection(activeSectionId, `(${a.scriptUsed})`)}
                          onUse={() => a.interpretation && appendToSection(activeSectionId, a.interpretation)}
                          onToggleExclude={() => toggleExclude(a.id)}
                          viewHref="/analysis"
                        />
                      ))
                    )}
                  </InfoCard>

                  <InfoCard icon={BookOpen} iconColor="text-gray-500" title="Rulebook">
                    {dummyRulebookEntries.filter((r) => r.projectId === currentProjectId).slice(0, 4).map((r) => (
                      <SourceRow
                        key={r.id}
                        label={r.text}
                        excluded={excludedSourceIds.has(r.id)}
                        onInsert={() => appendToSection(activeSectionId, `(per project rulebook)`)}
                        onUse={() => appendToSection(activeSectionId, r.text)}
                        onToggleExclude={() => toggleExclude(r.id)}
                      />
                    ))}
                  </InfoCard>
                </div>
              )}

              {mainTab === "artifacts" && (
                <div className="grid grid-cols-2 gap-3">
                  {questionArtifacts.length === 0 && <p className="text-sm text-gray-400 col-span-2 text-center py-8">No figures or tables for this question yet — see Visualization Studio.</p>}
                  {questionArtifacts.map((a) => (
                    <PlainCard key={a.id}>
                      <div className="flex items-center gap-2 mb-2">
                        {a.kind === "figure" ? <ImageIcon className="w-4 h-4 text-violet-500" /> : <Table2 className="w-4 h-4 text-violet-500" />}
                        <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      </div>
                      <textarea
                        defaultValue={a.caption ?? ""}
                        onBlur={(e) => updateCaption(a.id, e.target.value)}
                        rows={2}
                        placeholder="Add a caption..."
                        className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 leading-relaxed resize-none placeholder:text-gray-400 mb-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
                      />
                      <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={() => appendToSection(a.kind === "figure" ? "figures" : "tables", a.caption ?? a.title)} className="text-[11px] font-medium" style={{ color: ACCENT }}>Insert into Draft</button>
                        <button className="text-[11px] font-medium text-gray-500 hover:text-gray-800">Edit Caption</button>
                        <button className="text-[11px] font-medium text-gray-500 hover:text-gray-800">Export Figure</button>
                        <button className="text-[11px] font-medium text-gray-500 hover:text-gray-800">Regenerate</button>
                      </div>
                    </PlainCard>
                  ))}
                </div>
              )}

              {mainTab === "validation" && (
                <div className="space-y-2">
                  {checksForQuestion.map((c) => {
                    const Icon = c.result === "passed" ? CheckCircle2 : c.result === "warning" ? AlertTriangle : XCircle
                    const color = c.result === "passed" ? "text-emerald-600" : c.result === "warning" ? "text-amber-600" : "text-rose-600"
                    const bg = c.result === "passed" ? "border-gray-200" : c.result === "warning" ? "border-amber-200 bg-amber-50/40" : "border-rose-200 bg-rose-50/40"
                    return (
                      <div key={c.id} className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3", bg)}>
                        <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", color)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium">{c.label}</p>
                          <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{c.detail}</p>
                          {c.claimId && (
                            <button onClick={() => { setMainTab("draft"); setActiveSectionId("results") }} className="text-[11px] font-medium mt-1" style={{ color: ACCENT }}>View in Draft →</button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {mainTab === "export" && (
                <div className="space-y-4">
                  <InfoCard icon={Download} iconColor="text-emerald-600" title="Format">
                    <div className="flex gap-2">
                      {["Word", "PDF", "Markdown", "LaTeX"].map((f) => (
                        <button key={f} onClick={() => runExport(`${f} export`)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-[#635BFF]/30">{f}</button>
                      ))}
                    </div>
                  </InfoCard>

                  <InfoCard icon={ListChecks} iconColor="text-violet-600" title="Include">
                    <div className="grid grid-cols-3 gap-2">
                      {["Draft", "Figures", "Tables", "Captions", "Methods", "Results", "Code appendix", "Reproducibility log", "Analysis metadata"].map((item) => (
                        <label key={item} className="flex items-center gap-1.5 text-xs text-gray-700">
                          <input type="checkbox" defaultChecked /> {item}
                        </label>
                      ))}
                    </div>
                  </InfoCard>

                  <InfoCard icon={Sparkles} iconColor="text-violet-600" title="Export Bundles">
                    <div className="grid grid-cols-2 gap-2">
                      {["Manuscript Draft", "Results Package", "Supplementary Materials", "Reproducibility Bundle", "Slide-ready Figures"].map((label) => (
                        <button key={label} onClick={() => runExport(label)} className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-[#635BFF]/30 text-left">{label}</button>
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

          {/* Bottom bar */}
          <div className="px-6 py-2.5 border-t border-gray-200 bg-white flex items-center gap-4">
            <button className="text-[11px] font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1"><History className="w-3.5 h-3.5" /> Version History</button>
            <button disabled className="text-[11px] font-medium text-gray-300 cursor-not-allowed flex items-center gap-1" title="Commenting system not built yet"><MessageSquare className="w-3.5 h-3.5" /> Comments</button>
            <button onClick={() => setMainTab("export")} className="text-[11px] font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Export</button>
            <button onClick={() => setMainTab("validation")} className="text-[11px] font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Checks</button>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[300px] shrink-0 flex flex-col overflow-hidden bg-[#FAFAFB]">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-3">
              <CompactPanel title="Selected Section" icon={FlaskConical}>
                <p className="text-[11px] font-medium text-gray-800">{SECTION_ORDER.find((s) => s.id === activeSectionId)?.title}</p>
                <p className="text-[11px] text-gray-500 mt-1">{activeSection?.claims.length ?? 0} claim(s) tracked</p>
              </CompactPanel>

              <CompactPanel title="Paper Evidence" icon={FileText}>
                {selectedQuestion?.evidenceMap && selectedQuestion.evidenceMap.length > 0 ? (
                  <p className="text-[11px] text-gray-600 leading-relaxed">&ldquo;{selectedQuestion.evidenceMap[0].quote}&rdquo;</p>
                ) : (
                  <p className="text-[11px] text-gray-400">No evidence linked yet.</p>
                )}
                {selectedPaper && (
                  <Link href="/papers" className="text-[11px] font-medium inline-flex items-center gap-1 mt-2" style={{ color: ACCENT }}>
                    View {selectedPaper.title.slice(0, 28)}... <ArrowUpRight className="w-3 h-3" />
                  </Link>
                )}
              </CompactPanel>

              <CompactPanel title="Figures & Tables" icon={ImageIcon}>
                {questionArtifacts.length > 0 ? (
                  <div className="space-y-1.5">
                    {questionArtifacts.map((a) => (
                      <p key={a.id} className="text-[11px] text-gray-600 flex items-center gap-1.5">
                        {a.kind === "figure" ? <ImageIcon className="w-3 h-3 text-gray-400" /> : <Table2 className="w-3 h-3 text-gray-400" />} {a.title}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">None yet.</p>
                )}
              </CompactPanel>

              <CompactPanel title="Results" icon={BarChart2}>
                {questionAnalyses.length > 0 ? (
                  <div className="space-y-1.5">
                    {questionAnalyses.map((a) => (
                      <p key={a.id} className="text-[11px] text-gray-600">{a.name} — <span className="text-gray-400">{a.status}</span></p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">No analyses linked.</p>
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
    </div>
  )
}
