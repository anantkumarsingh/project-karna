export type SectionId =
  | "research_question"
  | "hypothesis"
  | "methods"
  | "dataset"
  | "statistical_analysis"
  | "results"
  | "figures"
  | "tables"
  | "interpretation"
  | "limitations"
  | "clinical_relevance"
  | "reproducibility_notes"
  | "appendix"

export const SECTION_ORDER: { id: SectionId; title: string }[] = [
  { id: "research_question", title: "Research Question" },
  { id: "hypothesis", title: "Hypothesis" },
  { id: "methods", title: "Methods" },
  { id: "dataset", title: "Dataset" },
  { id: "statistical_analysis", title: "Statistical Analysis" },
  { id: "results", title: "Results" },
  { id: "figures", title: "Figures" },
  { id: "tables", title: "Tables" },
  { id: "interpretation", title: "Interpretation" },
  { id: "limitations", title: "Limitations" },
  { id: "clinical_relevance", title: "Clinical Relevance" },
  { id: "reproducibility_notes", title: "Reproducibility Notes" },
  { id: "appendix", title: "Appendix" },
]

export type ClaimStatus = "supported" | "warning" | "unsupported"
export type SourceType = "analysis" | "figure" | "table" | "paper" | "rulebook"

export interface ClaimSource {
  type: SourceType
  refId: string
  label: string
}

export interface Claim {
  id: string
  sectionId: SectionId
  text: string
  sources: ClaimSource[]
  status: ClaimStatus
  warningDetail?: string
}

export type SectionStatus = "empty" | "drafted" | "edited"

export interface ReportSection {
  id: SectionId
  title: string
  body: string
  status: SectionStatus
  claims: Claim[]
}

export interface QuestionReportData {
  questionId: string
  paperId: string
  status: "not_started" | "draft_in_progress" | "draft_complete" | "validated" | "exported"
  included: string[]
  missing: string[]
  sections: ReportSection[]
}

export interface ValidationCheck {
  id: string
  questionId: string
  label: string
  result: "passed" | "warning" | "failed"
  detail: string
  claimId?: string
}

/* ---------------- rq_001 — fully drafted report ---------------- */

const rq001Sections: ReportSection[] = [
  {
    id: "research_question",
    title: "Research Question",
    status: "drafted",
    body: "Are baseline serum IL-6 levels independently associated with progression-free survival after adjusting for age, sex, and disease stage?",
    claims: [],
  },
  {
    id: "hypothesis",
    title: "Hypothesis",
    status: "drafted",
    body: "We hypothesized that higher baseline serum IL-6 is independently associated with shorter progression-free survival after adjusting for age, sex, and disease stage. The null hypothesis is that no such association exists once these covariates are accounted for.",
    claims: [],
  },
  {
    id: "methods",
    title: "Methods",
    status: "drafted",
    body: "Following the approach described in Chen et al. (2024), we fit a multivariable Cox proportional hazards model with baseline serum IL-6 (log-transformed) as the primary exposure and progression-free survival as the outcome, adjusting for age, sex, and disease stage. Kaplan-Meier curves stratified by IL-6 tertile were generated as a complementary, non-parametric view of the same relationship.",
    claims: [
      {
        id: "claim_methods_001",
        sectionId: "methods",
        text: "Following the approach described in Chen et al. (2024), we fit a multivariable Cox proportional hazards model...",
        sources: [{ type: "paper", refId: "paper_001", label: "Chen et al. (2024), Methods, p. 3" }],
        status: "supported",
      },
    ],
  },
  {
    id: "dataset",
    title: "Dataset",
    status: "drafted",
    body: "The analysis used the cleaned NSCLC cohort (n = 312 patients receiving first-line pembrolizumab monotherapy). ECOG performance status was missing in 22.4% of patients and PD-L1 TPS in 18.0%, consistent with a previously documented limitation relative to the source paper's full covariate set.",
    claims: [
      {
        id: "claim_dataset_001",
        sectionId: "dataset",
        text: "The analysis used the cleaned NSCLC cohort (n = 312 patients receiving first-line pembrolizumab monotherapy).",
        sources: [{ type: "analysis", refId: "analysis_001", label: "Descriptive statistics — baseline cohort" }],
        status: "supported",
      },
      {
        id: "claim_dataset_002",
        sectionId: "dataset",
        text: "ECOG performance status was missing in 22.4% of patients and PD-L1 TPS in 18.0%...",
        sources: [{ type: "rulebook", refId: "dataset_001_v2", label: "Data Understanding — Quality checks" }],
        status: "supported",
      },
    ],
  },
  {
    id: "statistical_analysis",
    title: "Statistical Analysis",
    status: "drafted",
    body: "A multivariable Cox proportional hazards model was fit with IL-6 (log-transformed), age, sex, and stage_iv as covariates. Proportional hazards, multicollinearity (VIF), and events-per-variable ratio were checked and passed; mild non-linearity at high IL-6 values was flagged as a sensitivity-analysis consideration.",
    claims: [
      {
        id: "claim_stats_001",
        sectionId: "statistical_analysis",
        text: "Proportional hazards, multicollinearity (VIF), and events-per-variable ratio were checked and passed.",
        sources: [{ type: "analysis", refId: "analysis_003", label: "Cox Regression — IL-6 adjusted for age, sex, stage" }],
        status: "supported",
      },
    ],
  },
  {
    id: "results",
    title: "Results",
    status: "drafted",
    body: "After adjusting for age, sex, and disease stage, each one-unit increase in log-transformed baseline IL-6 was associated with a 42% increase in the hazard of progression or death (HR 1.42, 95% CI 1.11–1.82). This association was statistically significant (p = 0.01). Kaplan-Meier curves stratified by IL-6 tertile showed clear separation, with the high-IL-6 tertile having a median PFS of 7.6 months versus 14.8 months in the low tertile (log-rank p = 0.003).",
    claims: [
      {
        id: "claim_results_001",
        sectionId: "results",
        text: "After adjusting for age, sex, and disease stage, each one-unit increase in log-transformed baseline IL-6 was associated with a 42% increase in the hazard of progression or death (HR 1.42, 95% CI 1.11–1.82).",
        sources: [
          { type: "analysis", refId: "analysis_003", label: "Cox Regression — IL-6 adjusted for age, sex, stage" },
          { type: "table", refId: "artifact_003", label: "Table 2: Cox Regression Coefficients" },
          { type: "figure", refId: "artifact_004", label: "Figure 2: Forest Plot — Cox Regression Covariates" },
        ],
        status: "supported",
      },
      {
        id: "claim_results_002",
        sectionId: "results",
        text: "This association was statistically significant (p = 0.01).",
        sources: [{ type: "analysis", refId: "analysis_003", label: "Cox Regression — IL-6 adjusted for age, sex, stage" }],
        status: "warning",
        warningDetail: "Draft states p = 0.01, but the latest model output (analysis_003) reports p = 0.006. Update the draft text or confirm which value is current before exporting.",
      },
      {
        id: "claim_results_003",
        sectionId: "results",
        text: "Kaplan-Meier curves stratified by IL-6 tertile showed clear separation, with the high-IL-6 tertile having a median PFS of 7.6 months versus 14.8 months in the low tertile (log-rank p = 0.003).",
        sources: [
          { type: "analysis", refId: "analysis_002", label: "Kaplan-Meier — PFS by IL-6 tertile" },
          { type: "figure", refId: "artifact_002", label: "Figure 1: Kaplan-Meier — PFS by IL-6 Tertile" },
        ],
        status: "supported",
      },
    ],
  },
  {
    id: "figures",
    title: "Figures",
    status: "drafted",
    body: "Figure 1. Kaplan-Meier curves for progression-free survival stratified by baseline IL-6 tertile.\nFigure 2. Forest plot of hazard ratios from the adjusted Cox regression model.",
    claims: [],
  },
  {
    id: "tables",
    title: "Tables",
    status: "drafted",
    body: "Table 1. Baseline characteristics of the analysis cohort (n = 312).\nTable 2. Cox regression coefficients, hazard ratios, and 95% confidence intervals.",
    claims: [],
  },
  {
    id: "interpretation",
    title: "Interpretation",
    status: "drafted",
    body: "These results demonstrate that elevated baseline IL-6 causes faster disease progression in this cohort, independent of age, sex, and disease stage. The direction and approximate magnitude of the association are consistent with the source paper's reported finding (HR 1.38).",
    claims: [
      {
        id: "claim_interp_001",
        sectionId: "interpretation",
        text: "These results demonstrate that elevated baseline IL-6 causes faster disease progression in this cohort, independent of age, sex, and disease stage.",
        sources: [{ type: "analysis", refId: "analysis_003", label: "Cox Regression — IL-6 adjusted for age, sex, stage" }],
        status: "warning",
        warningDetail: "This is a retrospective observational cohort study — the data support an association, not a causal claim. Consider rephrasing \"causes\" to \"is associated with.\"",
      },
    ],
  },
  {
    id: "limitations",
    title: "Limitations",
    status: "drafted",
    body: "This analysis has several limitations consistent with the source dataset and paper: a retrospective, two-center observational design limits causal inference; ECOG performance status and PD-L1 TPS were unavailable and could not be included as covariates, unlike the linked paper's full model; IL-6 was measured at a single baseline timepoint; and PD-L1 TPS is missing in 18% of patients, which would need to be addressed (e.g. via multiple imputation) before any biomarker-interaction analysis.",
    claims: [],
  },
  {
    id: "clinical_relevance",
    title: "Clinical Relevance",
    status: "drafted",
    body: "If replicated prospectively, baseline IL-6 could serve as a low-cost adjunct biomarker for risk-stratifying patients before first-line immunotherapy. The current effect size (HR 1.42) is statistically robust in this cohort, but its clinical utility — e.g. a concrete IL-6 threshold that would change a treatment decision — has not yet been established.",
    claims: [],
  },
  {
    id: "reproducibility_notes",
    title: "Reproducibility Notes",
    status: "drafted",
    body: "Cox model: survival_cox_adjusted.py v3 (lifelines==0.27.8, pandas==2.2.1, numpy==1.26.4), random seed 42, runtime 2.4s. Kaplan-Meier: survival_kaplan_meier.py v2 (lifelines==0.27.8, matplotlib==3.8.3), runtime 1.1s. Rulebook: pfs_months mapped as the survival time variable; pfs_event mapped as the event/censoring indicator; Cox regression adjusted for age, sex, and stage_iv for all survival endpoints in this project.",
    claims: [
      {
        id: "claim_repro_001",
        sectionId: "reproducibility_notes",
        text: "Cox model: survival_cox_adjusted.py v3 (lifelines==0.27.8, pandas==2.2.1, numpy==1.26.4), random seed 42, runtime 2.4s.",
        sources: [{ type: "analysis", refId: "analysis_003", label: "Cox Regression — IL-6 adjusted for age, sex, stage" }],
        status: "supported",
      },
    ],
  },
  {
    id: "appendix",
    title: "Appendix",
    status: "empty",
    body: "",
    claims: [],
  },
]

const rq001Checks: ValidationCheck[] = [
  { id: "check_001", questionId: "rq_001", label: "Results text matches latest analysis output", result: "failed", detail: "The p-value claim in Results (p = 0.01) does not match analysis_003's reported p = 0.006.", claimId: "claim_results_002" },
  { id: "check_002", questionId: "rq_001", label: "Figure 1 generated from a real analysis run", result: "passed", detail: "Figure 1 (artifact_002) was generated from analysis_002 — provenance confirmed." },
  { id: "check_003", questionId: "rq_001", label: "No unsupported causal claims", result: "warning", detail: "Interpretation states IL-6 \"causes\" faster progression — this is an observational study and should be phrased as an association.", claimId: "claim_interp_001" },
  { id: "check_004", questionId: "rq_001", label: "Methods match covariates used in source paper", result: "warning", detail: "ECOG performance status and PD-L1 TPS are in the source paper's model but missing from this dataset and excluded here." },
  { id: "check_005", questionId: "rq_001", label: "Limitations section present", result: "passed", detail: "Limitations section is drafted and covers design, missing covariates, and measurement timing." },
  { id: "check_006", questionId: "rq_001", label: "Latest dataset version used", result: "passed", detail: "Analysis was run on the cleaned dataset (dataset_001_v2), not the raw upload." },
  { id: "check_007", questionId: "rq_001", label: "Paper citations present", result: "passed", detail: "Methods and Interpretation both cite the source paper (Chen et al., 2024)." },
  { id: "check_008", questionId: "rq_001", label: "Rulebook / provenance included", result: "passed", detail: "Reproducibility Notes section includes script versions, package versions, and rulebook variable mappings." },
  { id: "check_009", questionId: "rq_001", label: "Clinical vs. statistical significance distinguished", result: "warning", detail: "Clinical Relevance notes the effect is \"statistically robust\" but does not yet state a concrete clinical decision threshold — consider clarifying this distinction." },
  { id: "check_010", questionId: "rq_001", label: "All figures and tables have captions", result: "passed", detail: "Both figures and both tables have captions assigned in the Artifacts tab." },
]

/* ---------------- rq_002 — thin report, analysis still running ---------------- */

const rq002Sections: ReportSection[] = SECTION_ORDER.map(({ id, title }) => ({
  id,
  title,
  status: "empty" as SectionStatus,
  body: "",
  claims: [],
}))

const rq002Checks: ValidationCheck[] = [
  { id: "check_101", questionId: "rq_002", label: "Results text matches latest analysis output", result: "warning", detail: "analysis_004 (the combined IL-6 + CRP model) is still running — no results exist yet to validate against." },
]

const rq101Sections: ReportSection[] = SECTION_ORDER.map(({ id, title }) => ({
  id,
  title,
  status: "empty" as SectionStatus,
  body: "",
  claims: [],
}))

export const questionReports: QuestionReportData[] = [
  {
    questionId: "rq_001",
    paperId: "paper_001",
    status: "draft_in_progress",
    included: [
      "Cox regression run (analysis_003)",
      "Kaplan-Meier figure (artifact_002)",
      "Baseline characteristics table (artifact_001)",
      "Paper methods evidence",
      "Dataset summary",
    ],
    missing: ["Appendix / supplementary materials"],
    sections: rq001Sections,
  },
  {
    questionId: "rq_002",
    paperId: "paper_001",
    status: "not_started",
    included: [],
    missing: SECTION_ORDER.map((s) => s.title),
    sections: rq002Sections,
  },
  {
    questionId: "rq_101",
    paperId: "paper_101",
    status: "not_started",
    included: [],
    missing: SECTION_ORDER.map((s) => s.title),
    sections: rq101Sections,
  },
]

export const validationChecks: ValidationCheck[] = [...rq001Checks, ...rq002Checks]
