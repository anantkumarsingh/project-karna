export type AnalysisStatus = "completed" | "running" | "queued" | "failed" | "draft" | "ready"
export type AssumptionResult = "pass" | "warning" | "fail"

export interface AssumptionCheck {
  name: string
  result: AssumptionResult
  detail: string
}

export interface ResultTable {
  columns: string[]
  rows: (string | number)[][]
}

export interface ReproducibilityMeta {
  scriptVersion: string
  randomSeed?: number
  packages: string[]
  runtimeSeconds: number
}

export interface ExecutedAnalysis {
  id: string
  name: string
  type: string
  status: AnalysisStatus
  runAt: string
  agent: string
  scriptUsed: string
  provenance: string
  researchQuestionId?: string
  projectId?: string // fallback project scope for drafts not yet linked to a research question
  favorite?: boolean

  interpretation?: string
  resultTable?: ResultTable
  statisticalOutput?: string[]
  assumptionsChecked?: AssumptionCheck[]
  warnings?: string[]
  codeUsed?: string
  reproducibility?: ReproducibilityMeta
  exportFormats?: string[]
}

export const executedAnalyses: ExecutedAnalysis[] = [
  {
    id: "analysis_003",
    name: "Cox Regression — IL-6 adjusted for age, sex, stage",
    type: "Cox Proportional Hazards",
    status: "completed",
    runAt: "2026-06-16T14:32:00Z",
    agent: "Stats Agent",
    scriptUsed: "survival_cox_adjusted.py",
    provenance: "Rulebook + New reasoning",
    researchQuestionId: "rq_001",

    interpretation:
      "After adjusting for age, sex, and disease stage, each one-unit increase in log-transformed baseline IL-6 was associated with a 42% increase in the hazard of progression or death (HR 1.42). This effect is statistically significant (p = 0.006) and clinically meaningful, supporting IL-6 as an independent prognostic biomarker in this cohort — consistent with the linked paper's finding (HR 1.38, p = 0.009).",

    resultTable: {
      columns: ["Variable", "HR", "95% CI", "p-value"],
      rows: [
        ["il6_baseline (log)", 1.42, "1.11–1.82", "0.006"],
        ["age", 1.01, "0.99–1.03", "0.241"],
        ["sex (male)", 1.08, "0.79–1.47", "0.625"],
        ["stage_iv", 1.64, "1.12–2.40", "0.011"],
      ],
    },

    statisticalOutput: [
      "Concordance index: 0.64",
      "Likelihood ratio test: χ² = 18.3, df = 4, p < 0.001",
      "Events: 194 of 312 patients (62.2%)",
      "Log-transformation applied to il6_baseline to reduce right-skew",
    ],

    assumptionsChecked: [
      { name: "Proportional hazards (Schoenfeld residuals)", result: "pass", detail: "Global test p = 0.21 — no violation detected across covariates." },
      { name: "Multicollinearity (VIF)", result: "pass", detail: "All covariates VIF < 1.8 — no concerning collinearity." },
      { name: "Events-per-variable ratio", result: "pass", detail: "194 events / 4 covariates ≈ 48.5 — well above the conventional minimum of 10." },
      { name: "Linearity of log-hazard", result: "warning", detail: "Martingale residual plot shows mild non-linearity at high IL-6 values — consider a restricted cubic spline in a sensitivity analysis." },
    ],

    warnings: [
      "ECOG performance status and PD-L1 TPS were not available in this dataset and could not be included as covariates, unlike the linked paper.",
      "18% of patients are missing pdl1_tps — if added later, consider multiple imputation rather than complete-case analysis.",
    ],

    codeUsed: `import pandas as pd
from lifelines import CoxPHFitter

df = pd.read_csv("nsclc_cohort_312_patients.csv")
df["il6_log"] = np.log(df["il6_baseline"])

cph = CoxPHFitter()
cph.fit(
    df[["pfs_months", "pfs_event", "il6_log", "age", "sex", "stage_iv"]],
    duration_col="pfs_months",
    event_col="pfs_event",
)
cph.print_summary()
cph.check_assumptions(df, p_value_threshold=0.05)`,

    reproducibility: {
      scriptVersion: "survival_cox_adjusted.py v3",
      randomSeed: 42,
      packages: ["lifelines==0.27.8", "pandas==2.2.1", "numpy==1.26.4"],
      runtimeSeconds: 2.4,
    },
    exportFormats: ["CSV", "PNG", "PDF report snippet"],
  },

  {
    id: "analysis_002",
    name: "Kaplan-Meier — PFS by IL-6 tertile",
    type: "Kaplan-Meier Survival",
    status: "completed",
    runAt: "2026-06-15T10:14:00Z",
    agent: "Stats Agent",
    scriptUsed: "survival_kaplan_meier.py",
    provenance: "Rulebook",
    researchQuestionId: "rq_001",

    interpretation:
      "Patients were split into IL-6 tertiles (low/mid/high). The high-IL-6 tertile showed clearly shorter progression-free survival than the low tertile, with separation emerging around 6 months and widening through 18 months. The log-rank test confirms this separation is unlikely due to chance (p = 0.003).",

    resultTable: {
      columns: ["IL-6 tertile", "n", "Median PFS (months)", "Events"],
      rows: [
        ["Low (<11.4 pg/mL)", 104, 14.8, 54],
        ["Mid (11.4–29.8 pg/mL)", 104, 11.2, 67],
        ["High (>29.8 pg/mL)", 104, 7.6, 73],
      ],
    },

    statisticalOutput: [
      "Log-rank test: χ² = 11.6, df = 2, p = 0.003",
      "Pairwise low vs. high: p = 0.001",
      "Pairwise low vs. mid: p = 0.084 (not significant after correction)",
    ],

    assumptionsChecked: [
      { name: "Independent censoring", result: "pass", detail: "No evidence that censoring is related to IL-6 tertile (censoring pattern checked across groups)." },
      { name: "Sufficient sample per group", result: "pass", detail: "104 patients per tertile, adequate for stable Kaplan-Meier estimation." },
    ],

    warnings: [],

    codeUsed: `from lifelines import KaplanMeierFitter
from lifelines.statistics import multivariate_logrank_test

kmf = KaplanMeierFitter()
for tertile, group in df.groupby("il6_tertile"):
    kmf.fit(group["pfs_months"], group["pfs_event"], label=tertile)
    kmf.plot_survival_function()

results = multivariate_logrank_test(
    df["pfs_months"], df["il6_tertile"], df["pfs_event"]
)
results.print_summary()`,

    reproducibility: {
      scriptVersion: "survival_kaplan_meier.py v2",
      packages: ["lifelines==0.27.8", "matplotlib==3.8.3"],
      runtimeSeconds: 1.1,
    },
    exportFormats: ["PNG", "SVG", "PDF"],
  },

  {
    id: "analysis_001",
    name: "Descriptive statistics — baseline cohort",
    type: "Descriptive Statistics",
    status: "completed",
    runAt: "2026-05-15T09:00:00Z",
    agent: "Data Agent",
    scriptUsed: "clinical_baseline_table.py",
    provenance: "Deterministic computation",
    researchQuestionId: "rq_001",

    interpretation:
      "The cohort is broadly representative of the population described in the linked paper (mean age 63.4 vs. 64.1, similar sex distribution), supporting external validity of downstream comparisons.",

    resultTable: {
      columns: ["Variable", "Summary"],
      rows: [
        ["Age", "63.4 ± 9.1 years"],
        ["Sex", "58% male, 42% female"],
        ["Stage IV", "71%"],
        ["IL-6 baseline", "Median 18.2 pg/mL (IQR 11.4–29.8)"],
        ["CRP baseline", "Median 6.1 mg/L (IQR 2.8–14.3)"],
      ],
    },

    statisticalOutput: ["n = 312", "No statistical testing performed — descriptive only"],
    assumptionsChecked: [],
    warnings: [],

    codeUsed: `import pandas as pd

summary = df.describe(include="all").T
summary.to_csv("baseline_table.csv")`,

    reproducibility: {
      scriptVersion: "clinical_baseline_table.py v1",
      packages: ["pandas==2.2.1"],
      runtimeSeconds: 0.3,
    },
    exportFormats: ["CSV"],
  },

  {
    id: "analysis_004",
    name: "Cox Regression — CRP added to IL-6 model",
    type: "Cox Proportional Hazards",
    status: "running",
    runAt: "2026-06-17T16:05:00Z",
    agent: "Code Agent",
    scriptUsed: "survival_cox_adjusted.py",
    provenance: "New reasoning",
    researchQuestionId: "rq_002",
  },

  {
    id: "analysis_101",
    name: "Logistic Regression — PHQ-9 predicting poor glycemic control",
    type: "Logistic Regression",
    status: "queued",
    runAt: "2026-06-22T11:00:00Z",
    agent: "Stats Agent",
    scriptUsed: "logistic_regression.py",
    provenance: "New reasoning",
    researchQuestionId: "rq_101",
  },
]
