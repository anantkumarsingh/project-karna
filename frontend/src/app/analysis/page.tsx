"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart2,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Code2,
  Download,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Compass,
  AreaChart,
  Play,
  RotateCcw,
  Plus,
  X,
  SlidersHorizontal,
  Wand2,
  Database,
  HelpCircle,
  Pencil,
  Circle,
  Star,
  Copy,
  Trash2,
  Search,
  FileCode,
  BookOpen,
  Bot,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InfoCard, PlainCard } from "@/components/layout/InfoCard"
import { StatusPill } from "@/components/layout/StatusPill"
import { executedAnalyses, type ExecutedAnalysis, type AssumptionResult } from "@/lib/dummy-analyses"
import { profiledDatasets } from "@/lib/dummy-datasets"
import { researchQuestions, type ResearchQuestionDetail } from "@/lib/dummy-questions"
import { extractedPapers } from "@/lib/dummy-papers"
import { useProject } from "@/components/layout/ProjectContext"

const ACCENT = "#635BFF"

function analysisProjectId(a: ExecutedAnalysis): string | undefined {
  return a.projectId ?? researchQuestions.find((q) => q.id === a.researchQuestionId)?.projectId
}

const MODEL_TYPES = [
  "Cox Proportional Hazards",
  "Kaplan-Meier Survival",
  "Logistic Regression",
  "Linear Regression",
  "Descriptive Statistics",
] as const
type ModelType = (typeof MODEL_TYPES)[number]

type MissingStrategy = "drop_rows" | "mean_impute" | "multiple_imputation"
type Mode = "guided" | "advanced" | "code"
type StartPath = "question" | "previous" | "script" | "paper" | null

interface WorkbenchParams {
  modelType: ModelType
  outcomeTime: string
  outcomeEvent: string
  predictor: string
  covariates: string[]
  confidenceLevel: number
  missingStrategy: MissingStrategy
  robustSE: boolean
  outputs: {
    modelSummary: boolean
    forestPlot: boolean
    kmCurve: boolean
    methodsText: boolean
    resultsText: boolean
  }
}

const defaultOutputs = { modelSummary: true, forestPlot: true, kmCurve: false, methodsText: true, resultsText: true }

const defaultParamsByAnalysis: Record<string, WorkbenchParams> = {
  analysis_003: { modelType: "Cox Proportional Hazards", outcomeTime: "pfs_months", outcomeEvent: "pfs_event", predictor: "il6_baseline", covariates: ["age", "sex", "stage_iv"], confidenceLevel: 0.95, missingStrategy: "drop_rows", robustSE: false, outputs: defaultOutputs },
  analysis_002: { modelType: "Kaplan-Meier Survival", outcomeTime: "pfs_months", outcomeEvent: "pfs_event", predictor: "il6_baseline", covariates: [], confidenceLevel: 0.95, missingStrategy: "drop_rows", robustSE: false, outputs: { ...defaultOutputs, forestPlot: false, kmCurve: true } },
  analysis_001: { modelType: "Descriptive Statistics", outcomeTime: "", outcomeEvent: "", predictor: "", covariates: [], confidenceLevel: 0.95, missingStrategy: "drop_rows", robustSE: false, outputs: { ...defaultOutputs, forestPlot: false, methodsText: false } },
  analysis_004: { modelType: "Cox Proportional Hazards", outcomeTime: "pfs_months", outcomeEvent: "pfs_event", predictor: "crp_baseline", covariates: ["il6_baseline", "age", "sex", "stage_iv"], confidenceLevel: 0.95, missingStrategy: "drop_rows", robustSE: true, outputs: defaultOutputs },
}

const blankParams: WorkbenchParams = {
  modelType: "Descriptive Statistics",
  outcomeTime: "",
  outcomeEvent: "",
  predictor: "",
  covariates: [],
  confidenceLevel: 0.95,
  missingStrategy: "drop_rows",
  robustSE: false,
  outputs: { ...defaultOutputs, forestPlot: false, methodsText: false },
}

function getDefaultParams(id: string): WorkbenchParams {
  return defaultParamsByAnalysis[id] ?? blankParams
}

const missingStrategyLabel: Record<MissingStrategy, string> = {
  drop_rows: "Drop rows",
  mean_impute: "Mean imputation",
  multiple_imputation: "Multiple imputation",
}

// "Reusable script" library — dummy stand-in for the real scripts/analysis/ library described in CLAUDE_CONTEXT.md
const reusableScripts: { file: string; description: string; params: Partial<WorkbenchParams> }[] = [
  { file: "survival_cox_adjusted.py", description: "Multivariable Cox proportional hazards, adjusts for covariates", params: { modelType: "Cox Proportional Hazards", outcomeTime: "pfs_months", outcomeEvent: "pfs_event", predictor: "il6_baseline", covariates: ["age", "sex", "stage_iv"] } },
  { file: "survival_kaplan_meier.py", description: "Kaplan-Meier survival curves with log-rank test", params: { modelType: "Kaplan-Meier Survival", outcomeTime: "pfs_months", outcomeEvent: "pfs_event", predictor: "il6_baseline", covariates: [] } },
  { file: "clinical_baseline_table.py", description: "Descriptive baseline characteristics table", params: { modelType: "Descriptive Statistics" } },
]

function guessModelTypeFromText(text: string): ModelType {
  const t = text.toLowerCase()
  if (t.includes("cox") || t.includes("hazards")) return "Cox Proportional Hazards"
  if (t.includes("kaplan") || t.includes("survival curve")) return "Kaplan-Meier Survival"
  if (t.includes("logistic")) return "Logistic Regression"
  if (t.includes("linear") || t.includes("regression")) return "Linear Regression"
  return "Descriptive Statistics"
}

function paramsFromPaper(paper: (typeof extractedPapers)[number]): WorkbenchParams {
  const modelType = guessModelTypeFromText(paper.primaryAnalysis ?? "")
  const vars = paper.variables ?? []
  const time = vars.find((v) => v.role === "time_variable")
  const event = vars.find((v) => v.role === "event_indicator")
  const predictor = vars.find((v) => v.role === "independent")
  const covariates = vars.filter((v) => v.role === "covariate").map((v) => v.datasetMatch ?? v.name)
  return {
    ...blankParams,
    modelType,
    outcomeTime: time?.datasetMatch ?? time?.name ?? "",
    outcomeEvent: event?.datasetMatch ?? event?.name ?? "",
    predictor: predictor?.datasetMatch ?? predictor?.name ?? "",
    covariates,
  }
}

function paramsFromResearchQuestion(rq: ResearchQuestionDetail): WorkbenchParams {
  const timeEventMatch = rq.dependentVariable?.match(/^(\w+).*censored by (\w+)/)
  const predictorMatch = rq.independentVariable?.match(/^(\w+)/)
  const family = rq.statisticalFamily ?? ""
  const modelType: ModelType = /time-to-event|survival/i.test(family) ? "Cox Proportional Hazards" : "Descriptive Statistics"
  return {
    ...blankParams,
    modelType,
    outcomeTime: timeEventMatch?.[1] ?? "",
    outcomeEvent: timeEventMatch?.[2] ?? "",
    predictor: predictorMatch?.[1] ?? "",
    covariates: rq.covariates ?? [],
  }
}

function buildCode(p: WorkbenchParams, datasetFile: string): string {
  const alpha = (1 - p.confidenceLevel).toFixed(2)
  const dropna = p.missingStrategy === "drop_rows" ? `\ndf = df.dropna(subset=[${[p.outcomeTime, p.outcomeEvent, p.predictor, ...p.covariates].filter(Boolean).map((c) => `"${c}"`).join(", ")}])` : ""

  if (p.modelType === "Cox Proportional Hazards") {
    const cols = [p.outcomeTime, p.outcomeEvent, p.predictor, ...p.covariates].map((c) => `"${c}"`).join(", ")
    return `import pandas as pd
from lifelines import CoxPHFitter

df = pd.read_csv("${datasetFile}")${dropna}

cph = CoxPHFitter()
cph.fit(
    df[[${cols}]],
    duration_col="${p.outcomeTime}",
    event_col="${p.outcomeEvent}",
    robust=${p.robustSE ? "True" : "False"},
)
cph.print_summary(alpha=${alpha})
cph.check_assumptions(df, p_value_threshold=${alpha})`
  }
  if (p.modelType === "Kaplan-Meier Survival") {
    return `import pandas as pd
from lifelines import KaplanMeierFitter
from lifelines.statistics import multivariate_logrank_test

df = pd.read_csv("${datasetFile}")${dropna}
df["${p.predictor}_tertile"] = pd.qcut(df["${p.predictor}"], 3, labels=["low", "mid", "high"])

kmf = KaplanMeierFitter()
for tertile, group in df.groupby("${p.predictor}_tertile"):
    kmf.fit(group["${p.outcomeTime}"], group["${p.outcomeEvent}"], label=tertile, alpha=${alpha})
    kmf.plot_survival_function()

results = multivariate_logrank_test(
    df["${p.outcomeTime}"], df["${p.predictor}_tertile"], df["${p.outcomeEvent}"]
)
results.print_summary()`
  }
  if (p.modelType === "Logistic Regression") {
    const covs = p.covariates.length ? ` + ${p.covariates.join(" + ")}` : ""
    return `import pandas as pd
import statsmodels.formula.api as smf

df = pd.read_csv("${datasetFile}")${dropna}

model = smf.logit("${p.outcomeEvent} ~ ${p.predictor}${covs}", data=df).fit(cov_type=${p.robustSE ? `"HC3"` : `"nonrobust"`})
print(model.summary(alpha=${alpha}))`
  }
  if (p.modelType === "Linear Regression") {
    const covs = p.covariates.length ? ` + ${p.covariates.join(" + ")}` : ""
    return `import pandas as pd
import statsmodels.formula.api as smf

df = pd.read_csv("${datasetFile}")${dropna}

model = smf.ols("${p.outcomeTime} ~ ${p.predictor}${covs}", data=df).fit(cov_type=${p.robustSE ? `"HC3"` : `"nonrobust"`})
print(model.summary(alpha=${alpha}))`
  }
  return `import pandas as pd

df = pd.read_csv("${datasetFile}")
summary = df.describe(include="all").T
summary.to_csv("baseline_table.csv")
print(summary)`
}

function getReasoning(modelType: ModelType): { reasons: string[]; alternatives: string[] } {
  switch (modelType) {
    case "Cox Proportional Hazards":
      return {
        reasons: [
          "Outcome is time-to-event (a duration column paired with an event/censoring indicator)",
          "Event/censoring indicator found in the dataset",
          "Continuous and categorical covariates available for adjustment",
        ],
        alternatives: ["Kaplan-Meier curves + log-rank test (unadjusted comparison)"],
      }
    case "Kaplan-Meier Survival":
      return {
        reasons: [
          "Outcome is time-to-event",
          "Comparing survival across groups or exposure tertiles",
          "No covariate adjustment requested for this run",
        ],
        alternatives: ["Cox proportional hazards regression, for an adjusted estimate"],
      }
    case "Logistic Regression":
      return {
        reasons: ["Outcome is binary", "Adjustment for covariates requested"],
        alternatives: ["Chi-square test of independence (unadjusted)"],
      }
    case "Linear Regression":
      return {
        reasons: ["Outcome is continuous", "Adjustment for covariates requested"],
        alternatives: ["Spearman correlation (unadjusted)"],
      }
    default:
      return {
        reasons: ["No hypothesis test requested — summarizing baseline characteristics"],
        alternatives: [],
      }
  }
}

function AnalysisStatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
  if (status === "running") return <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0 animate-pulse" />
  if (status === "failed") return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
  if (status === "draft") return <Pencil className="w-3.5 h-3.5 text-gray-400 shrink-0" />
  if (status === "ready") return <Circle className="w-3.5 h-3.5 text-violet-500 shrink-0" />
  return <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
}

const assumptionIcon: Record<AssumptionResult, React.ReactNode> = {
  pass: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
  warning: <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />,
  fail: <ShieldX className="w-3.5 h-3.5 text-rose-600" />,
}

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const items: { value: Mode; label: string }[] = [
    { value: "guided", label: "Guided" },
    { value: "advanced", label: "Advanced" },
    { value: "code", label: "Code" },
  ]
  return (
    <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-lg p-1 gap-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-md transition-all",
            mode === item.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------- Start chooser (shown for fresh drafts) ---------------- */

function StartChooser({
  name,
  onRename,
  onChooseMode,
  onStartFromQuestion,
  onStartFromPrevious,
  onStartFromScript,
  onStartFromPaper,
  onStartBlank,
  otherAnalyses,
}: {
  name: string
  onRename: (name: string) => void
  onChooseMode: (m: Mode) => void
  onStartFromQuestion: (rq: ResearchQuestionDetail) => void
  onStartFromPrevious: (a: ExecutedAnalysis) => void
  onStartFromScript: (s: (typeof reusableScripts)[number]) => void
  onStartFromPaper: (p: (typeof extractedPapers)[number]) => void
  onStartBlank: () => void
  otherAnalyses: ExecutedAnalysis[]
}) {
  const { currentProjectId } = useProject()
  const visibleQuestions = researchQuestions.filter((rq) => rq.projectId === currentProjectId)
  const visiblePapers = extractedPapers.filter((p) => p.projectId === currentProjectId)
  const [open, setOpen] = useState<StartPath>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(name)

  const startOptions: { key: StartPath; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "question", label: "Research Question", icon: HelpCircle },
    { key: "previous", label: "Previous Analysis", icon: Copy },
    { key: "script", label: "Reusable Script", icon: FileCode },
    { key: "paper", label: "Paper Method", icon: BookOpen },
  ]

  return (
    <div className="space-y-5">
      <div>
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              onRename(nameDraft.trim() || name)
              setEditingName(false)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRename(nameDraft.trim() || name)
                setEditingName(false)
              }
            }}
            className="text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20"
          />
        ) : (
          <button onClick={() => setEditingName(true)} className="flex items-center gap-2 group">
            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
            <Pencil className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
          </button>
        )}
        <p className="text-sm text-gray-500 mt-1">How do you want to begin?</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onChooseMode("guided")}
          className="text-left p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#635BFF]/40 hover:shadow-[0_2px_8px_-2px_rgba(99,91,255,0.18)] transition-all"
        >
          <Wand2 className="w-5 h-5 mb-2" style={{ color: ACCENT }} />
          <p className="text-sm font-semibold text-gray-900">Guided Setup</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Best when you want help choosing the right analysis.</p>
        </button>
        <button
          onClick={() => onChooseMode("advanced")}
          className="text-left p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#635BFF]/40 hover:shadow-[0_2px_8px_-2px_rgba(99,91,255,0.18)] transition-all"
        >
          <SlidersHorizontal className="w-5 h-5 mb-2" style={{ color: ACCENT }} />
          <p className="text-sm font-semibold text-gray-900">Manual Setup</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Best when you know the test/model and want to configure parameters.</p>
        </button>
        <button
          onClick={() => onChooseMode("code")}
          className="text-left p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#635BFF]/40 hover:shadow-[0_2px_8px_-2px_rgba(99,91,255,0.18)] transition-all"
        >
          <Code2 className="w-5 h-5 mb-2" style={{ color: ACCENT }} />
          <p className="text-sm font-semibold text-gray-900">Code Editor</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Best when you want full control over the script.</p>
        </button>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Or start from</p>
        <div className="flex flex-wrap gap-2">
          {startOptions.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setOpen(open === key ? null : key)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors",
                open === key ? "border-[#635BFF]/40 bg-violet-50/60 text-gray-900" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="w-3.5 h-3.5 text-gray-400" /> {label}
            </button>
          ))}
          <button
            onClick={onStartBlank}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <Plus className="w-3.5 h-3.5 text-gray-400" /> Blank Analysis
          </button>
        </div>

        {open === "question" && (
          <div className="mt-2 space-y-1.5">
            {visibleQuestions.map((rq) => (
              <button
                key={rq.id}
                onClick={() => onStartFromQuestion(rq)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-[#635BFF]/30 hover:bg-violet-50/40"
              >
                <p className="text-xs text-gray-700 leading-relaxed">{rq.question}</p>
              </button>
            ))}
            <Link
              href="/question"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700"
            >
              <Plus className="w-3.5 h-3.5" /> Create new question
            </Link>
          </div>
        )}

        {open === "previous" && (
          <div className="mt-2 space-y-1.5">
            {otherAnalyses.length === 0 && <p className="text-xs text-gray-400 px-1">No previous analyses yet.</p>}
            {otherAnalyses.map((a) => (
              <button
                key={a.id}
                onClick={() => onStartFromPrevious(a)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-[#635BFF]/30 hover:bg-violet-50/40 flex items-center justify-between gap-2"
              >
                <span className="text-xs text-gray-700">{a.name}</span>
                <span className="text-[10px] text-gray-400 font-mono shrink-0">{a.type}</span>
              </button>
            ))}
          </div>
        )}

        {open === "script" && (
          <div className="mt-2 space-y-1.5">
            {reusableScripts.map((s) => (
              <button
                key={s.file}
                onClick={() => onStartFromScript(s)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-[#635BFF]/30 hover:bg-violet-50/40"
              >
                <p className="text-xs font-mono text-gray-900">{s.file}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{s.description}</p>
              </button>
            ))}
          </div>
        )}

        {open === "paper" && (
          <div className="mt-2 space-y-1.5">
            {visiblePapers.filter((p) => p.status === "processed" && p.primaryAnalysis).map((p) => (
              <button
                key={p.id}
                onClick={() => onStartFromPaper(p)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-[#635BFF]/30 hover:bg-violet-50/40"
              >
                <p className="text-xs text-gray-900 leading-snug">{p.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{p.primaryAnalysis}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5">
        <p className="text-xs font-semibold text-gray-700 mb-0.5">Results</p>
        <p className="text-xs text-gray-400">Configure the analysis and press Run.</p>
      </div>
    </div>
  )
}

/* ---------------- Guided ---------------- */

function GuidedMode({
  analysis,
  params,
  onRun,
  onSwitchMode,
  onLinkQuestion,
}: {
  analysis: ExecutedAnalysis
  params: WorkbenchParams
  onRun: () => void
  onSwitchMode: (m: Mode) => void
  onLinkQuestion: (rq: ResearchQuestionDetail) => void
}) {
  const { currentProjectId } = useProject()
  const visibleQuestions = researchQuestions.filter((q) => q.projectId === currentProjectId)
  const rq = researchQuestions.find((q) => q.id === analysis.researchQuestionId)
  const { reasons, alternatives } = getReasoning(params.modelType)
  const [pickingQuestion, setPickingQuestion] = useState(false)

  return (
    <div className="space-y-4">
      <InfoCard icon={HelpCircle} iconColor="text-amber-500" title="Research Question">
        {rq ? (
          <p className="text-sm text-gray-700 leading-relaxed">{rq.question}</p>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <select
                value=""
                onChange={(e) => {
                  const found = researchQuestions.find((q) => q.id === e.target.value)
                  if (found) onLinkQuestion(found)
                }}
                className="flex-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
              >
                <option value="" disabled>Select existing question...</option>
                {visibleQuestions.map((q) => (
                  <option key={q.id} value={q.id}>{q.question.slice(0, 70)}{q.question.length > 70 ? "…" : ""}</option>
                ))}
              </select>
              <Link
                href="/question"
                className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 whitespace-nowrap"
                style={{ color: ACCENT }}
              >
                Create new
              </Link>
            </div>
            <p className="text-xs text-gray-400">
              Or skip this step:{" "}
              <button onClick={() => setPickingQuestion((v) => !v)} className="font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2">
                choose variables manually
              </button>
              {", "}
              <button onClick={() => onSwitchMode("advanced")} className="font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2">
                go to Advanced
              </button>
              {", or "}
              <button onClick={() => onSwitchMode("code")} className="font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2">
                go to Code
              </button>
              .
            </p>
          </div>
        )}
      </InfoCard>

      {params.modelType !== "Descriptive Statistics" && (
        <InfoCard icon={Database} iconColor="text-sky-600" title="Detected Variables">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Outcome</p>
              <p className="text-xs text-gray-700 font-mono">{params.outcomeTime || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Event</p>
              <p className="text-xs text-gray-700 font-mono">{params.outcomeEvent || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Predictor</p>
              <p className="text-xs text-gray-700 font-mono">{params.predictor || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Covariates</p>
              <div className="flex flex-wrap gap-1.5">
                {params.covariates.length > 0 ? (
                  params.covariates.map((c) => (
                    <span key={c} className="text-[11px] font-mono bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{c}</span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">None</span>
                )}
              </div>
            </div>
          </div>
        </InfoCard>
      )}

      <InfoCard icon={Wand2} iconColor="text-violet-600" title="Recommended Analysis">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Primary</p>
        <p className="text-sm text-gray-700 mb-3">{params.modelType}</p>
        {alternatives.length > 0 && (
          <>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5 pt-2 border-t border-gray-100">Alternatives</p>
            <div className="space-y-1.5">
              {alternatives.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </InfoCard>

      <InfoCard icon={Lightbulb} iconColor="text-amber-500" title="Why This Fits">
        <div className="space-y-1.5">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">{r}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard icon={AlertTriangle} iconColor="text-amber-500" title="Warnings">
        {analysis.warnings && analysis.warnings.length > 0 ? (
          <div className="space-y-1.5">
            {analysis.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No warnings yet — warnings appear here after assumptions are checked.</p>
        )}
      </InfoCard>

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={onRun} className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
          <Play className="w-3.5 h-3.5" /> Run Recommended Analysis
        </Button>
        <Button size="sm" variant="outline" onClick={() => onSwitchMode("advanced")} className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">
          Switch to Advanced
        </Button>
        <Button size="sm" variant="outline" onClick={() => onSwitchMode("code")} className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">
          View / Edit Code
        </Button>
      </div>
    </div>
  )
}

/* ---------------- Advanced ---------------- */

function AdvancedMode({
  params,
  onChange,
  onRun,
  onPreviewCode,
}: {
  params: WorkbenchParams
  onChange: (p: WorkbenchParams) => void
  onRun: () => void
  onPreviewCode: () => void
}) {
  const { currentProjectId } = useProject()
  const visibleDatasets = profiledDatasets.filter((d) => d.projectId === currentProjectId)
  const [newCovariate, setNewCovariate] = useState("")
  const needsOutcome = params.modelType !== "Descriptive Statistics"

  return (
    <div className="space-y-4">
      <InfoCard icon={SlidersHorizontal} iconColor="text-violet-600" title="Analysis Type">
        <select
          value={params.modelType}
          onChange={(e) => onChange({ ...params, modelType: e.target.value as ModelType })}
          className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
        >
          {MODEL_TYPES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </InfoCard>

      <InfoCard icon={Database} iconColor="text-sky-600" title="Dataset">
        <select
          defaultValue={visibleDatasets[0]?.id}
          className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
        >
          {visibleDatasets.map((d) => (
            <option key={d.id} value={d.id}>{d.filename}</option>
          ))}
        </select>
      </InfoCard>

      {needsOutcome && (
        <InfoCard icon={Database} iconColor="text-sky-600" title="Variables">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Time column</p>
              <input
                value={params.outcomeTime}
                onChange={(e) => onChange({ ...params, outcomeTime: e.target.value })}
                className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
              />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Event column</p>
              <input
                value={params.outcomeEvent}
                onChange={(e) => onChange({ ...params, outcomeEvent: e.target.value })}
                className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
              />
            </div>
          </div>
          <div className="mb-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Group / predictor variable</p>
            <input
              value={params.predictor}
              onChange={(e) => onChange({ ...params, predictor: e.target.value })}
              className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Covariates</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {params.covariates.map((c) => (
                <span key={c} className="flex items-center gap-1 text-[11px] font-mono bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200">
                  {c}
                  <button onClick={() => onChange({ ...params, covariates: params.covariates.filter((x) => x !== c) })}>
                    <X className="w-3 h-3 text-gray-400 hover:text-gray-700" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                value={newCovariate}
                onChange={(e) => setNewCovariate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCovariate.trim()) {
                    onChange({ ...params, covariates: [...params.covariates, newCovariate.trim()] })
                    setNewCovariate("")
                  }
                }}
                placeholder="Add covariate..."
                className="flex-1 text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
              />
              <button
                onClick={() => {
                  if (newCovariate.trim()) {
                    onChange({ ...params, covariates: [...params.covariates, newCovariate.trim()] })
                    setNewCovariate("")
                  }
                }}
                className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        </InfoCard>
      )}

      <InfoCard icon={SlidersHorizontal} iconColor="text-gray-500" title="Model Parameters">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Confidence level</p>
            <input
              type="number"
              step="0.01"
              min="0.5"
              max="0.999"
              value={params.confidenceLevel}
              onChange={(e) => onChange({ ...params, confidenceLevel: parseFloat(e.target.value) || 0.95 })}
              className="w-full text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Handle missing</p>
            <select
              value={params.missingStrategy}
              onChange={(e) => onChange({ ...params, missingStrategy: e.target.value as MissingStrategy })}
              className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 focus:border-[#635BFF]/40"
            >
              {Object.entries(missingStrategyLabel).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={params.robustSE}
            onChange={(e) => onChange({ ...params, robustSE: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-gray-300"
            style={{ accentColor: ACCENT }}
          />
          <span className="text-xs text-gray-600">Use robust standard errors</span>
        </label>
      </InfoCard>

      <InfoCard icon={CheckCircle2} iconColor="text-emerald-600" title="Outputs">
        <div className="grid grid-cols-2 gap-2">
          {([
            ["modelSummary", "Model summary table"],
            ["forestPlot", "Hazard ratio forest plot"],
            ["kmCurve", "Kaplan-Meier curve"],
            ["methodsText", "Methods text"],
            ["resultsText", "Results text"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={params.outputs[key]}
                onChange={(e) => onChange({ ...params, outputs: { ...params.outputs, [key]: e.target.checked } })}
                className="w-3.5 h-3.5 rounded border-gray-300"
                style={{ accentColor: ACCENT }}
              />
              <span className="text-xs text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </InfoCard>

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={onRun} className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
          <Play className="w-3.5 h-3.5" /> Run Analysis
        </Button>
        <Button size="sm" variant="outline" onClick={onPreviewCode} className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">
          Preview Code
        </Button>
      </div>
    </div>
  )
}

/* ---------------- Code ---------------- */

function CodeMode({
  codeText,
  customCode,
  onChange,
  onReset,
  onRun,
}: {
  codeText: string
  customCode: boolean
  onChange: (text: string) => void
  onReset: () => void
  onRun: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
              <Code2 className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">analysis.py</h3>
            <span
              className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                customCode ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}
            >
              {customCode ? "Generated + User Modified" : "Generated"}
            </span>
          </div>
          {customCode && (
            <button onClick={onReset} className="text-xs font-medium flex items-center gap-1" style={{ color: ACCENT }}>
              <RotateCcw className="w-3 h-3" /> Reset to generated
            </button>
          )}
        </div>
        <div className="p-4">
          <textarea
            value={codeText}
            onChange={(e) => onChange(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full bg-gray-900 text-gray-100 rounded-lg p-4 text-[11px] font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40"
          />
          <p className="text-[11px] text-gray-400 mt-2">
            Runs on the project&apos;s backend in an isolated task workspace — no local Python install needed.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onRun} className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
          <Play className="w-3.5 h-3.5" /> Run Code
        </Button>
        {customCode && (
          <Button size="sm" variant="outline" onClick={onReset} className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50">
            Reset to Generated
          </Button>
        )}
        <button
          disabled
          title="Requires the agent system — coming in a later phase"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed ml-auto"
        >
          <Bot className="w-3.5 h-3.5" /> Ask Agent to Draft Code
        </button>
      </div>
    </div>
  )
}

/* ---------------- Results ---------------- */

function ResultsPanel({ analysis, running }: { analysis: ExecutedAnalysis; running: boolean }) {
  if (running) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <Clock className="w-6 h-6 text-sky-500 animate-pulse" />
        <p className="text-sm text-gray-600">Running on the backend...</p>
        <p className="text-xs text-gray-400 max-w-xs">Executing in an isolated task workspace using the project&apos;s Python environment.</p>
      </div>
    )
  }

  const hasCannedResults = Boolean(analysis.resultTable || analysis.interpretation)

  if (analysis.status === "completed" && !hasCannedResults) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        <p className="text-sm text-gray-600">Run completed (simulated).</p>
        <p className="text-xs text-gray-400 max-w-xs">
          Result tables, assumption checks, and interpretation will render here once this run is connected to the real backend.
        </p>
      </div>
    )
  }

  if (analysis.status !== "completed") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <Sparkles className="w-6 h-6 text-gray-300" />
        <p className="text-sm text-gray-500">Configure the analysis and press Run to see results here.</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="px-5 py-5">
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="bg-gray-100 border border-gray-200 h-8 mb-4">
            <TabsTrigger value="results" className="text-xs h-6 px-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
              Results
            </TabsTrigger>
            <TabsTrigger value="assumptions" className="text-xs h-6 px-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
              Assumptions
            </TabsTrigger>
            <TabsTrigger value="repro" className="text-xs h-6 px-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
              Reproducibility
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-3 mt-0">
            {analysis.interpretation && (
              <InfoCard icon={Lightbulb} iconColor="text-amber-500" title="Interpretation">
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.interpretation}</p>
              </InfoCard>
            )}

            {analysis.resultTable && (
              <InfoCard icon={BarChart2} iconColor="text-emerald-600" title="Result Table">
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {analysis.resultTable.columns.map((col) => (
                          <th key={col} className="text-left font-medium text-gray-400 uppercase tracking-wide text-[10px] px-2 py-2">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.resultTable.rows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          {row.map((cell, j) => (
                            <td key={j} className={cn("px-2 py-2", j === 0 ? "text-gray-700 font-mono" : "text-gray-600")}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </InfoCard>
            )}

            {analysis.statisticalOutput && analysis.statisticalOutput.length > 0 && (
              <InfoCard icon={Compass} iconColor="text-sky-600" title="Statistical Output">
                <div className="space-y-1.5">
                  {analysis.statisticalOutput.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <p className="text-xs text-gray-600 font-mono leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}

            {analysis.warnings && analysis.warnings.length > 0 && (
              <div className="bg-amber-50/40 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200/60">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  </div>
                  <h3 className="text-sm font-semibold text-amber-800">Warnings</h3>
                </div>
                <div className="px-4 py-4 space-y-1.5">
                  {analysis.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <p className="text-xs text-amber-800 leading-relaxed">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <InfoCard icon={AreaChart} iconColor="text-violet-600" title="Visualization">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Charts for this run are generated in Visualization Studio.</p>
                <button className="text-xs font-medium flex items-center gap-1 shrink-0" style={{ color: ACCENT }}>
                  Open in Studio
                </button>
              </div>
            </InfoCard>
          </TabsContent>

          <TabsContent value="assumptions" className="space-y-2 mt-0">
            {analysis.assumptionsChecked && analysis.assumptionsChecked.length > 0 ? (
              analysis.assumptionsChecked.map((a) => (
                <div key={a.name} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                  {assumptionIcon[a.result]}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.detail}</p>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0",
                      a.result === "pass" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      a.result === "warning" && "bg-amber-50 text-amber-700 border-amber-200",
                      a.result === "fail" && "bg-rose-50 text-rose-700 border-rose-200"
                    )}
                  >
                    {a.result}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No assumption checks were required for this analysis.</p>
            )}
          </TabsContent>

          <TabsContent value="repro" className="space-y-3 mt-0">
            {analysis.reproducibility && (
              <PlainCard>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Script Version</p>
                    <p className="text-xs text-gray-700 font-mono">{analysis.reproducibility.scriptVersion}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Runtime</p>
                    <p className="text-xs text-gray-700">{analysis.reproducibility.runtimeSeconds}s</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Packages</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {analysis.reproducibility.packages.map((p) => (
                        <span key={p} className="text-[10px] font-mono bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </PlainCard>
            )}

            {analysis.exportFormats && analysis.exportFormats.length > 0 && (
              <InfoCard icon={Download} iconColor="text-sky-600" title="Export">
                <div className="flex flex-wrap gap-2">
                  {analysis.exportFormats.map((f) => (
                    <button key={f} className="text-xs font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <Download className="w-3 h-3 text-gray-400" /> {f}
                    </button>
                  ))}
                </div>
              </InfoCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}

/* ---------------- History rail ---------------- */

function dateBucket(iso: string): "Today" | "Yesterday" | "Earlier" {
  const d = new Date(iso)
  const now = new Date()
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86400000)
  if (diffDays <= 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  return "Earlier"
}

let draftCounter = 0

const RAIL_MIN_WIDTH = 200
const RAIL_MAX_WIDTH = 380
const RAIL_DEFAULT_WIDTH = 256
const RAIL_WIDTH_STORAGE_KEY = "karna-analysis-rail-width"

export default function AnalysisExecutionPage() {
  const { currentProjectId } = useProject()
  const datasetFile = profiledDatasets.find((d) => d.projectId === currentProjectId)?.filename ?? profiledDatasets[0].filename
  const [analyses, setAnalyses] = useState<ExecutedAnalysis[]>(executedAnalyses)
  const visibleAnalyses = analyses.filter((a) => analysisProjectId(a) === currentProjectId)
  const [selectedId, setSelectedId] = useState<string>(visibleAnalyses[0]?.id ?? executedAnalyses[0].id)

  useEffect(() => {
    if (!visibleAnalyses.some((a) => a.id === selectedId)) {
      setSelectedId(visibleAnalyses[0]?.id ?? "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId])

  const [railWidth, setRailWidth] = useState<number>(() => {
    if (typeof window === "undefined") return RAIL_DEFAULT_WIDTH
    const saved = Number(window.localStorage.getItem(RAIL_WIDTH_STORAGE_KEY))
    return saved >= RAIL_MIN_WIDTH && saved <= RAIL_MAX_WIDTH ? saved : RAIL_DEFAULT_WIDTH
  })
  const [resizing, setResizing] = useState(false)
  const dragStart = useRef<{ x: number; width: number } | null>(null)

  useEffect(() => {
    window.localStorage.setItem(RAIL_WIDTH_STORAGE_KEY, String(railWidth))
  }, [railWidth])

  useEffect(() => {
    if (!resizing) return
    function onMove(e: MouseEvent) {
      if (!dragStart.current) return
      const delta = e.clientX - dragStart.current.x
      const next = Math.min(RAIL_MAX_WIDTH, Math.max(RAIL_MIN_WIDTH, dragStart.current.width + delta))
      setRailWidth(next)
    }
    function onUp() {
      dragStart.current = null
      setResizing(false)
    }
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [resizing])

  function startResize(e: React.MouseEvent) {
    dragStart.current = { x: e.clientX, width: railWidth }
    setResizing(true)
  }

  const [modeMap, setModeMap] = useState<Record<string, Mode>>({})
  const [modeChosenMap, setModeChosenMap] = useState<Record<string, boolean>>(
    Object.fromEntries(executedAnalyses.map((a) => [a.id, true]))
  )
  const [paramsMap, setParamsMap] = useState<Record<string, WorkbenchParams>>({})
  const [codeMap, setCodeMap] = useState<Record<string, string>>({})
  const [customCodeMap, setCustomCodeMap] = useState<Record<string, boolean>>({})
  const [running, setRunning] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const selectedAnalysis = analyses.find((a) => a.id === selectedId)!
  const mode = modeMap[selectedId] ?? "guided"
  const modeChosen = modeChosenMap[selectedId] ?? false
  const params = paramsMap[selectedId] ?? getDefaultParams(selectedId)
  const customCode = customCodeMap[selectedId] ?? false
  const generatedCode = useMemo(() => buildCode(params, datasetFile), [params, datasetFile])
  const codeText = customCode ? (codeMap[selectedId] ?? generatedCode) : generatedCode

  useEffect(() => {
    if (!customCode) {
      setCodeMap((prev) => ({ ...prev, [selectedId]: generatedCode }))
    }
  }, [generatedCode, customCode, selectedId])

  function setParamsForSelected(p: WorkbenchParams) {
    setParamsMap((prev) => ({ ...prev, [selectedId]: p }))
  }

  function chooseMode(m: Mode) {
    setModeMap((prev) => ({ ...prev, [selectedId]: m }))
    setModeChosenMap((prev) => ({ ...prev, [selectedId]: true }))
    setAnalyses((prev) => prev.map((a) => (a.id === selectedId && a.status === "draft" ? { ...a, status: "ready" } : a)))
  }

  function selectAnalysis(id: string) {
    setSelectedId(id)
    setRunning(false)
  }

  function handleNewAnalysis() {
    draftCounter += 1
    const draft: ExecutedAnalysis = {
      id: `draft_${draftCounter}`,
      projectId: currentProjectId,
      name: draftCounter === 1 ? "Untitled Analysis" : `Untitled Analysis ${draftCounter}`,
      type: "Untitled",
      status: "draft",
      runAt: new Date().toISOString(),
      agent: "—",
      scriptUsed: "—",
      provenance: "—",
      favorite: false,
    }
    setAnalyses((prev) => [draft, ...prev])
    setSelectedId(draft.id)
    setRunning(false)
  }

  function renameAnalysis(id: string, name: string) {
    setAnalyses((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)))
  }

  function renameSelected(name: string) {
    renameAnalysis(selectedId, name)
  }

  function startFromQuestion(rq: ResearchQuestionDetail) {
    setParamsForSelected(paramsFromResearchQuestion(rq))
    setAnalyses((prev) => prev.map((a) => (a.id === selectedId ? { ...a, researchQuestionId: rq.id, name: a.type === "Untitled" ? rq.question.slice(0, 48) : a.name } : a)))
    chooseMode("guided")
  }

  function startFromPrevious(source: ExecutedAnalysis) {
    const sourceParams = paramsMap[source.id] ?? getDefaultParams(source.id)
    setParamsForSelected(sourceParams)
    setAnalyses((prev) => prev.map((a) => (a.id === selectedId ? { ...a, researchQuestionId: source.researchQuestionId, type: source.type } : a)))
    chooseMode(modeMap[source.id] ?? "guided")
  }

  function startFromScript(s: (typeof reusableScripts)[number]) {
    setParamsForSelected({ ...blankParams, ...s.params })
    setAnalyses((prev) => prev.map((a) => (a.id === selectedId ? { ...a, scriptUsed: s.file, type: s.params.modelType ?? a.type } : a)))
    chooseMode("advanced")
  }

  function startFromPaper(p: (typeof extractedPapers)[number]) {
    setParamsForSelected(paramsFromPaper(p))
    chooseMode("advanced")
  }

  function startBlank() {
    setParamsForSelected(blankParams)
    chooseMode("guided")
  }

  function duplicateAnalysis(a: ExecutedAnalysis) {
    draftCounter += 1
    const newId = `draft_${draftCounter}`
    const copy: ExecutedAnalysis = { ...a, id: newId, name: `${a.name} (copy)`, status: "ready", runAt: new Date().toISOString(), favorite: false }
    setAnalyses((prev) => [copy, ...prev])
    setParamsMap((prev) => ({ ...prev, [newId]: paramsMap[a.id] ?? getDefaultParams(a.id) }))
    setModeMap((prev) => ({ ...prev, [newId]: modeMap[a.id] ?? "guided" }))
    setModeChosenMap((prev) => ({ ...prev, [newId]: true }))
    setSelectedId(newId)
  }

  function deleteAnalysis(id: string) {
    setAnalyses((prev) => {
      const next = prev.filter((a) => a.id !== id)
      if (id === selectedId) {
        const nextVisible = next.filter((a) => analysisProjectId(a) === currentProjectId)
        if (nextVisible.length > 0) setSelectedId(nextVisible[0].id)
      }
      return next
    })
  }

  function toggleFavorite(id: string) {
    setAnalyses((prev) => prev.map((a) => (a.id === id ? { ...a, favorite: !a.favorite } : a)))
  }

  function handleRun() {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setAnalyses((prev) => prev.map((a) => (a.id === selectedId ? { ...a, status: "completed" } : a)))
    }, 900)
  }

  const modelTypes = useMemo(() => {
    const types = new Set<string>()
    visibleAnalyses.forEach((a) => {
      const t = paramsMap[a.id]?.modelType ?? defaultParamsByAnalysis[a.id]?.modelType
      if (t) types.add(t)
    })
    return Array.from(types)
  }, [visibleAnalyses, paramsMap])

  const visible = visibleAnalyses.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== "all") {
      const t = paramsMap[a.id]?.modelType ?? defaultParamsByAnalysis[a.id]?.modelType
      if (t !== typeFilter) return false
    }
    return true
  })
  const favorites = visible.filter((a) => a.favorite)
  const rest = visible.filter((a) => !a.favorite)
  const grouped: Record<string, ExecutedAnalysis[]> = { Today: [], Yesterday: [], Earlier: [] }
  rest.forEach((a) => grouped[dateBucket(a.runAt)].push(a))

  const otherAnalyses = visibleAnalyses.filter((a) => a.id !== selectedId && a.status !== "draft")
  const showChooser = selectedAnalysis.status === "draft" && !modeChosen

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="h-14 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 truncate">{selectedAnalysis.name}</h1>
          <span className="text-xs font-mono text-gray-400 shrink-0">{datasetFile}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusPill status={running ? "running" : selectedAnalysis.status} />
          <Button size="sm" onClick={handleRun} disabled={running || showChooser} className="text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
            <Play className="w-3.5 h-3.5" /> {running ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* History rail */}
        <div className="shrink-0 flex flex-col bg-white" style={{ width: railWidth }}>
          <div className="px-3 py-3 border-b border-gray-200 space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Analyses</h2>
            <div className="relative">
              <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md pl-7 pr-2 py-1.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15"
            >
              <option value="all">All types</option>
              {modelTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-2 py-2 space-y-3">
              {favorites.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide px-2 mb-1">Favorites</p>
                  <div className="space-y-0.5">
                    {favorites.map((a) => (
                      <AnalysisRow key={a.id} a={a} selected={selectedId === a.id} onSelect={selectAnalysis} onToggleFavorite={toggleFavorite} onDuplicate={duplicateAnalysis} onDelete={deleteAnalysis} onRename={renameAnalysis} />
                    ))}
                  </div>
                </div>
              )}
              {(["Today", "Yesterday", "Earlier"] as const).map((bucket) =>
                grouped[bucket].length > 0 ? (
                  <div key={bucket}>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide px-2 mb-1">{bucket}</p>
                    <div className="space-y-0.5">
                      {grouped[bucket].map((a) => (
                        <AnalysisRow key={a.id} a={a} selected={selectedId === a.id} onSelect={selectAnalysis} onToggleFavorite={toggleFavorite} onDuplicate={duplicateAnalysis} onDelete={deleteAnalysis} onRename={renameAnalysis} />
                      ))}
                    </div>
                  </div>
                ) : null
              )}
              {visible.length === 0 && <p className="text-xs text-gray-400 px-2 py-4 text-center">No analyses match.</p>}
            </div>
          </ScrollArea>

          <div className="px-2 py-2 border-t border-gray-200">
            <Button size="sm" onClick={handleNewAnalysis} className="w-full text-white text-xs gap-1.5" style={{ backgroundColor: ACCENT }}>
              <Plus className="w-3.5 h-3.5" /> New Analysis
            </Button>
          </div>
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={startResize}
          className={cn(
            "w-1 shrink-0 cursor-col-resize bg-gray-200 hover:bg-[#635BFF]/40 active:bg-[#635BFF]/60 transition-colors",
            resizing && "bg-[#635BFF]/60"
          )}
          title="Drag to resize"
        />

        {/* Center workspace */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-gray-200 bg-[#FAFAFB]">
          <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
            {showChooser ? (
              <span className="text-xs text-gray-400">Choose how to start this analysis</span>
            ) : (
              <ModeSwitch mode={mode} onChange={(m) => setModeMap((prev) => ({ ...prev, [selectedId]: m }))} />
            )}
            {!showChooser && selectedAnalysis.status === "ready" && (
              <button
                onClick={() => setModeChosenMap((prev) => ({ ...prev, [selectedId]: false }))}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                <ArrowLeft className="w-3 h-3" /> Change starting point
              </button>
            )}
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5">
              {showChooser ? (
                <StartChooser
                  name={selectedAnalysis.name}
                  onRename={renameSelected}
                  onChooseMode={chooseMode}
                  onStartFromQuestion={startFromQuestion}
                  onStartFromPrevious={startFromPrevious}
                  onStartFromScript={startFromScript}
                  onStartFromPaper={startFromPaper}
                  onStartBlank={startBlank}
                  otherAnalyses={otherAnalyses}
                />
              ) : (
                <>
                  {mode === "guided" && (
                    <GuidedMode analysis={selectedAnalysis} params={params} onRun={handleRun} onSwitchMode={(m) => setModeMap((prev) => ({ ...prev, [selectedId]: m }))} onLinkQuestion={startFromQuestion} />
                  )}
                  {mode === "advanced" && (
                    <AdvancedMode params={params} onChange={setParamsForSelected} onRun={handleRun} onPreviewCode={() => setModeMap((prev) => ({ ...prev, [selectedId]: "code" }))} />
                  )}
                  {mode === "code" && (
                    <CodeMode
                      codeText={codeText}
                      customCode={customCode}
                      onChange={(text) => {
                        setCodeMap((prev) => ({ ...prev, [selectedId]: text }))
                        setCustomCodeMap((prev) => ({ ...prev, [selectedId]: true }))
                      }}
                      onReset={() => setCustomCodeMap((prev) => ({ ...prev, [selectedId]: false }))}
                      onRun={handleRun}
                    />
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Results panel */}
        <div className="w-[420px] shrink-0 flex flex-col overflow-hidden bg-white">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Results</h2>
            <p className="text-xs text-gray-400 mt-0.5">{selectedAnalysis.type}</p>
          </div>
          <ResultsPanel analysis={selectedAnalysis} running={running} />
        </div>
      </div>
    </div>
  )
}

function AnalysisRow({
  a,
  selected,
  onSelect,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  onRename,
}: {
  a: ExecutedAnalysis
  selected: boolean
  onSelect: (id: string) => void
  onToggleFavorite: (id: string) => void
  onDuplicate: (a: ExecutedAnalysis) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(a.name)

  function commit() {
    onRename(a.id, draft.trim() || a.name)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-[#635BFF]/30 bg-white">
        <Pencil className="w-3 h-3 text-gray-400 shrink-0" />
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit()
            if (e.key === "Escape") {
              setDraft(a.name)
              setEditing(false)
            }
          }}
          className="flex-1 text-xs text-gray-900 bg-transparent focus:outline-none min-w-0"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group w-full flex items-center gap-1.5 rounded-lg transition-colors border pr-1",
        selected ? "bg-violet-50/60 border-[#635BFF]/25 shadow-[0_2px_8px_-2px_rgba(99,91,255,0.18)]" : "hover:bg-gray-50 border-transparent"
      )}
    >
      <button onClick={() => onSelect(a.id)} className="flex-1 flex items-center gap-2 text-left px-2.5 py-2 min-w-0">
        <AnalysisStatusIcon status={a.status} />
        <span className={cn("text-xs truncate", selected ? "text-gray-900 font-medium" : "text-gray-600")}>{a.name}</span>
      </button>
      <button
        onClick={() => {
          setDraft(a.name)
          setEditing(true)
        }}
        className="shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:text-gray-700 text-gray-300"
        title="Rename"
      >
        <Pencil className="w-3 h-3" />
      </button>
      <button onClick={() => onToggleFavorite(a.id)} className="shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:text-amber-500 text-gray-300" title="Favorite">
        <Star className={cn("w-3 h-3", a.favorite && "fill-amber-400 text-amber-400 opacity-100")} />
      </button>
      <button onClick={() => onDuplicate(a)} className="shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:text-gray-700 text-gray-300" title="Duplicate">
        <Copy className="w-3 h-3" />
      </button>
      <button onClick={() => onDelete(a.id)} className="shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:text-rose-600 text-gray-300" title="Delete">
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}
