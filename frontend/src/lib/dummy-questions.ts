export type QuestionStatus =
  | "draft"
  | "needs_mapping"
  | "feasible"
  | "feasible_with_caveats"
  | "blocked"
  | "ready_for_analysis"
  | "used_in_analysis"
  | "archived"

export type QuestionType = "Association" | "Prediction" | "Comparison" | "Survival" | "Mediation" | "Subgroup" | "Replication" | "Exploratory"

export type MatchLevel = "matched" | "partial" | "missing"
export type StrengthLevel = "strong" | "moderate" | "weak"
export type RiskLevel = "low" | "moderate" | "high"

export interface FeasibilityBreakdown {
  outcome: MatchLevel
  exposure: MatchLevel
  covariatesMatched: string
  sampleSize: "acceptable" | "small" | "inadequate"
  missingness: "ok" | "warning" | "critical"
  designFit: string
  recommendedAnalysisNote: string
}

export interface Feasibility {
  paperSupport: StrengthLevel
  datasetSupport: StrengthLevel
  statisticalViability: StrengthLevel
  clinicalRelevance: StrengthLevel
  riskOfBias: RiskLevel
  overall: string
  breakdown: FeasibilityBreakdown
}

export interface EvidenceEntry {
  section: string
  quote: string
  pageRef: string
  confidence: "high" | "medium" | "low"
}

export interface QuestionConcept {
  name: string
  whyItMatters: string
  howToCheck: string
}

export interface SuggestedPaper {
  title: string
  whyItHelps: string
  howItConnects: string
}

export interface QuestionVersion {
  label: string
  question: string
}

export interface AgentTraceEntry {
  agent: string
  action: string
  timestamp: string
}

export interface ResearchQuestionDetail {
  id: string
  projectId: string
  paperId: string
  question: string
  createdAt: string
  status: QuestionStatus
  questionType?: QuestionType

  population?: string
  dependentVariable?: string
  independentVariable?: string
  covariates?: string[]
  hypothesis?: string
  endpoint?: string
  statisticalFamily?: string
  primaryAnalysis?: string
  alternativeAnalyses?: string[]
  assumptionsToCheck?: string[]

  nullHypothesis?: string
  alternativeHypothesis?: string
  expectedDirection?: string

  feasibility?: Feasibility
  evidenceMap?: EvidenceEntry[]
  limitations?: string[]
  relatedConcepts?: QuestionConcept[]
  suggestedPapers?: SuggestedPaper[]
  gapSource?: string
  versions?: QuestionVersion[]
  agentTrace?: AgentTraceEntry[]

  linkedAnalysisIds: string[]
}

/* ---------------- Recommended Questions ---------------- */

export type RecommendationGroup = "paper_focused_direct" | "paper_focused_reference" | "cross_concept"

export interface ConfidenceScores {
  paperSupport: StrengthLevel
  datasetFeasibility: StrengthLevel
  statisticalViability: StrengthLevel
  novelty: StrengthLevel
}

export interface RecommendedQuestion {
  id: string
  projectId: string
  paperId: string
  group: RecommendationGroup
  category: "Direct Replication" | "Subgroup" | "Alternative Outcome" | "Covariate/Confounder" | "Methodological" | "Conceptual"
  question: string
  idea: string
  whyItMatters: string
  paperEvidence: string
  datasetFeasibility: { variable: string; status: MatchLevel }[]
  confidence: ConfidenceScores
  recommendedAnalysis: string
  recommendedTests: string[]
  concreteApproach: string[]
  limitations: string[]
  status: string
  gapSource?: string

  // paper_focused_reference only
  referenceTitle?: string
  referenceAuthors?: string
  howReferenceConnects?: string

  // cross_concept only
  concept?: string
  conceptField?: string
  whyItConnects?: string
  feasibilityNote?: string

  // optional rich detail — lets a recommendation card drive Feasibility/Evidence/Plan tabs
  // before the user has "used" it
  feasibility?: Feasibility
  evidenceMap?: EvidenceEntry[]
  assumptionsToCheck?: string[]
}

export const researchQuestions: ResearchQuestionDetail[] = [
  {
    id: "rq_001",
    projectId: "project_001",
    paperId: "paper_001",
    question:
      "Are baseline serum IL-6 levels independently associated with progression-free survival after adjusting for age, sex, and disease stage?",
    createdAt: "2026-05-14",
    status: "used_in_analysis",
    questionType: "Survival",

    population: "All 312 patients in the NSCLC cohort receiving first-line pembrolizumab monotherapy",
    dependentVariable: "pfs_months (time-to-event), censored by pfs_event",
    independentVariable: "il6_baseline (continuous, log-transformed)",
    covariates: ["age", "sex", "stage_iv"],
    hypothesis:
      "Higher baseline serum IL-6 is independently associated with shorter progression-free survival after adjusting for age, sex, and disease stage.",
    endpoint: "Progression-free survival (PFS) per RECIST 1.1",
    statisticalFamily: "Time-to-event / survival analysis",
    primaryAnalysis: "Multivariable Cox proportional hazards regression — IL-6 adjusted for age, sex, and stage_iv",
    alternativeAnalyses: [
      "Kaplan-Meier survival curves stratified by IL-6 tertile, with log-rank test",
      "Logistic regression on a fixed 6-month progression cutoff, as a simplification if the proportional hazards assumption fails",
    ],
    assumptionsToCheck: [
      "Proportional hazards assumption (Schoenfeld residuals)",
      "No excessive multicollinearity among covariates (VIF)",
      "Sufficient events-per-variable ratio for stable Cox estimates",
      "Linearity of log-hazard for continuous IL-6, or consider categorizing into tertiles",
    ],

    nullHypothesis: "There is no association between baseline serum IL-6 and progression-free survival after adjusting for age, sex, and disease stage.",
    alternativeHypothesis: "Higher baseline serum IL-6 is associated with shorter progression-free survival after adjusting for age, sex, and disease stage.",
    expectedDirection: "Higher IL-6 → shorter PFS (positive hazard ratio, HR > 1)",

    feasibility: {
      paperSupport: "strong",
      datasetSupport: "strong",
      statisticalViability: "strong",
      clinicalRelevance: "strong",
      riskOfBias: "moderate",
      overall: "Feasible — ready for analysis. This is a direct replication of the paper's core finding. Retrospective, two-center design means results should be read as hypothesis-confirming, not definitive causal evidence.",
      breakdown: {
        outcome: "matched",
        exposure: "matched",
        covariatesMatched: "3/5 (ECOG, PD-L1 TPS missing)",
        sampleSize: "acceptable",
        missingness: "warning",
        designFit: "Observational retrospective cohort — supports association, not causal treatment-effect claims",
        recommendedAnalysisNote: "Adjusted Cox regression; run a sensitivity analysis noting ECOG/PD-L1 are unavailable",
      },
    },

    evidenceMap: [
      { section: "Abstract", quote: "We investigated whether baseline IL-6 independently predicts progression-free survival after adjusting for established clinical confounders.", pageRef: "p. 1", confidence: "high" },
      { section: "Methods", quote: "Cox proportional hazards models were used to estimate hazard ratios adjusted for age, sex, ECOG performance status, and disease stage.", pageRef: "p. 3", confidence: "high" },
      { section: "Table 1", quote: "Baseline characteristics stratified by IL-6 tertile.", pageRef: "p. 4", confidence: "medium" },
      { section: "Results", quote: "Higher baseline IL-6 was independently associated with shorter PFS (HR 1.38, 95% CI 1.08–1.76, p = 0.009).", pageRef: "p. 7", confidence: "high" },
    ],
    limitations: [
      "Retrospective design — potential selection bias",
      "Two-center study — may limit generalizability",
      "IL-6 measured at a single baseline timepoint",
      "PD-L1 TPS missing in 18% of patients",
    ],

    relatedConcepts: [
      { name: "Confounding by indication", whyItMatters: "Treatment assignment or biomarker testing may correlate with disease severity, distorting the IL-6/PFS association.", howToCheck: "Compare unadjusted vs. adjusted hazard ratios — a large shift suggests confounding." },
      { name: "Competing risks", whyItMatters: "Death from causes unrelated to disease progression could distort a naive PFS estimate.", howToCheck: "Confirm pfs_event distinguishes progression/death from other censoring reasons." },
      { name: "Effect modification", whyItMatters: "The IL-6 effect on survival may differ by disease stage or treatment exposure.", howToCheck: "Test an IL-6 × stage interaction term." },
    ],
    suggestedPapers: [
      {
        title: "Inflammatory Markers and Overall Survival in Advanced Lung Cancer: A Meta-Analysis",
        whyItHelps: "Provides pooled external benchmark hazard ratios for IL-6 and survival across 24 studies.",
        howItConnects: "Your adjusted HR (1.42 from analysis_003) can be compared against this paper's pooled estimate (1.52) for external validity.",
      },
    ],

    versions: [
      { label: "v1", question: "Does IL-6 predict survival?" },
      { label: "v2", question: "Does baseline serum IL-6 predict progression-free survival?" },
      { label: "v3 (current)", question: "Are baseline serum IL-6 levels independently associated with progression-free survival after adjusting for age, sex, and disease stage?" },
    ],

    agentTrace: [
      { agent: "Planner Agent", action: "Parsed research question into dependent/independent variables and covariates", timestamp: "2026-05-14T09:58:00Z" },
      { agent: "Stats Agent", action: "Recommended Cox regression and Kaplan-Meier as primary/alternative analyses", timestamp: "2026-05-15T09:58:00Z" },
      { agent: "Critic Agent", action: "Flagged missing ECOG and PD-L1 TPS as feasibility caveats", timestamp: "2026-05-15T10:00:00Z" },
    ],

    linkedAnalysisIds: ["analysis_001", "analysis_002", "analysis_003"],
  },
  {
    id: "rq_002",
    projectId: "project_001",
    paperId: "paper_001",
    question: "Does CRP add independent prognostic value beyond IL-6 in a multivariate Cox model?",
    createdAt: "2026-06-10",
    status: "feasible_with_caveats",
    questionType: "Survival",

    population: "All 312 patients in the NSCLC cohort receiving first-line pembrolizumab monotherapy",
    dependentVariable: "pfs_months (time-to-event), censored by pfs_event",
    independentVariable: "crp_baseline (continuous)",
    covariates: ["il6_baseline", "age", "sex", "stage_iv"],
    hypothesis: "CRP remains a significant predictor of PFS after adjusting for IL-6 and clinical covariates.",
    endpoint: "Progression-free survival (PFS) per RECIST 1.1",
    statisticalFamily: "Time-to-event / survival analysis",
    primaryAnalysis: "Multivariable Cox model adding CRP to the existing IL-6-adjusted model, compared via likelihood ratio test",
    alternativeAnalyses: [
      "Spearman correlation between IL-6 and CRP to check collinearity before fitting the combined model",
      "Stratified analysis by CRP tertile alongside the existing IL-6 tertile grouping",
    ],
    assumptionsToCheck: [
      "Collinearity between IL-6 and CRP (r = 0.61 from prior correlation analysis — moderate, monitor VIF)",
      "Proportional hazards assumption for the expanded model",
      "Adequate sample size for an additional covariate (events-per-variable ratio)",
    ],

    nullHypothesis: "CRP has no independent association with progression-free survival once IL-6 and clinical covariates are accounted for.",
    alternativeHypothesis: "CRP is independently associated with progression-free survival even after adjusting for IL-6, age, sex, and disease stage.",
    expectedDirection: "Higher CRP → shorter PFS, but effect may be attenuated by IL-6's overlapping signal",

    feasibility: {
      paperSupport: "moderate",
      datasetSupport: "strong",
      statisticalViability: "moderate",
      clinicalRelevance: "moderate",
      riskOfBias: "moderate",
      overall: "Feasible with caveats — the paper reports an IL-6/CRP correlation but doesn't run this exact combined model. Moderate collinearity (r=0.61) may inflate variance estimates; check VIF before interpreting the combined model.",
      breakdown: {
        outcome: "matched",
        exposure: "matched",
        covariatesMatched: "4/4 matched",
        sampleSize: "acceptable",
        missingness: "ok",
        designFit: "Observational retrospective cohort",
        recommendedAnalysisNote: "Likelihood ratio test comparing nested Cox models; check VIF for IL-6/CRP collinearity",
      },
    },

    evidenceMap: [
      { section: "Results — secondary analyses", quote: "Spearman correlation between IL-6 and CRP: r = 0.61, p < 0.001.", pageRef: "p. 9", confidence: "high" },
    ],
    limitations: ["Paper does not test a combined IL-6 + CRP model directly — this extends beyond what was reported"],

    relatedConcepts: [
      { name: "Multicollinearity", whyItMatters: "IL-6 and CRP are correlated (r=0.61) — including both may make individual coefficients unstable.", howToCheck: "Compute variance inflation factors (VIF) for both biomarkers in the combined model." },
    ],
    suggestedPapers: [],

    agentTrace: [
      { agent: "Planner Agent", action: "Parsed research question, identified CRP as new exposure with IL-6 added as covariate", timestamp: "2026-06-10T08:30:00Z" },
      { agent: "Critic Agent", action: "Flagged IL-6/CRP collinearity as a feasibility caveat", timestamp: "2026-06-10T08:32:00Z" },
    ],

    linkedAnalysisIds: ["analysis_004"],
  },
  {
    id: "rq_101",
    projectId: "project_002",
    paperId: "paper_101",
    question: "Is depressive symptom severity (PHQ-9 score) associated with poor glycemic control (HbA1c ≥ 8%), independent of medication adherence?",
    createdAt: "2026-06-21",
    status: "feasible",
    questionType: "Association",

    population: "150 adults with type 2 diabetes from a single outpatient endocrinology clinic",
    dependentVariable: "hba1c (continuous) / poor glycemic control (HbA1c ≥8%, binary)",
    independentVariable: "phq9_score (continuous)",
    covariates: ["medication_adherence_pct", "age", "diabetes_duration_years"],
    hypothesis: "Higher PHQ-9 score is independently associated with poor glycemic control after adjusting for medication adherence, age, and diabetes duration.",
    endpoint: "Poor glycemic control (HbA1c ≥8%)",
    statisticalFamily: "Logistic regression",
    primaryAnalysis: "Logistic regression — PHQ-9 predicting poor glycemic control, adjusted for medication adherence, age, and diabetes duration",
    alternativeAnalyses: ["Linear regression with HbA1c as a continuous outcome"],
    assumptionsToCheck: ["No excessive multicollinearity between PHQ-9 and adherence", "Adequate events-per-variable ratio"],

    nullHypothesis: "There is no association between PHQ-9 score and poor glycemic control after adjusting for medication adherence, age, and diabetes duration.",
    alternativeHypothesis: "Higher PHQ-9 score is associated with greater odds of poor glycemic control after adjustment.",
    expectedDirection: "Higher PHQ-9 → higher odds of poor glycemic control (OR > 1)",

    feasibility: {
      paperSupport: "strong",
      datasetSupport: "strong",
      statisticalViability: "strong",
      clinicalRelevance: "moderate",
      riskOfBias: "moderate",
      overall: "Feasible — ready for analysis. Direct replication of the paper's core finding; all variables are matched in your dataset.",
      breakdown: {
        outcome: "matched",
        exposure: "matched",
        covariatesMatched: "3/3 matched",
        sampleSize: "acceptable",
        missingness: "ok",
        designFit: "Cross-sectional observational study — supports association, not causal claims",
        recommendedAnalysisNote: "Adjusted logistic regression, consistent with the paper's primary analysis",
      },
    },

    evidenceMap: [
      { section: "Abstract", quote: "Higher PHQ-9 scores were associated with greater odds of poor glycemic control (OR 1.09 per point, 95% CI 1.02–1.17, p=0.01).", pageRef: "p. 1", confidence: "high" },
    ],
    limitations: [
      "Cross-sectional design — cannot establish temporal or causal direction",
      "Single-clinic sample — limited generalizability",
    ],

    linkedAnalysisIds: ["analysis_101"],
  },
]

export const recommendedQuestions: RecommendedQuestion[] = [
  /* ---------------- Paper-Focused: From This Paper ---------------- */
  {
    id: "rec_001",
    projectId: "project_001",
    paperId: "paper_001",
    group: "paper_focused_direct",
    category: "Direct Replication",
    question: "Can we reproduce the paper's primary analysis — IL-6 → PFS, adjusted Cox regression?",
    idea: "The paper's primary finding can be directly reproduced on your cohort using the same adjusted Cox model. This is the natural first step before extending or challenging the finding — it validates that your dataset and pipeline reproduce the paper's core result.",
    whyItMatters: "Validates that your dataset and pipeline reproduce the paper's core finding before extending it further.",
    paperEvidence: "Methods, p. 3–5: adjusted Cox model described; Table 2: reported HR 1.38.",
    datasetFeasibility: [
      { variable: "il6_baseline", status: "matched" },
      { variable: "pfs_months", status: "matched" },
      { variable: "pfs_event", status: "matched" },
      { variable: "age", status: "matched" },
      { variable: "sex", status: "matched" },
      { variable: "stage_iv", status: "matched" },
    ],
    confidence: { paperSupport: "strong", datasetFeasibility: "strong", statisticalViability: "strong", novelty: "weak" },
    recommendedAnalysis: "Adjusted Cox proportional hazards regression (IL-6 + age + sex + stage)",
    recommendedTests: [
      "Baseline characteristics table by IL-6 tertile",
      "Kaplan-Meier curve stratified by IL-6 tertile",
      "Log-rank test across tertiles",
      "Adjusted Cox proportional hazards model (IL-6 + age + sex + stage_iv)",
    ],
    concreteApproach: [
      "Confirm il6_baseline, pfs_months, and pfs_event coding matches the paper's definitions.",
      "Generate a baseline characteristics table stratified by IL-6 tertile.",
      "Run Kaplan-Meier curves with a log-rank test across tertiles.",
      "Fit the adjusted Cox model (age, sex, stage_iv) and extract the hazard ratio.",
      "Compare your hazard ratio against the paper's reported HR 1.38 (95% CI 1.08–1.76).",
    ],
    limitations: ["ECOG and PD-L1 TPS used in the paper's full model are missing from your dataset"],
    status: "Ready for analysis",
    feasibility: {
      paperSupport: "strong", datasetSupport: "strong", statisticalViability: "strong", clinicalRelevance: "strong", riskOfBias: "moderate",
      overall: "Feasible — ready for analysis. Direct replication of the paper's core finding using variables that are fully matched in your dataset.",
      breakdown: {
        outcome: "matched", exposure: "matched", covariatesMatched: "3/5 (ECOG, PD-L1 TPS missing)",
        sampleSize: "acceptable", missingness: "warning",
        designFit: "Observational retrospective cohort — supports association, not causal treatment-effect claims",
        recommendedAnalysisNote: "Adjusted Cox regression; run a sensitivity analysis noting ECOG/PD-L1 are unavailable",
      },
    },
    evidenceMap: [
      { section: "Methods", quote: "Cox proportional hazards models were used to estimate hazard ratios adjusted for age, sex, ECOG performance status, and disease stage.", pageRef: "p. 3", confidence: "high" },
      { section: "Results", quote: "Higher baseline IL-6 was independently associated with shorter PFS (HR 1.38, 95% CI 1.08–1.76, p = 0.009).", pageRef: "p. 7", confidence: "high" },
    ],
    assumptionsToCheck: ["Proportional hazards assumption (Schoenfeld residuals)", "Sufficient events-per-variable ratio for stable Cox estimates"],
  },
  {
    id: "rec_002",
    projectId: "project_001",
    paperId: "paper_001",
    group: "paper_focused_direct",
    category: "Subgroup",
    question: "Is the IL-6 → PFS association different among stage IV vs. stage IIIB patients?",
    idea: "If the IL-6 effect differs by disease stage, that would refine which patients benefit most from biomarker-guided monitoring — a question the paper raises implicitly (it adjusts for stage) but never directly tests as an interaction.",
    whyItMatters: "Tests whether the biomarker's prognostic value is consistent across disease severity.",
    paperEvidence: "Paper did not stratify the primary analysis by stage subgroup.",
    datasetFeasibility: [
      { variable: "il6_baseline", status: "matched" },
      { variable: "stage_iv", status: "matched" },
      { variable: "pfs_months", status: "matched" },
      { variable: "pfs_event", status: "matched" },
    ],
    confidence: { paperSupport: "moderate", datasetFeasibility: "strong", statisticalViability: "moderate", novelty: "moderate" },
    recommendedAnalysis: "Cox regression with an IL-6 × stage interaction term",
    recommendedTests: ["Cox regression with IL-6 × stage interaction term", "Stratified Kaplan-Meier curves by stage subgroup"],
    concreteApproach: [
      "Fit the base adjusted Cox model without an interaction term.",
      "Add an IL-6 × stage_iv interaction term and refit.",
      "Test interaction significance via likelihood ratio test.",
      "If significant, report stage-specific hazard ratios separately.",
    ],
    limitations: ["Stage IIIB subgroup (n=90) may be underpowered to detect a smaller interaction effect"],
    status: "Feasible with caveats",
    feasibility: {
      paperSupport: "moderate", datasetSupport: "strong", statisticalViability: "moderate", clinicalRelevance: "moderate", riskOfBias: "moderate",
      overall: "Feasible with caveats — dataset supports the interaction test, but the smaller stage IIIB subgroup limits power to detect a modest interaction effect.",
      breakdown: {
        outcome: "matched", exposure: "matched", covariatesMatched: "2/2 matched",
        sampleSize: "small", missingness: "ok",
        designFit: "Observational retrospective cohort, subgroup analysis",
        recommendedAnalysisNote: "Interaction test via likelihood ratio test; report with caution given subgroup size",
      },
    },
    evidenceMap: [
      { section: "Methods", quote: "Cox proportional hazards models were used to estimate hazard ratios adjusted for age, sex, ECOG performance status, and disease stage.", pageRef: "p. 3", confidence: "medium" },
    ],
    assumptionsToCheck: ["Adequate events-per-variable ratio within each stage subgroup", "Proportional hazards within each subgroup"],
  },
  {
    id: "rec_003",
    projectId: "project_001",
    paperId: "paper_001",
    group: "paper_focused_direct",
    category: "Alternative Outcome",
    question: "Does baseline IL-6 predict overall survival instead of progression-free survival?",
    idea: "OS is a harder, less ambiguous endpoint than PFS — triangulating the biomarker's prognostic value against a secondary endpoint the paper itself reports strengthens confidence in the finding.",
    whyItMatters: "OS is a harder, less ambiguous endpoint than PFS — useful for triangulating the biomarker's prognostic value.",
    paperEvidence: "Paper reports OS as a secondary endpoint (Table 2).",
    datasetFeasibility: [
      { variable: "il6_baseline", status: "matched" },
      { variable: "os_months", status: "matched" },
      { variable: "os_event", status: "matched" },
    ],
    confidence: { paperSupport: "strong", datasetFeasibility: "strong", statisticalViability: "moderate", novelty: "weak" },
    recommendedAnalysis: "Adjusted Cox regression with OS as the outcome",
    recommendedTests: ["Kaplan-Meier curve for OS by IL-6 tertile", "Log-rank test", "Adjusted Cox regression with OS as the outcome"],
    concreteApproach: [
      "Map os_months/os_event as the outcome instead of pfs_months/pfs_event.",
      "Refit the same adjusted Cox model structure used for PFS.",
      "Compare the OS hazard ratio against the paper's reported secondary-endpoint estimate.",
    ],
    limitations: ["Fewer OS events (34%) than PFS events (62%) — lower statistical power"],
    status: "Ready for analysis",
    feasibility: {
      paperSupport: "strong", datasetSupport: "strong", statisticalViability: "moderate", clinicalRelevance: "strong", riskOfBias: "moderate",
      overall: "Feasible — ready for analysis, though expect wider confidence intervals than the PFS analysis given fewer OS events.",
      breakdown: {
        outcome: "matched", exposure: "matched", covariatesMatched: "3/5 (ECOG, PD-L1 TPS missing)",
        sampleSize: "acceptable", missingness: "ok",
        designFit: "Observational retrospective cohort",
        recommendedAnalysisNote: "Same adjusted Cox structure as the PFS model, substituting OS as the outcome",
      },
    },
    evidenceMap: [
      { section: "Table 2", quote: "Secondary endpoint: overall survival (OS), reported alongside PFS.", pageRef: "p. 8", confidence: "medium" },
    ],
    assumptionsToCheck: ["Proportional hazards assumption for the OS model", "Sufficient OS events-per-variable ratio"],
  },
  {
    id: "rec_004",
    projectId: "project_001",
    paperId: "paper_001",
    group: "paper_focused_direct",
    category: "Covariate/Confounder",
    question: "Does the IL-6 → PFS association remain significant after adjusting for tumor histology?",
    idea: "Histology is a known NSCLC prognostic factor the paper's adjustment set omits — adding it is a natural robustness check before trusting the IL-6 effect as truly independent.",
    whyItMatters: "Histology is a known prognostic factor in NSCLC that isn't in the paper's adjustment set.",
    paperEvidence: "Paper does not adjust for histology.",
    datasetFeasibility: [
      { variable: "histology", status: "matched" },
      { variable: "il6_baseline", status: "matched" },
    ],
    confidence: { paperSupport: "weak", datasetFeasibility: "strong", statisticalViability: "moderate", novelty: "moderate" },
    recommendedAnalysis: "Cox regression adding histology as an additional covariate",
    recommendedTests: ["Cox regression adding histology as an additional covariate", "Likelihood ratio test vs. base model"],
    concreteApproach: [
      "Check histology category distribution and collapse sparse categories if needed.",
      "Add histology to the existing adjusted Cox model.",
      "Compare the IL-6 coefficient before/after to assess sensitivity to histology adjustment.",
    ],
    limitations: ["\"Other\" histology category has only 9 patients — consider collapsing categories"],
    status: "Feasible with caveats",
    feasibility: {
      paperSupport: "weak", datasetSupport: "strong", statisticalViability: "moderate", clinicalRelevance: "moderate", riskOfBias: "low",
      overall: "Feasible with caveats — histology data is available, but the smallest category needs collapsing before stable model fitting.",
      breakdown: {
        outcome: "matched", exposure: "matched", covariatesMatched: "1/1 new covariate matched",
        sampleSize: "acceptable", missingness: "ok",
        designFit: "Observational retrospective cohort",
        recommendedAnalysisNote: "Collapse sparse histology categories before adding to the model",
      },
    },
    evidenceMap: [],
    assumptionsToCheck: ["Adequate sample size per histology category after collapsing"],
  },
  {
    id: "rec_005",
    projectId: "project_001",
    paperId: "paper_001",
    group: "paper_focused_direct",
    category: "Methodological",
    question: "Would propensity score weighting change the IL-6 → PFS conclusion?",
    idea: "Standard covariate adjustment may not fully address confounding by indication — propensity-based reweighting is a methodological robustness check the paper doesn't attempt.",
    whyItMatters: "Tests robustness of the association to confounding-by-indication beyond standard covariate adjustment.",
    paperEvidence: "Paper uses standard covariate adjustment, not propensity scores.",
    datasetFeasibility: [
      { variable: "il6_baseline", status: "partial" },
      { variable: "age", status: "matched" },
      { variable: "sex", status: "matched" },
      { variable: "stage_iv", status: "matched" },
    ],
    confidence: { paperSupport: "weak", datasetFeasibility: "moderate", statisticalViability: "moderate", novelty: "strong" },
    recommendedAnalysis: "Propensity score weighting using IL-6 tertile as the exposure of interest, then re-estimate the Cox model",
    recommendedTests: ["Propensity score model for IL-6 tertile membership", "Inverse-probability-weighted Cox model", "Balance diagnostics (standardized mean differences)"],
    concreteApproach: [
      "Fit a propensity model predicting IL-6 tertile from baseline covariates.",
      "Generate inverse-probability weights and check covariate balance.",
      "Re-estimate the Cox model under weighting and compare to the unweighted result.",
    ],
    limitations: ["Only one treatment arm in the dataset — typical PSM use case doesn't apply directly; IL-6 tertile would need to stand in as the 'exposure'"],
    status: "Feasible with caveats",
    feasibility: {
      paperSupport: "weak", datasetSupport: "moderate", statisticalViability: "moderate", clinicalRelevance: "moderate", riskOfBias: "moderate",
      overall: "Feasible with caveats — methodologically interesting but a nonstandard use of propensity weighting since there's no real treatment-assignment exposure in this single-arm cohort.",
      breakdown: {
        outcome: "matched", exposure: "partial", covariatesMatched: "3/3 matched",
        sampleSize: "acceptable", missingness: "ok",
        designFit: "Observational retrospective cohort, single treatment arm",
        recommendedAnalysisNote: "Treat IL-6 tertile as a pseudo-exposure; report as a sensitivity analysis, not the primary result",
      },
    },
    evidenceMap: [],
    assumptionsToCheck: ["Adequate covariate balance after weighting", "No extreme weights distorting variance estimates"],
  },
  {
    id: "rec_006",
    projectId: "project_001",
    paperId: "paper_001",
    group: "paper_focused_direct",
    category: "Conceptual",
    question: "Does biomarker status (IL-6 tertile) modify the relationship between PD-L1 expression and PFS?",
    idea: "The paper's own limitations section flags this exact gap — it could identify a patient subgroup where PD-L1 is a stronger or weaker predictor, but the data needed is partially missing.",
    whyItMatters: "Could identify a patient subgroup where PD-L1 is a stronger or weaker predictor.",
    paperEvidence: "Not addressed in the paper — explicitly noted as a research gap.",
    datasetFeasibility: [
      { variable: "il6_baseline", status: "matched" },
      { variable: "pdl1_tps", status: "partial" },
      { variable: "pfs_months", status: "matched" },
    ],
    confidence: { paperSupport: "weak", datasetFeasibility: "moderate", statisticalViability: "weak", novelty: "strong" },
    recommendedAnalysis: "Cox regression with a PD-L1 × IL-6 tertile interaction term",
    recommendedTests: ["Cox regression with PD-L1 × IL-6 tertile interaction term", "Complete-case sensitivity analysis"],
    concreteApproach: [
      "Quantify PD-L1 TPS missingness pattern (missing at random vs. not).",
      "Fit the interaction model on complete cases as a first pass.",
      "Consider multiple imputation for PD-L1 TPS if missingness is plausibly random.",
    ],
    limitations: ["PD-L1 TPS missing in 18% of patients — interaction models are sensitive to missingness"],
    status: "Blocked",
    gapSource: "Paper's limitations note it did not evaluate biomarker-defined subgroups",
    feasibility: {
      paperSupport: "weak", datasetSupport: "moderate", statisticalViability: "weak", clinicalRelevance: "moderate", riskOfBias: "moderate",
      overall: "Blocked pending missingness handling — PD-L1 TPS missingness (18%) is high enough to require imputation before the interaction term can be trusted.",
      breakdown: {
        outcome: "matched", exposure: "matched", covariatesMatched: "1/1 partial (PD-L1 TPS)",
        sampleSize: "small", missingness: "critical",
        designFit: "Observational retrospective cohort",
        recommendedAnalysisNote: "Resolve PD-L1 TPS missingness (imputation or complete-case framing) before fitting the interaction model",
      },
    },
    evidenceMap: [
      { section: "Limitations", quote: "This study did not evaluate biomarker-defined subgroups, such as PD-L1 expression strata, due to incomplete testing in a subset of patients.", pageRef: "p. 13", confidence: "high" },
    ],
    assumptionsToCheck: ["PD-L1 TPS missingness mechanism (MCAR/MAR) before choosing an imputation strategy"],
  },

  /* ---------------- Paper-Focused: From This Paper's References ---------------- */
  {
    id: "rec_101",
    projectId: "project_001",
    paperId: "paper_001",
    group: "paper_focused_reference",
    category: "Subgroup",
    question: "Does sex modify the association between baseline IL-6 and progression-free survival?",
    idea: "The paper's own discussion flags a cited finding on sex-based IL-6 signaling differences without testing for it directly — your dataset already has the variables needed to check this.",
    whyItMatters: "If IL-6's prognostic value differs by sex, that has direct implications for how the biomarker should be interpreted in clinical practice.",
    paperEvidence: "Discussion, p. 11: cites Tanaka et al. when discussing IL-6's role in immune signaling.",
    datasetFeasibility: [
      { variable: "il6_baseline", status: "matched" },
      { variable: "sex", status: "matched" },
      { variable: "pfs_months", status: "matched" },
      { variable: "pfs_event", status: "matched" },
    ],
    confidence: { paperSupport: "moderate", datasetFeasibility: "strong", statisticalViability: "moderate", novelty: "moderate" },
    recommendedAnalysis: "Cox regression with an IL-6 × sex interaction term",
    recommendedTests: ["Cox regression with IL-6 × sex interaction term", "Stratified Kaplan-Meier curves by sex"],
    concreteApproach: [
      "Fit the base adjusted Cox model without an interaction term.",
      "Add an IL-6 × sex interaction term and refit.",
      "Test interaction significance via likelihood ratio test.",
      "If significant, report sex-specific hazard ratios separately.",
    ],
    limitations: ["Sex subgroups are unevenly sized in this cohort — could be underpowered for a true interaction effect"],
    status: "Feasible with caveats",
    referenceTitle: "Sex-Based Differences in IL-6 Signaling and Immunotherapy Outcomes",
    referenceAuthors: "Tanaka et al., 2022",
    howReferenceConnects: "The selected paper cites Tanaka et al. when discussing IL-6's role in immune signaling (Discussion, p. 11), noting that sex-based differences in inflammatory cytokine response have been reported elsewhere but weren't examined in this cohort.",
    feasibility: {
      paperSupport: "moderate", datasetSupport: "strong", statisticalViability: "moderate", clinicalRelevance: "moderate", riskOfBias: "moderate",
      overall: "Feasible with caveats — dataset supports the interaction test, but uneven sex-subgroup sizes limit power to detect a modest effect.",
      breakdown: {
        outcome: "matched", exposure: "matched", covariatesMatched: "1/1 matched",
        sampleSize: "small", missingness: "ok",
        designFit: "Observational retrospective cohort, subgroup analysis",
        recommendedAnalysisNote: "Interaction test via likelihood ratio test; report with caution given subgroup size",
      },
    },
    evidenceMap: [
      { section: "Discussion", quote: "Sex-based differences in IL-6 signaling have been reported elsewhere (Tanaka et al.) but were not examined in this cohort.", pageRef: "p. 11", confidence: "medium" },
    ],
    assumptionsToCheck: ["Adequate events-per-variable ratio within each sex subgroup"],
  },
  {
    id: "rec_102",
    projectId: "project_001",
    paperId: "paper_001",
    group: "paper_focused_reference",
    category: "Methodological",
    question: "Does adding CRP improve calibration of the IL-6 survival model, as suggested by a meta-analysis the paper cites for inflammatory marker panels?",
    idea: "If CRP adds calibration value beyond IL-6 alone, that would extend the paper's single-biomarker approach toward the panel-based approach the cited meta-analysis recommends.",
    whyItMatters: "Combined inflammatory marker panels may outperform single biomarkers for clinical risk stratification.",
    paperEvidence: "Discussion, p. 12: cites a meta-analysis when noting combined inflammatory marker panels may outperform single biomarkers.",
    datasetFeasibility: [
      { variable: "il6_baseline", status: "matched" },
      { variable: "crp_baseline", status: "matched" },
      { variable: "pfs_months", status: "matched" },
      { variable: "pfs_event", status: "matched" },
    ],
    confidence: { paperSupport: "moderate", datasetFeasibility: "strong", statisticalViability: "moderate", novelty: "moderate" },
    recommendedAnalysis: "Combined IL-6 + CRP Cox model compared against an IL-6-only model",
    recommendedTests: ["Combined IL-6 + CRP Cox model", "Likelihood ratio test vs. IL-6-only model", "Calibration plot (predicted vs. observed survival)"],
    concreteApproach: [
      "Fit the IL-6-only Cox model as the baseline.",
      "Add CRP and refit the combined model.",
      "Compare via likelihood ratio test and calibration plot.",
      "Check VIF given the known IL-6/CRP correlation (r=0.61).",
    ],
    limitations: ["IL-6 and CRP are correlated (r=0.61) — interpret combined coefficients cautiously"],
    status: "Feasible with caveats",
    referenceTitle: "Inflammatory Markers and Overall Survival in Advanced Lung Cancer: A Meta-Analysis",
    referenceAuthors: "Patel et al., 2023",
    howReferenceConnects: "The selected paper cites this meta-analysis (Discussion, p. 12) when noting that combined inflammatory marker panels may outperform single biomarkers — a comparison it doesn't run itself.",
    feasibility: {
      paperSupport: "moderate", datasetSupport: "strong", statisticalViability: "moderate", clinicalRelevance: "moderate", riskOfBias: "moderate",
      overall: "Feasible with caveats — both biomarkers are fully matched, but moderate collinearity (r=0.61) means the combined model's individual coefficients should be interpreted cautiously.",
      breakdown: {
        outcome: "matched", exposure: "matched", covariatesMatched: "4/4 matched",
        sampleSize: "acceptable", missingness: "ok",
        designFit: "Observational retrospective cohort",
        recommendedAnalysisNote: "Likelihood ratio test comparing nested Cox models; check VIF for IL-6/CRP collinearity",
      },
    },
    evidenceMap: [
      { section: "Discussion", quote: "Combined inflammatory marker panels may outperform single-biomarker approaches (cited meta-analysis).", pageRef: "p. 12", confidence: "medium" },
      { section: "Results — secondary analyses", quote: "Spearman correlation between IL-6 and CRP: r = 0.61, p < 0.001.", pageRef: "p. 9", confidence: "high" },
    ],
    assumptionsToCheck: ["Collinearity between IL-6 and CRP (monitor VIF)", "Proportional hazards assumption for the expanded model"],
  },

  /* ---------------- Cross-Concept ---------------- */
  {
    id: "rec_201",
    projectId: "project_001",
    paperId: "paper_001",
    group: "cross_concept",
    category: "Methodological",
    question: "Could competing risks change the interpretation of progression-free survival differences in this cohort?",
    idea: "The paper uses progression-free survival as its endpoint, but if death from causes unrelated to disease progression is common in this population, the standard PFS interpretation may be incomplete.",
    whyItMatters: "Competing risks can bias naive survival estimates when non-target-event deaths are non-negligible.",
    paperEvidence: "Paper does not address competing risks; pfs_event is a combined progression-or-death indicator.",
    datasetFeasibility: [
      { variable: "pfs_event", status: "partial" },
      { variable: "cause_specific_event", status: "missing" },
    ],
    confidence: { paperSupport: "weak", datasetFeasibility: "weak", statisticalViability: "moderate", novelty: "strong" },
    recommendedAnalysis: "Cumulative incidence function by cause, with a Fine-Gray subdistribution hazard model if cause-specific data becomes available",
    recommendedTests: ["Cumulative incidence function (CIF) by cause", "Fine-Gray subdistribution hazard model"],
    concreteApproach: [
      "Check whether the source dataset distinguishes cause of death/progression anywhere upstream of pfs_event.",
      "If a cause-specific indicator can be derived, compute cause-specific cumulative incidence functions.",
      "Fit a Fine-Gray model and compare its subdistribution hazard ratio against the standard Cox estimate.",
    ],
    limitations: ["Blocked until a cause-specific death/event variable is added to the dataset"],
    status: "Blocked",
    concept: "Competing risks",
    conceptField: "Survival analysis",
    whyItConnects: "The paper uses overall progression-free survival as an endpoint, but if non-disease deaths are common in this cohort, standard survival interpretation may be incomplete.",
    feasibilityNote: "Requires a cause-specific event indicator distinguishing disease progression/death from other censoring reasons. Current dataset: not detected (pfs_event is a combined progression-or-death indicator, not cause-specific).",
    feasibility: {
      paperSupport: "weak", datasetSupport: "weak", statisticalViability: "moderate", clinicalRelevance: "moderate", riskOfBias: "moderate",
      overall: "Interesting but currently blocked — the dataset doesn't distinguish cause of death/progression, which a competing-risks analysis requires.",
      breakdown: {
        outcome: "partial", exposure: "missing", covariatesMatched: "0/1 (cause-specific indicator missing)",
        sampleSize: "acceptable", missingness: "critical",
        designFit: "Observational retrospective cohort",
        recommendedAnalysisNote: "Revisit once a cause-specific event variable exists; not currently runnable",
      },
    },
    evidenceMap: [],
    assumptionsToCheck: ["Availability of a cause-specific event indicator before any competing-risks model can be fit"],
  },
  {
    id: "rec_202",
    projectId: "project_001",
    paperId: "paper_001",
    group: "cross_concept",
    category: "Methodological",
    question: "Could confounding by indication explain part of the observed IL-6 → PFS association?",
    idea: "If biomarker testing or treatment decisions were subtly influenced by perceived disease severity, the IL-6/PFS association could be partly an artifact of confounding by indication rather than a direct biological effect.",
    whyItMatters: "Distinguishing a true prognostic signal from confounding by indication is central to whether IL-6 should inform clinical decisions.",
    paperEvidence: "Paper adjusts for standard covariates but does not address confounding by indication directly.",
    datasetFeasibility: [
      { variable: "il6_baseline", status: "matched" },
      { variable: "stage_iv", status: "matched" },
      { variable: "ecog_status", status: "missing" },
    ],
    confidence: { paperSupport: "moderate", datasetFeasibility: "moderate", statisticalViability: "moderate", novelty: "moderate" },
    recommendedAnalysis: "Compare unadjusted vs. adjusted hazard ratios as a confounding diagnostic",
    recommendedTests: ["Compare unadjusted vs. adjusted hazard ratios", "Propensity score sensitivity analysis"],
    concreteApproach: [
      "Fit an unadjusted Cox model with IL-6 alone.",
      "Fit the fully adjusted model and compare the magnitude of the hazard ratio shift.",
      "If the shift is large, run a propensity-based sensitivity analysis using available covariates as a check.",
    ],
    limitations: ["Only one treatment arm in the dataset limits classic propensity-score approaches", "ECOG status (a key indication-related covariate) is missing"],
    status: "Feasible with caveats",
    concept: "Confounding by indication",
    conceptField: "Epidemiology / causal inference",
    whyItConnects: "Treatment assignment or biomarker testing decisions may correlate with underlying disease severity, which could distort the IL-6/PFS association beyond what standard covariate adjustment captures.",
    feasibility: {
      paperSupport: "moderate", datasetSupport: "moderate", statisticalViability: "moderate", clinicalRelevance: "moderate", riskOfBias: "moderate",
      overall: "Feasible with caveats — a useful diagnostic, but the missing ECOG variable (a key indication-related covariate) limits how conclusively confounding can be ruled out.",
      breakdown: {
        outcome: "matched", exposure: "matched", covariatesMatched: "1/2 (ECOG missing)",
        sampleSize: "acceptable", missingness: "warning",
        designFit: "Observational retrospective cohort, single treatment arm",
        recommendedAnalysisNote: "Run as a sensitivity analysis alongside the primary adjusted model, not as a standalone conclusion",
      },
    },
    evidenceMap: [],
    assumptionsToCheck: ["Direction and plausibility of any residual confounding given missing ECOG"],
  },
  {
    id: "rec_203",
    projectId: "project_001",
    paperId: "paper_001",
    group: "cross_concept",
    category: "Methodological",
    question: "How well does the IL-6-based model discriminate and calibrate as a prediction tool, beyond just hypothesis-testing hazard ratios?",
    idea: "The paper frames IL-6 purely as a hypothesis-testing predictor (hazard ratio, p-value), but if IL-6 is to inform clinical risk stratification, its predictive discrimination and calibration matter just as much as statistical significance.",
    whyItMatters: "A statistically significant hazard ratio doesn't guarantee a clinically useful predictive model — discrimination and calibration are the relevant metrics for that.",
    paperEvidence: "Paper reports only hazard ratios and p-values, no discrimination/calibration metrics.",
    datasetFeasibility: [
      { variable: "il6_baseline", status: "matched" },
      { variable: "pfs_months", status: "matched" },
      { variable: "pfs_event", status: "matched" },
    ],
    confidence: { paperSupport: "weak", datasetFeasibility: "strong", statisticalViability: "strong", novelty: "strong" },
    recommendedAnalysis: "Harrell's C-index and a calibration plot at fixed time landmarks for the existing Cox model",
    recommendedTests: ["Harrell's C-index for the Cox model", "Time-dependent AUC", "Calibration plot at 6/12-month landmarks"],
    concreteApproach: [
      "Fit the existing adjusted Cox model.",
      "Compute Harrell's C-index and time-dependent AUC at 6 and 12 months.",
      "Generate a calibration plot comparing predicted vs. observed survival at those landmarks.",
    ],
    limitations: ["Internal validation only — no held-out cohort to test generalizability"],
    status: "Feasible with caveats",
    concept: "Discrimination & calibration (C-index, calibration plot)",
    conceptField: "Predictive modeling / clinical risk prediction",
    whyItConnects: "The paper frames IL-6 purely as a hypothesis-testing predictor, but predictive discrimination and calibration are the standard the model would need to meet to be used for actual risk stratification.",
    feasibility: {
      paperSupport: "weak", datasetSupport: "strong", statisticalViability: "strong", clinicalRelevance: "moderate", riskOfBias: "low",
      overall: "Feasible with caveats — all variables needed are matched and the statistical approach is well-established, but results would only be internally validated, not externally generalizable.",
      breakdown: {
        outcome: "matched", exposure: "matched", covariatesMatched: "n/a (model reuse, not new covariates)",
        sampleSize: "acceptable", missingness: "ok",
        designFit: "Observational retrospective cohort — internal validation only",
        recommendedAnalysisNote: "Report alongside the existing hazard ratio, framed as a complementary predictive-performance summary",
      },
    },
    evidenceMap: [],
    assumptionsToCheck: ["No data leakage between model fitting and C-index/calibration evaluation (use the same fitted model, not refit on subsets)"],
  },
]
