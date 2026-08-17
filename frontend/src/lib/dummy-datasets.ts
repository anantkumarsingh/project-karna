export type DatasetStatus = "profiled" | "processing" | "pending"
export type LibraryStatus = "uploaded" | "profiling" | "profiled" | "needs_cleaning" | "analysis_ready" | "used_in_analysis"
export type VariableType = "continuous" | "binary" | "categorical" | "ordinal" | "time_to_event" | "date" | "identifier" | "text"

export type VariableRole =
  | "patient_id"
  | "time_index"
  | "outcome"
  | "event_indicator"
  | "exposure"
  | "treatment_group"
  | "covariate"
  | "biomarker"
  | "demographic"
  | "date"
  | "text"
  | "ignore"

export interface VariableDistribution {
  bins?: number[]
  binLabels?: string[]
  boxplot?: { min: number; q1: number; median: number; q3: number; max: number }
  valueCounts?: { label: string; count: number }[]
}

export interface DatasetVariable {
  name: string
  type: VariableType
  role: VariableRole
  missingPercent: number
  range: string
  usedAs: string
  summary: string
  outlierCount?: number
  clinicalRangeFlag?: string
  paperMatch?: string
  distribution?: VariableDistribution
}

export interface QualityCheck {
  category: "missingness" | "outliers" | "duplicates" | "invalid_values" | "type_problems" | "clinical_range" | "inconsistent_coding" | "data_leakage" | "small_groups"
  variable?: string
  issue: string
  rowsAffected?: number
  severity: "info" | "warning" | "critical"
}

export interface GroupBalanceEntry {
  group: string
  n: number
  percent: number
}

export interface GroupBalanceCheck {
  variable: string
  status: "balanced" | "imbalanced" | "missingness_differs"
  detail: string
}

export interface CorrelationEntry {
  varA: string
  varB: string
  r: number
}

export interface CleaningStep {
  id: string
  label: string
  description: string
  status: "pending" | "applied" | "disabled"
}

export interface AnalysisReadinessEntry {
  analysisType: string
  status: "ready" | "warning" | "blocked"
  missingPiece: string
  requiredVariables: string[]
  matchedVariables: string[]
  missingVariables: string[]
  warnings: string[]
}

export interface PaperAlignmentEntry {
  paperVariable: string
  datasetMatch: string
  status: "matched" | "needs_review" | "missing"
}

export interface DatasetSuggestedQuestion {
  question: string
  answer: string
  confidence: "high" | "medium" | "low"
  relatedActions: string[]
}

export interface AgentTraceEntry {
  agent: string
  action: string
  timestamp: string
}

export interface ProfiledDataset {
  id: string
  projectId: string
  filename: string
  uploadedAt: string
  status: DatasetStatus
  libraryStatus: LibraryStatus
  version: string
  derivedFrom?: string
  rows: number
  columns: number
  fileSizeKb: number
  patients?: number
  timepoints?: number

  summary?: string
  structureType?: "Cross-sectional" | "Longitudinal" | "Time-to-event"
  structureNotes?: string

  variables?: DatasetVariable[]

  totalMissingPercent?: number
  duplicateRows?: number
  qualityChecks?: QualityCheck[]

  groupBalance?: { label: string; entries: GroupBalanceEntry[] }
  groupBalanceChecks?: { label: string; checks: GroupBalanceCheck[] }
  correlations?: CorrelationEntry[]

  cleaningSteps?: CleaningStep[]
  analysisReadiness?: AnalysisReadinessEntry[]
  paperAlignment?: PaperAlignmentEntry[]
  suggestedQuestions?: DatasetSuggestedQuestion[]
  agentTrace?: AgentTraceEntry[]

  dataQualityScore?: number
  analysisReadinessScore?: number
  missingnessRisk?: "low" | "moderate" | "high"
  variableMappingProgress?: number
}

export const profiledDatasets: ProfiledDataset[] = [
  {
    id: "dataset_001",
    projectId: "project_001",
    filename: "nsclc_cohort_312_patients.csv",
    uploadedAt: "2026-05-14",
    status: "profiled",
    libraryStatus: "used_in_analysis",
    version: "v1 — raw",
    rows: 312,
    columns: 28,
    fileSizeKb: 184,
    patients: 312,
    timepoints: 1,

    summary:
      "Your dataset appears to contain 312 patients with NSCLC receiving first-line immunotherapy. It includes 6 demographic variables, 4 biomarkers, 2 time-to-event outcome pairs, and 1 treatment arm indicator. pfs_months and os_months appear to be time-to-event data, with pfs_event and os_event as their censoring indicators. This structure closely matches the variables referenced in your linked paper (Chen et al., 2024).",
    structureType: "Time-to-event",
    structureNotes:
      "Detected one row per patient (cross-sectional baseline) with two paired survival endpoints (PFS, OS). No repeated measures or visit-level structure detected — this is not longitudinal data.",

    variables: [
      { name: "patient_id", type: "identifier", role: "patient_id", missingPercent: 0, range: "1–312", usedAs: "patient identifier", summary: "Unique patient identifier" },
      { name: "age", type: "continuous", role: "covariate", missingPercent: 0, range: "34–88", usedAs: "covariate (age)", summary: "Mean 63.4 ± 9.1 years", distribution: { bins: [4, 18, 42, 68, 91, 64, 21, 4], binLabels: ["34-40", "41-47", "48-54", "55-61", "62-68", "69-75", "76-82", "83-88"], boxplot: { min: 34, q1: 57, median: 63, q3: 70, max: 88 } } },
      { name: "sex", type: "binary", role: "demographic", missingPercent: 0, range: "M/F", usedAs: "covariate (sex)", summary: "58% male, 42% female", distribution: { valueCounts: [{ label: "Male", count: 181 }, { label: "Female", count: 131 }] } },
      { name: "stage_iv", type: "binary", role: "covariate", missingPercent: 1.3, range: "0/1", usedAs: "covariate (stage IV flag)", summary: "71% stage IV, 29% stage IIIB", distribution: { valueCounts: [{ label: "Stage IV", count: 222 }, { label: "Stage IIIB", count: 90 }] } },
      { name: "histology", type: "categorical", role: "covariate", missingPercent: 2.6, range: "adenocarcinoma / squamous / other", usedAs: "covariate (histology)", summary: "68% adenocarcinoma, 29% squamous, 3% other", distribution: { valueCounts: [{ label: "Adenocarcinoma", count: 212 }, { label: "Squamous", count: 90 }, { label: "Other", count: 9 }] } },
      { name: "treatment_arm", type: "categorical", role: "treatment_group", missingPercent: 0, range: "Pembrolizumab", usedAs: "treatment group", summary: "Pembrolizumab monotherapy (100%)" },
      { name: "il6_baseline", type: "continuous", role: "biomarker", missingPercent: 0.6, range: "2.1–142.7 pg/mL", usedAs: "exposure (biomarker)", summary: "Median 18.2 pg/mL (IQR 11.4–29.8)", outlierCount: 6, distribution: { bins: [98, 92, 64, 28, 12, 8, 4, 4], binLabels: ["2-20", "20-38", "38-56", "56-74", "74-92", "92-110", "110-128", "128-143"], boxplot: { min: 2.1, q1: 11.4, median: 18.2, q3: 29.8, max: 142.7 } } },
      { name: "crp_baseline", type: "continuous", role: "biomarker", missingPercent: 3.2, range: "0.5–98.2 mg/L", usedAs: "covariate (biomarker)", summary: "Median 6.1 mg/L (IQR 2.8–14.3)", outlierCount: 9, distribution: { boxplot: { min: 0.5, q1: 2.8, median: 6.1, q3: 14.3, max: 98.2 } } },
      { name: "pdl1_tps", type: "continuous", role: "biomarker", missingPercent: 18.0, range: "0–100%", usedAs: "covariate (biomarker)", summary: "Median 65% (IQR 50–85)", clinicalRangeFlag: "Missing in 18% of patients — matches limitation noted in linked paper" },
      { name: "ecog_ps", type: "ordinal", role: "covariate", missingPercent: 22.4, range: "0–2", usedAs: "covariate (performance status)", summary: "0: 41%, 1: 47%, 2: 12%", clinicalRangeFlag: "Not present in linked paper's dataset assumptions", distribution: { valueCounts: [{ label: "0", count: 100 }, { label: "1", count: 114 }, { label: "2", count: 29 }] } },
      { name: "pfs_months", type: "continuous", role: "outcome", missingPercent: 0, range: "0.8–34.2 months", usedAs: "survival time (PFS)", summary: "Median follow-up 11.2 months" },
      { name: "pfs_event", type: "binary", role: "event_indicator", missingPercent: 0, range: "0/1", usedAs: "event (progression/death)", summary: "62% experienced progression/death" },
      { name: "os_months", type: "continuous", role: "outcome", missingPercent: 0, range: "0.8–38.6 months", usedAs: "survival time (OS)", summary: "Median follow-up 18.4 months" },
      { name: "os_event", type: "binary", role: "event_indicator", missingPercent: 0, range: "0/1", usedAs: "event (death)", summary: "34% deceased" },
      { name: "enrollment_date", type: "date", role: "date", missingPercent: 0, range: "2019-02-11 to 2022-08-30", usedAs: "metadata", summary: "Enrollment date range" },
      { name: "physician_notes", type: "text", role: "text", missingPercent: 12, range: "—", usedAs: "free text (not used in analysis)", summary: "Unstructured clinician notes" },
      { name: "internal_batch_id", type: "identifier", role: "ignore", missingPercent: 0, range: "—", usedAs: "excluded from analysis", summary: "Internal lab batch tracking code" },
    ],

    totalMissingPercent: 4.2,
    duplicateRows: 0,
    qualityChecks: [
      { category: "missingness", variable: "ecog_ps", issue: "22.4% missing — exceeds typical 10% threshold for safe imputation", severity: "warning" },
      { category: "missingness", variable: "pdl1_tps", issue: "18.0% missing — matches a documented limitation in the linked paper", severity: "warning" },
      { category: "outliers", variable: "il6_baseline", issue: "6 outlier values detected (>3×IQR)", rowsAffected: 6, severity: "info" },
      { category: "outliers", variable: "crp_baseline", issue: "9 outlier values detected (>3×IQR)", rowsAffected: 9, severity: "info" },
      { category: "duplicates", issue: "No duplicate patient_id values detected", severity: "info" },
      { category: "clinical_range", variable: "age", issue: "No impossible ages detected (range 18–120 enforced)", severity: "info" },
      { category: "clinical_range", variable: "pfs_months", issue: "No negative survival times detected", severity: "info" },
      { category: "invalid_values", variable: "pfs_event", issue: "Censoring indicator confirmed strictly binary (0/1)", severity: "info" },
      { category: "inconsistent_coding", variable: "treatment_arm", issue: "Treatment labels consistent across all rows (single arm: Pembrolizumab)", severity: "info" },
      { category: "type_problems", variable: "enrollment_date", issue: "All values parsed successfully as dates", severity: "info" },
      { category: "data_leakage", issue: "No post-outcome variables detected among candidate predictors", severity: "info" },
      { category: "small_groups", variable: "histology", issue: "\"Other\" histology category contains only 9 patients (2.9%) — consider grouping with squamous or excluding", rowsAffected: 9, severity: "warning" },
    ],

    groupBalance: {
      label: "Disease stage",
      entries: [
        { group: "Stage IV", n: 222, percent: 71 },
        { group: "Stage IIIB", n: 90, percent: 29 },
      ],
    },

    groupBalanceChecks: {
      label: "Balance across disease stage (IIIB vs. IV)",
      checks: [
        { variable: "age", status: "balanced", detail: "Mean age similar between stage IIIB (62.8) and stage IV (63.7)" },
        { variable: "sex", status: "balanced", detail: "Sex distribution similar across stage groups (57% vs. 59% male)" },
        { variable: "il6_baseline", status: "imbalanced", detail: "Median IL-6 higher in stage IV patients (19.8 vs. 14.2 pg/mL) — consider as a confounder" },
        { variable: "pdl1_tps", status: "missingness_differs", detail: "PD-L1 TPS missing in 24% of stage IV patients vs. 8% of stage IIIB" },
      ],
    },

    correlations: [
      { varA: "il6_baseline", varB: "crp_baseline", r: 0.61 },
      { varA: "il6_baseline", varB: "pfs_months", r: -0.34 },
      { varA: "crp_baseline", varB: "pfs_months", r: -0.28 },
      { varA: "age", varB: "ecog_ps", r: 0.22 },
      { varA: "pdl1_tps", varB: "pfs_months", r: 0.18 },
      { varA: "stage_iv", varB: "os_months", r: -0.31 },
    ],

    cleaningSteps: [
      { id: "s1", label: "Rename columns to snake_case", description: "Standardize raw export column headers", status: "applied" },
      { id: "s2", label: "Recode treatment labels", description: "Normalize 'Pembro' / 'pembrolizumab' / 'PEMBRO' to a single consistent label", status: "applied" },
      { id: "s3", label: "Convert pfs_event to binary", description: "Map 'progressed' / 'deceased' / 'alive' text values to 0/1", status: "applied" },
      { id: "s4", label: "Drop rows missing pfs_months", description: "Remove patients with no recorded follow-up time", status: "pending" },
      { id: "s5", label: "Create age_group variable", description: "Bucket age into <50 / 50–65 / >65 for stratified analyses", status: "pending" },
      { id: "s6", label: "Save as analysis-ready dataset", description: "Write nsclc_cohort_312_patients_cleaned_v2.csv", status: "pending" },
    ],

    analysisReadiness: [
      { analysisType: "Baseline Table", status: "ready", missingPiece: "None", requiredVariables: ["age", "sex", "stage_iv"], matchedVariables: ["age", "sex", "stage_iv"], missingVariables: [], warnings: [] },
      { analysisType: "Kaplan-Meier + Log-rank", status: "ready", missingPiece: "None", requiredVariables: ["pfs_months", "pfs_event", "il6_baseline"], matchedVariables: ["pfs_months", "pfs_event", "il6_baseline"], missingVariables: [], warnings: [] },
      { analysisType: "Cox Regression", status: "warning", missingPiece: "ECOG performance status", requiredVariables: ["pfs_months", "pfs_event", "il6_baseline", "age", "sex", "stage_iv", "ecog_ps"], matchedVariables: ["pfs_months", "pfs_event", "il6_baseline", "age", "sex", "stage_iv"], missingVariables: ["ecog_ps"], warnings: ["Proportional hazards assumption should be checked before finalizing"] },
      { analysisType: "Logistic Regression", status: "ready", missingPiece: "None", requiredVariables: ["pfs_event", "il6_baseline", "age"], matchedVariables: ["pfs_event", "il6_baseline", "age"], missingVariables: [], warnings: [] },
      { analysisType: "Repeated Measures Model", status: "blocked", missingPiece: "No repeated timepoint variable", requiredVariables: ["visit/time index", "outcome measured per visit"], matchedVariables: [], missingVariables: ["visit index", "repeated outcome measurements"], warnings: ["Dataset is baseline + single follow-up endpoint — no repeated-measures structure detected"] },
      { analysisType: "Propensity Score Matching", status: "warning", missingPiece: "Only one treatment arm present", requiredVariables: ["treatment arm (2+ levels)", "covariates"], matchedVariables: ["age", "sex", "stage_iv"], missingVariables: ["a comparator treatment arm"], warnings: ["All patients received the same treatment — PSM requires at least two groups to balance"] },
    ],

    paperAlignment: [
      { paperVariable: "overall survival", datasetMatch: "os_months + os_event", status: "matched" },
      { paperVariable: "baseline serum IL-6", datasetMatch: "il6_baseline", status: "matched" },
      { paperVariable: "ECOG performance status", datasetMatch: "—", status: "missing" },
      { paperVariable: "disease stage", datasetMatch: "stage_iv", status: "needs_review" },
      { paperVariable: "PD-L1 TPS", datasetMatch: "pdl1_tps", status: "matched" },
    ],

    suggestedQuestions: [
      { question: "What variables look like outcomes?", answer: "pfs_months/pfs_event and os_months/os_event are your two outcome pairs — both are time-to-event endpoints with paired censoring indicators.", confidence: "high", relatedActions: ["Map Variables"] },
      { question: "Which variables have the most missing data?", answer: "ecog_ps (22.4%) and pdl1_tps (18.0%) have the most missingness — both exceed the typical 10% threshold for safe imputation.", confidence: "high", relatedActions: [] },
      { question: "Can this dataset support survival analysis?", answer: "Yes. Both PFS and OS have valid time + event indicator pairs, no negative survival times, and event indicators are confirmed strictly binary.", confidence: "high", relatedActions: ["Create Analysis"] },
      { question: "What cleaning steps should I do first?", answer: "Drop rows missing pfs_months and create an age_group variable before running stratified analyses — both are still pending in the cleaning pipeline.", confidence: "medium", relatedActions: [] },
      { question: "Which variables match the paper?", answer: "il6_baseline and pdl1_tps match directly. stage_iv needs review since the paper used a 3-level stage variable. ECOG score has no match in this dataset.", confidence: "high", relatedActions: ["Map to Paper"] },
      { question: "What analyses are ready to run?", answer: "Baseline Table, Kaplan-Meier + Log-rank, and Logistic Regression are fully ready. Cox Regression works but is missing ECOG as a covariate.", confidence: "high", relatedActions: ["Create Analysis"] },
    ],

    agentTrace: [
      { agent: "Data Agent", action: "Profiled schema — detected 28 columns, inferred types for 17 key variables", timestamp: "2026-05-14T09:02:00Z" },
      { agent: "Data Agent", action: "Flagged ecog_ps and pdl1_tps as high-missingness variables", timestamp: "2026-05-14T09:04:00Z" },
      { agent: "Critic Agent", action: "Confirmed pfs_event and os_event are strictly binary censoring indicators", timestamp: "2026-05-14T09:05:00Z" },
      { agent: "Memory Agent", action: "Matched 8 of 12 paper variables from Chen et al. 2024 to dataset columns", timestamp: "2026-05-14T09:07:00Z" },
    ],

    dataQualityScore: 84,
    analysisReadinessScore: 78,
    missingnessRisk: "moderate",
    variableMappingProgress: 67,
  },
  {
    id: "dataset_001_v2",
    projectId: "project_001",
    filename: "nsclc_cohort_312_patients_cleaned_v2.csv",
    uploadedAt: "2026-06-17",
    status: "profiled",
    libraryStatus: "analysis_ready",
    version: "v2 — cleaned",
    derivedFrom: "dataset_001",
    rows: 308,
    columns: 30,
    fileSizeKb: 191,
    patients: 308,
    timepoints: 1,
    summary: "Cleaned, analysis-ready version of the raw cohort: treatment labels normalized, pfs_event recoded to strict binary, age_group derived, and 4 rows with missing pfs_months dropped. Raw v1 is preserved untouched.",
    dataQualityScore: 91,
    analysisReadinessScore: 92,
    missingnessRisk: "low",
    variableMappingProgress: 67,
  },
  {
    id: "dataset_002",
    projectId: "project_001",
    filename: "cohort_validation_set_88.xlsx",
    uploadedAt: "2026-06-16",
    status: "pending",
    libraryStatus: "uploaded",
    version: "v1 — raw",
    rows: 88,
    columns: 19,
    fileSizeKb: 52,
  },
  {
    id: "dataset_101",
    projectId: "project_002",
    filename: "t2d_depression_cohort_150_patients.csv",
    uploadedAt: "2026-06-21",
    status: "profiled",
    libraryStatus: "analysis_ready",
    version: "v1 — raw",
    rows: 150,
    columns: 14,
    fileSizeKb: 61,
    patients: 150,
    timepoints: 1,

    summary:
      "150 adults with type 2 diabetes from a single outpatient endocrinology clinic. Includes PHQ-9 depressive symptom score, HbA1c, medication adherence percentage, age, sex, and diabetes duration. Cross-sectional — one row per patient.",
    structureType: "Cross-sectional",
    structureNotes: "One row per patient, no repeated measures or visit-level structure detected.",

    variables: [
      { name: "patient_id", type: "identifier", role: "patient_id", missingPercent: 0, range: "1–150", usedAs: "patient identifier", summary: "Unique patient identifier" },
      { name: "age", type: "continuous", role: "covariate", missingPercent: 0, range: "31–79", usedAs: "covariate (age)", summary: "Mean 58.2 ± 11.4 years" },
      { name: "sex", type: "binary", role: "demographic", missingPercent: 0, range: "M/F", usedAs: "covariate (sex)", summary: "47% male, 53% female" },
      { name: "phq9_score", type: "continuous", role: "biomarker", missingPercent: 2.0, range: "0–24", usedAs: "exposure (depressive symptom severity)", summary: "Median 7 (IQR 3–12)" },
      { name: "hba1c", type: "continuous", role: "outcome", missingPercent: 0, range: "5.4–11.2%", usedAs: "glycemic control outcome", summary: "Median 7.6% (IQR 6.8–8.9)" },
      { name: "medication_adherence_pct", type: "continuous", role: "covariate", missingPercent: 4.7, range: "40–100%", usedAs: "covariate (adherence)", summary: "Median 82% (IQR 68–93)" },
      { name: "diabetes_duration_years", type: "continuous", role: "covariate", missingPercent: 0, range: "0.5–28", usedAs: "covariate (disease duration)", summary: "Median 6.5 years (IQR 3–11)" },
    ],

    totalMissingPercent: 3.1,
    duplicateRows: 0,

    dataQualityScore: 88,
    analysisReadinessScore: 85,
    missingnessRisk: "low",
    variableMappingProgress: 100,

    paperAlignment: [
      { paperVariable: "phq9_score", datasetMatch: "phq9_score", status: "matched" },
      { paperVariable: "hba1c", datasetMatch: "hba1c", status: "matched" },
      { paperVariable: "medication_adherence", datasetMatch: "medication_adherence_pct", status: "matched" },
    ],
  },
]
