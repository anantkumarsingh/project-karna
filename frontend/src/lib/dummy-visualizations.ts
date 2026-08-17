export type ArtifactKind = "figure" | "table"
export type ArtifactStatus = "draft" | "generated" | "edited" | "publication_ready" | "needs_rerun" | "outdated"

export interface FigureConfig {
  xVariable?: string
  yVariable?: string
  groupVariable?: string
  facetVariable?: string
  confidenceIntervals: boolean
  theme: "Clinical (default)" | "Minimal" | "High contrast"
  referenceLines?: string[]
  legend: boolean
}

export interface TableConfig {
  columns: string[]
  decimals: number
  showPValues: boolean
  showConfidenceIntervals: boolean
}

export interface KMPreviewStep {
  time: number
  survivalPct: number
  label: string
}

export interface ForestPreviewRow {
  label: string
  hr: number
  ciLow: number
  ciHigh: number
}

export interface Artifact {
  id: string
  title: string
  kind: ArtifactKind
  chartType: string
  paperId: string
  questionId: string
  analysisId?: string
  status: ArtifactStatus
  generatedAt: string
  usedVariables: string[]
  exportFormats: string[]
  outdatedReason?: string
  caption?: string

  figureConfig?: FigureConfig
  tableConfig?: TableConfig

  kmPreview?: KMPreviewStep[]
  forestPreview?: ForestPreviewRow[]

  resultColumns?: string[]
  resultRows?: (string | number)[][]
}

export const artifacts: Artifact[] = [
  {
    id: "artifact_001",
    title: "Baseline Characteristics",
    kind: "table",
    chartType: "Baseline characteristics table",
    paperId: "paper_001",
    questionId: "rq_001",
    analysisId: "analysis_001",
    status: "generated",
    generatedAt: "2026-05-15T09:00:00Z",
    usedVariables: ["age", "sex", "stage_iv", "il6_baseline", "crp_baseline"],
    exportFormats: ["CSV", "Word", "LaTeX"],
    tableConfig: {
      columns: ["Variable", "Summary"],
      decimals: 1,
      showPValues: false,
      showConfidenceIntervals: false,
    },
    resultColumns: ["Variable", "Summary"],
    resultRows: [
      ["Age", "63.4 ± 9.1 years"],
      ["Sex", "58% male, 42% female"],
      ["Stage IV", "71%"],
      ["IL-6 baseline", "Median 18.2 pg/mL (IQR 11.4–29.8)"],
      ["CRP baseline", "Median 6.1 mg/L (IQR 2.8–14.3)"],
    ],
    caption: "Table 1. Baseline characteristics of the analysis cohort (n = 312).",
  },
  {
    id: "artifact_002",
    title: "Kaplan-Meier — PFS by IL-6 Tertile",
    kind: "figure",
    chartType: "Kaplan-Meier curve",
    paperId: "paper_001",
    questionId: "rq_001",
    analysisId: "analysis_002",
    status: "publication_ready",
    generatedAt: "2026-06-15T10:18:00Z",
    usedVariables: ["pfs_months", "pfs_event", "il6_baseline"],
    exportFormats: ["PNG", "SVG", "PDF"],
    figureConfig: {
      xVariable: "pfs_months",
      yVariable: "survival probability",
      groupVariable: "il6_tertile",
      confidenceIntervals: true,
      theme: "Clinical (default)",
      legend: true,
      referenceLines: ["Median survival markers"],
    },
    kmPreview: [
      { time: 0, survivalPct: 100, label: "Low" },
      { time: 7.6, survivalPct: 65, label: "Low" },
      { time: 14.8, survivalPct: 50, label: "Low" },
      { time: 24, survivalPct: 38, label: "Low" },
    ],
    caption: "Figure 1. Kaplan-Meier curves for progression-free survival stratified by baseline IL-6 tertile.",
  },
  {
    id: "artifact_003",
    title: "Cox Regression Coefficients",
    kind: "table",
    chartType: "Regression coefficient table",
    paperId: "paper_001",
    questionId: "rq_001",
    analysisId: "analysis_003",
    status: "generated",
    generatedAt: "2026-06-16T14:32:00Z",
    usedVariables: ["il6_baseline", "age", "sex", "stage_iv"],
    exportFormats: ["CSV", "Word", "LaTeX"],
    tableConfig: {
      columns: ["Variable", "HR", "95% CI", "p-value"],
      decimals: 2,
      showPValues: true,
      showConfidenceIntervals: true,
    },
    resultColumns: ["Variable", "HR", "95% CI", "p-value"],
    resultRows: [
      ["il6_baseline (log)", 1.42, "1.11–1.82", "0.006"],
      ["age", 1.01, "0.99–1.03", "0.241"],
      ["sex (male)", 1.08, "0.79–1.47", "0.625"],
      ["stage_iv", 1.64, "1.12–2.40", "0.011"],
    ],
    caption: "Table 2. Cox regression coefficients, hazard ratios, and 95% confidence intervals.",
  },
  {
    id: "artifact_004",
    title: "Forest Plot — Cox Regression Covariates",
    kind: "figure",
    chartType: "Forest plot",
    paperId: "paper_001",
    questionId: "rq_001",
    analysisId: "analysis_003",
    status: "publication_ready",
    generatedAt: "2026-06-16T14:45:00Z",
    usedVariables: ["il6_baseline", "age", "sex", "stage_iv"],
    exportFormats: ["PNG", "SVG"],
    figureConfig: {
      xVariable: "Hazard ratio",
      yVariable: "Covariate",
      confidenceIntervals: true,
      theme: "Clinical (default)",
      legend: false,
      referenceLines: ["HR = 1 (null effect)"],
    },
    forestPreview: [
      { label: "il6_baseline (log)", hr: 1.42, ciLow: 1.11, ciHigh: 1.82 },
      { label: "age", hr: 1.01, ciLow: 0.99, ciHigh: 1.03 },
      { label: "sex (male)", hr: 1.08, ciLow: 0.79, ciHigh: 1.47 },
      { label: "stage_iv", hr: 1.64, ciLow: 1.12, ciHigh: 2.40 },
    ],
    caption: "Figure 2. Forest plot of hazard ratios from the adjusted Cox regression model.",
  },
]

export interface SuggestedVisualization {
  id: string
  questionId: string
  chartType: string
  whyItFits: string
  variablesUsed: string[]
  supportsResult: string
  publicationReadyByDefault: boolean
  blockedReason?: string
}

export const suggestedVisualizations: SuggestedVisualization[] = [
  {
    id: "sugg_001",
    questionId: "rq_001",
    chartType: "Biomarker distribution (IL-6 by tertile)",
    whyItFits: "Shows the underlying distribution behind the tertile grouping used in the Kaplan-Meier and Cox analyses — useful as a supporting figure before the survival curves.",
    variablesUsed: ["il6_baseline"],
    supportsResult: "analysis_002",
    publicationReadyByDefault: false,
  },
  {
    id: "sugg_002",
    questionId: "rq_001",
    chartType: "Waterfall plot (individual PFS by IL-6 level)",
    whyItFits: "A waterfall view of individual patient PFS sorted by IL-6 level can make the tertile-based survival difference more intuitive for a clinical audience.",
    variablesUsed: ["il6_baseline", "pfs_months"],
    supportsResult: "analysis_002",
    publicationReadyByDefault: false,
  },
  {
    id: "sugg_003",
    questionId: "rq_001",
    chartType: "Missingness chart (ECOG, PD-L1 TPS)",
    whyItFits: "Both the Cox model's interpretation and the paper comparison call out missing ECOG/PD-L1 TPS — a missingness chart makes that limitation visible alongside the main results.",
    variablesUsed: ["ecog_status", "pdl1_tps"],
    supportsResult: "analysis_003",
    publicationReadyByDefault: false,
  },
  {
    id: "sugg_004",
    questionId: "rq_002",
    chartType: "Cox forest plot (IL-6 + CRP combined model)",
    whyItFits: "Once the combined model finishes running, a forest plot is the natural way to compare CRP's coefficient against IL-6's in the same model.",
    variablesUsed: ["il6_baseline", "crp_baseline", "age", "sex", "stage_iv"],
    supportsResult: "analysis_004",
    publicationReadyByDefault: false,
    blockedReason: "analysis_004 is still running — no coefficients to plot yet.",
  },
  {
    id: "sugg_005",
    questionId: "rq_002",
    chartType: "Baseline characteristics table (CRP-stratified)",
    whyItFits: "Mirrors artifact_001 but stratified by CRP tertile instead of IL-6, to characterize the cohort for this specific question.",
    variablesUsed: ["crp_baseline", "age", "sex", "stage_iv"],
    supportsResult: "analysis_004",
    publicationReadyByDefault: false,
    blockedReason: "analysis_004 is still running — wait for the combined model before stratifying.",
  },
]

export interface ArtifactComparison {
  id: string
  questionId: string
  label: string
  available: boolean
  leftLabel?: string
  leftValue?: string
  rightLabel?: string
  rightValue?: string
  difference?: string
  possibleReasons?: string[]
  unavailableReason?: string
}

export const artifactComparisons: ArtifactComparison[] = [
  {
    id: "cmp_001",
    questionId: "rq_001",
    label: "Paper result vs. your result",
    available: true,
    leftLabel: "Paper HR (IL-6, adjusted)",
    leftValue: "1.38 (95% CI 1.08–1.76, p=0.009)",
    rightLabel: "Your HR (analysis_003)",
    rightValue: "1.42 (95% CI 1.11–1.82, p=0.006)",
    difference: "Same direction, very similar magnitude — your estimate is slightly stronger but the confidence intervals overlap substantially.",
    possibleReasons: [
      "Your model is missing ECOG performance status and PD-L1 TPS, which the paper's full model included",
      "Two-center retrospective cohort — some sampling variability vs. the paper's 287-patient cohort is expected",
    ],
  },
  {
    id: "cmp_002",
    questionId: "rq_001",
    label: "Analysis v1 vs. v2",
    available: false,
    unavailableReason: "Only one version of this analysis has been run — no prior version exists to compare against.",
  },
  {
    id: "cmp_003",
    questionId: "rq_001",
    label: "Unadjusted vs. adjusted model",
    available: false,
    unavailableReason: "The unadjusted (IL-6-only) Cox model hasn't been run yet — run it from Analysis Execution to enable this comparison.",
  },
  {
    id: "cmp_004",
    questionId: "rq_001",
    label: "Subgroup A vs. subgroup B",
    available: false,
    unavailableReason: "No subgroup-stratified analysis exists yet — see the Subgroup recommendation in the Research Question tab.",
  },
  {
    id: "cmp_005",
    questionId: "rq_001",
    label: "Original dataset vs. cleaned dataset",
    available: false,
    unavailableReason: "This analysis was run on the cleaned dataset (v2) only — no raw-data (v1) version of this result exists to compare.",
  },
]
