export type ExtractionStatus = "processed" | "pending" | "processing"

export type LibraryStatus = "processing" | "extracted" | "needs_review" | "mapped_to_dataset" | "used_in_analysis"

export type VariableRole = "primary_outcome" | "secondary_outcome" | "independent" | "covariate" | "identifier" | "time_variable" | "event_indicator"

export type MatchStatus = "ready" | "partial" | "missing"

export interface ExtractedVariable {
  name: string
  role: VariableRole
  type: "continuous" | "binary" | "categorical" | "ordinal" | "time_to_event"
  description: string
  unit?: string
  datasetMatch?: string // matching column in the user's dataset
}

export interface ExtractedClaim {
  finding: string
  statistic: string
  ci?: string
  pValue?: string
  model?: string
  covariates?: string[]
  sourceRef: string
}

export interface RelatedConcept {
  name: string
  whyItMatters: string
  howToCheck: string
  datasetSupport: "supported" | "partial" | "not_supported"
}

export interface ReplicationReadiness {
  endpoint: { paper: string; dataset: string; status: MatchStatus }
  exposure: { paper: string; dataset: string; status: MatchStatus }
  covariates: { name: string; status: "matched" | "possible" | "missing" }[]
  recommendedAnalyses: string[]
  warnings: string[]
}

export interface MethodCard {
  name: string
  usedInPaper: boolean
  endpoint: string
  exposure: string
  covariates: string[]
  reportedResult: string
  datasetReadiness: string
}

export interface AgentTraceEntry {
  agent: string
  action: string
  timestamp: string
}

export interface SuggestedQuestion {
  question: string
  answer: string
  sources: string
  confidence: "high" | "medium" | "low"
  relatedActions: string[]
}

export type SensitivityLevel = "public" | "restricted" | "no_ai"

export interface ExtractedPaper {
  id: string
  projectId: string
  title: string
  authors: string
  journal: string
  year: number
  doi?: string
  pageCount: number
  uploadedAt: string
  status: ExtractionStatus
  libraryStatus: LibraryStatus
  storagePath?: string
  sensitivityLevel: SensitivityLevel
  extractionCompletedAt?: string
  extractionConfidence?: "high" | "medium" | "low"
  methodsPageRef?: string

  // Extracted by Paper Agent
  abstract?: string
  researchQuestion?: string
  hypotheses?: string[]
  studyDesign?: string
  studyType?: "RCT" | "Observational cohort" | "Case-control" | "Cross-sectional" | "Meta-analysis" | "Retrospective cohort"
  population?: string
  inclusionCriteria?: string[]
  exclusionCriteria?: string[]
  sampleSize?: number
  followUpDuration?: string
  primaryEndpoint?: string
  secondaryEndpoints?: string[]
  variables?: ExtractedVariable[]
  statisticalMethods?: string[]
  primaryAnalysis?: string
  softwareUsed?: string[]
  keyFindings?: string[]
  limitations?: string[]
  conclusions?: string

  keyTakeaways?: { clinicalRelevance: string; statisticalApproach: string; reusable: string; caution: string }
  claims?: ExtractedClaim[]
  concepts?: RelatedConcept[]
  researchGaps?: string[]
  replicationReadiness?: ReplicationReadiness
  methodCard?: MethodCard
  agentTrace?: AgentTraceEntry[]
  suggestedQuestions?: SuggestedQuestion[]

  // Dataset connection assessment
  datasetConnectionSummary?: string
  replicabilityScore?: number // 0-100
  replicabilityNotes?: string[]
  variableMatchCount?: number
  variableMissingCount?: number
}

export const extractedPapers: ExtractedPaper[] = [
  {
    id: "paper_001",
    projectId: "project_001",
    sensitivityLevel: "restricted",
    title: "Serum IL-6 as a Predictive Biomarker for Immunotherapy Response in NSCLC",
    authors: "Chen, X., Matsuda, R., Kim, J., Okafor, N., Patel, S.",
    journal: "Journal of Thoracic Oncology",
    year: 2024,
    doi: "10.1016/j.jtho.2024.03.012",
    pageCount: 14,
    uploadedAt: "2026-05-13",
    status: "processed",
    libraryStatus: "used_in_analysis",
    extractionCompletedAt: "2026-05-13T11:22:00Z",
    extractionConfidence: "high",
    methodsPageRef: "p. 3–5, Methods section",

    abstract:
      "Background: Serum interleukin-6 (IL-6) has emerged as a candidate predictive biomarker for immune checkpoint inhibitor (ICI) response in non-small cell lung cancer (NSCLC). We investigated whether baseline IL-6 independently predicts progression-free survival (PFS) after adjusting for established clinical confounders. Methods: We analyzed 287 NSCLC patients receiving first-line pembrolizumab monotherapy at two academic centers between 2019 and 2022. Baseline serum IL-6 was measured within 7 days of treatment initiation. Cox proportional hazards models were used to estimate hazard ratios adjusted for age, sex, ECOG performance status, and disease stage. Results: Higher baseline IL-6 was independently associated with shorter PFS (HR 1.38, 95% CI 1.08–1.76, p=0.009). Kaplan-Meier analysis stratified by IL-6 tertile demonstrated significant separation (log-rank p=0.004). Conclusions: Baseline serum IL-6 is an independent predictor of PFS in NSCLC patients receiving first-line ICI therapy and warrants prospective validation.",

    researchQuestion:
      "Is baseline serum IL-6 an independent predictor of progression-free survival in NSCLC patients receiving first-line immune checkpoint inhibitor therapy, after adjusting for established clinical confounders?",

    hypotheses: [
      "Higher baseline serum IL-6 is independently associated with shorter progression-free survival after adjusting for age, sex, ECOG status, and disease stage.",
      "IL-6 tertile grouping demonstrates significant survival separation on Kaplan-Meier analysis.",
    ],

    studyDesign: "Retrospective observational cohort study at two academic medical centers",
    studyType: "Retrospective cohort",
    population:
      "Adult patients with histologically confirmed non-small cell lung cancer (NSCLC) receiving first-line pembrolizumab monotherapy at two academic centers, 2019–2022.",
    sampleSize: 287,
    followUpDuration: "Median follow-up 18.4 months (IQR: 10.2–26.1)",

    inclusionCriteria: [
      "Histologically confirmed NSCLC",
      "First-line pembrolizumab monotherapy",
      "PD-L1 TPS ≥50%",
      "ECOG PS 0–2",
      "Baseline serum IL-6 measured within 7 days of treatment initiation",
      "Age ≥18 years",
    ],
    exclusionCriteria: [
      "Prior systemic anticancer therapy",
      "Active autoimmune disease requiring systemic treatment",
      "Concurrent corticosteroid use (>10 mg/day prednisone equivalent)",
      "Active infection at baseline",
      "Missing baseline IL-6 measurement",
    ],

    primaryEndpoint: "Progression-free survival (PFS) per RECIST 1.1",
    secondaryEndpoints: [
      "Overall survival (OS)",
      "Objective response rate (ORR)",
      "Correlation between IL-6 and CRP levels",
    ],

    variables: [
      { name: "il6_baseline", role: "independent", type: "continuous", description: "Baseline serum IL-6 (pg/mL)", unit: "pg/mL", datasetMatch: "il6_baseline" },
      { name: "pfs_months", role: "primary_outcome", type: "time_to_event", description: "Progression-free survival in months", unit: "months", datasetMatch: "pfs_months" },
      { name: "pfs_event", role: "event_indicator", type: "binary", description: "PFS event indicator (1=progression/death, 0=censored)", datasetMatch: "pfs_event" },
      { name: "os_months", role: "secondary_outcome", type: "time_to_event", description: "Overall survival in months", unit: "months", datasetMatch: "os_months" },
      { name: "os_event", role: "event_indicator", type: "binary", description: "OS event indicator (1=death, 0=censored)", datasetMatch: "os_event" },
      { name: "age", role: "covariate", type: "continuous", description: "Age at diagnosis", unit: "years", datasetMatch: "age" },
      { name: "sex", role: "covariate", type: "binary", description: "Patient sex (M/F)", datasetMatch: "sex" },
      { name: "ecog_ps", role: "covariate", type: "ordinal", description: "ECOG performance status (0–2)", datasetMatch: undefined },
      { name: "stage", role: "covariate", type: "categorical", description: "Disease stage (IIIB/IV)", datasetMatch: "stage_iv" },
      { name: "pdl1_tps", role: "covariate", type: "continuous", description: "PD-L1 tumor proportion score (%)", unit: "%", datasetMatch: undefined },
      { name: "crp_baseline", role: "secondary_outcome", type: "continuous", description: "Baseline serum CRP (mg/L)", unit: "mg/L", datasetMatch: "crp_baseline" },
      { name: "histology", role: "covariate", type: "categorical", description: "Tumor histology (adenocarcinoma vs squamous)", datasetMatch: undefined },
    ],

    statisticalMethods: [
      "Cox proportional hazards regression",
      "Kaplan-Meier survival estimation",
      "Log-rank test",
      "Spearman correlation (IL-6 vs CRP)",
      "Proportional hazards assumption check via Schoenfeld residuals",
      "Variance inflation factor (VIF) for multicollinearity assessment",
    ],
    primaryAnalysis:
      "Multivariable Cox proportional hazards model with PFS as the time-to-event outcome, IL-6 (log-transformed, continuous) as the primary predictor, adjusted for age, sex, ECOG PS, and disease stage.",
    softwareUsed: ["R 4.3.1", "survival package", "survminer package", "ggplot2"],

    keyFindings: [
      "Higher baseline IL-6 independently associated with shorter PFS: HR 1.38 (95% CI 1.08–1.76), p=0.009",
      "Kaplan-Meier by IL-6 tertile: log-rank p=0.004 with clear stratum separation at 12 months",
      "IL-6 remained significant after adjusting for PD-L1 TPS in sensitivity analysis",
      "Spearman correlation between IL-6 and CRP: r=0.61, p<0.001",
      "Proportional hazards assumption not violated (global Schoenfeld p=0.21)",
    ],

    limitations: [
      "Retrospective design — potential selection bias",
      "Two-center study — may limit generalizability",
      "IL-6 measured at single baseline timepoint; serial measurements not available",
      "PD-L1 TPS data missing in 18% of patients",
      "No mechanistic data to explain IL-6-driven ICI resistance",
    ],

    conclusions:
      "Baseline serum IL-6 is an independent predictor of PFS in NSCLC patients receiving first-line pembrolizumab. These findings support further prospective evaluation of IL-6 as a routine biomarker in ICI treatment decisions.",

    datasetConnectionSummary:
      "Your dataset (nsclc_cohort_312_patients.csv) maps well to this paper's core analysis. 8 of 12 paper variables have direct matches. The primary Cox regression (IL-6 → PFS, adjusted for age, sex, stage) can be replicated. ECOG PS and PD-L1 TPS are missing from your dataset, which were adjustment covariates in the paper — this limits direct comparison but the core association can still be tested.",
    replicabilityScore: 78,
    replicabilityNotes: [
      "Core analysis replicable: IL-6 → PFS Cox regression can be run with your dataset",
      "Adjustment for ECOG PS not possible — not in dataset (minor limitation)",
      "Adjustment for PD-L1 TPS not possible — not in dataset",
      "Secondary endpoint (ORR) not in dataset — skip or note as limitation",
      "Sample size comparable: 312 vs paper's 287",
      "Suggested: run adjusted Cox with available covariates (age, sex, stage_iv) and note missing ECOG/PD-L1",
    ],
    variableMatchCount: 8,
    variableMissingCount: 4,

    keyTakeaways: {
      clinicalRelevance: "IL-6 is a cheap, widely available blood marker — if validated, it could help triage patients unlikely to benefit from ICI monotherapy before starting treatment.",
      statisticalApproach: "Standard, well-executed survival analysis (Cox + Kaplan-Meier) with appropriate assumption checking — a solid template for your own PFS/OS endpoints.",
      reusable: "The adjusted Cox model structure (predictor + age + sex + stage) maps almost directly onto your dataset.",
      caution: "Retrospective, two-center design — treat the effect size as a hypothesis to confirm, not a settled result.",
    },

    claims: [
      {
        finding: "Higher baseline IL-6 independently associated with shorter PFS",
        statistic: "HR 1.38",
        ci: "95% CI 1.08–1.76",
        pValue: "p = 0.009",
        model: "Multivariable Cox proportional hazards",
        covariates: ["age", "sex", "stage"],
        sourceRef: "p. 7, Table 2",
      },
      {
        finding: "IL-6 tertile groups show distinct PFS curves",
        statistic: "Log-rank χ²",
        pValue: "p = 0.004",
        model: "Kaplan-Meier, tertile-stratified",
        sourceRef: "p. 8, Figure 2",
      },
      {
        finding: "IL-6 and CRP are moderately correlated",
        statistic: "Spearman r = 0.61",
        pValue: "p < 0.001",
        sourceRef: "p. 9, Results — secondary analyses",
      },
    ],

    concepts: [
      {
        name: "Confounding",
        whyItMatters: "Age, sex, and disease stage could all independently affect both IL-6 levels and survival, creating a spurious association if unadjusted.",
        howToCheck: "Compare unadjusted vs. adjusted hazard ratios — a large shift suggests confounding was present.",
        datasetSupport: "supported",
      },
      {
        name: "Survival (immortal time) bias",
        whyItMatters: "If IL-6 was measured at variable times after treatment start, patients who progressed early may be systematically excluded.",
        howToCheck: "Verify IL-6 was measured within a fixed window (paper specifies ≤7 days) before treatment start.",
        datasetSupport: "supported",
      },
      {
        name: "Competing risks",
        whyItMatters: "Death from causes other than disease progression could distort a naive PFS estimate.",
        howToCheck: "Check whether pfs_event distinguishes progression/death from other causes of censoring.",
        datasetSupport: "partial",
      },
      {
        name: "Clinical vs. statistical significance",
        whyItMatters: "HR 1.38 is statistically significant, but whether a ~38% relative hazard increase changes treatment decisions is a separate clinical judgment.",
        howToCheck: "Discuss the absolute PFS difference (months) with a clinical collaborator, not just the HR.",
        datasetSupport: "not_supported",
      },
    ],

    replicationReadiness: {
      endpoint: { paper: "Progression-free survival (PFS)", dataset: "pfs_months + pfs_event", status: "ready" },
      exposure: { paper: "Baseline serum IL-6", dataset: "il6_baseline", status: "ready" },
      covariates: [
        { name: "age", status: "matched" },
        { name: "sex", status: "matched" },
        { name: "stage", status: "matched" },
        { name: "ECOG performance status", status: "missing" },
        { name: "PD-L1 TPS", status: "missing" },
      ],
      recommendedAnalyses: ["Kaplan-Meier curve stratified by IL-6 tertile", "Adjusted Cox proportional hazards regression"],
      warnings: [
        "ECOG performance status missing from dataset — replication will differ from the paper's fully-adjusted model",
        "PD-L1 TPS missing in 18% of patients — paper used this as a covariate",
        "Dataset sample size (312) is larger than the paper's (287) — not a limitation, but note when comparing effect sizes",
      ],
    },

    methodCard: {
      name: "Adjusted Cox Regression — IL-6 → PFS",
      usedInPaper: true,
      endpoint: "Progression-free survival",
      exposure: "Baseline serum IL-6 (log-transformed)",
      covariates: ["age", "sex", "stage"],
      reportedResult: "HR 1.38 (95% CI 1.08–1.76), p = 0.009",
      datasetReadiness: "3/5 variables matched (ECOG, PD-L1 TPS missing)",
    },

    researchGaps: [
      "Did not evaluate biomarker-defined subgroups (e.g. PD-L1 × IL-6 interaction)",
      "No external validation cohort — findings are from a single two-center sample",
      "ECOG-adjusted sensitivity analysis not performed due to missing data",
    ],

    agentTrace: [
      { agent: "Paper Agent", action: "Extracted methods, study design, and 12 variables from PDF", timestamp: "2026-05-13T11:18:00Z" },
      { agent: "Paper Agent", action: "Linked 8 of 12 paper variables to dataset columns", timestamp: "2026-05-13T11:20:00Z" },
      { agent: "Critic Agent", action: "Flagged ECOG performance status and PD-L1 TPS as missing from dataset", timestamp: "2026-05-13T11:21:00Z" },
      { agent: "Memory Agent", action: "Created rulebook entry linking il6_baseline to this paper's primary exposure", timestamp: "2026-05-13T11:22:00Z" },
    ],

    suggestedQuestions: [
      {
        question: "What statistical tests did this paper use?",
        answer: "The paper used multivariable Cox proportional hazards regression as the primary analysis, with Kaplan-Meier estimation and the log-rank test for the tertile comparison, Spearman correlation for the IL-6/CRP relationship, and Schoenfeld residuals plus VIF to check Cox model assumptions.",
        sources: "p. 3–5, Methods section",
        confidence: "high",
        relatedActions: ["Add to Rulebook", "Create Analysis"],
      },
      {
        question: "What variables should I map to my dataset?",
        answer: "Map il6_baseline (exposure), pfs_months + pfs_event (outcome), and age/sex/stage as covariates — all already matched. ECOG performance status and PD-L1 TPS are used in the paper but not present in your dataset.",
        sources: "p. 4, Table 1 variable list",
        confidence: "high",
        relatedActions: ["Map Variables"],
      },
      {
        question: "Can I replicate this paper?",
        answer: "Mostly yes. Your dataset has everything needed for the core Cox model (IL-6 adjusted for age, sex, stage). You won't be able to replicate the ECOG- and PD-L1-adjusted sensitivity analyses without those columns.",
        sources: "Replication Readiness assessment",
        confidence: "high",
        relatedActions: ["Create Analysis"],
      },
      {
        question: "What are the major limitations?",
        answer: "Retrospective design with potential selection bias, two-center sample limiting generalizability, single baseline IL-6 measurement rather than serial levels, and 18% missingness in PD-L1 TPS.",
        sources: "p. 11, Limitations section",
        confidence: "medium",
        relatedActions: [],
      },
    ],
  },

  {
    id: "paper_002",
    projectId: "project_001",
    sensitivityLevel: "public",
    title: "Inflammatory Markers and Overall Survival in Advanced Lung Cancer: A Meta-Analysis",
    authors: "Hoffman, D., Patel, A., Ferreira, C., Nakamura, Y., et al.",
    journal: "The Lancet Oncology",
    year: 2023,
    doi: "10.1016/S1470-2045(23)00412-9",
    pageCount: 22,
    uploadedAt: "2026-05-18",
    status: "processed",
    libraryStatus: "extracted",
    extractionCompletedAt: "2026-05-18T14:05:00Z",
    extractionConfidence: "medium",
    methodsPageRef: "p. 4–7, Methods section",

    abstract:
      "We performed a systematic review and meta-analysis of 24 studies (n=6,842 patients) examining the association between pre-treatment inflammatory markers (IL-6, CRP, NLR) and overall survival in advanced lung cancer. Random-effects meta-analysis demonstrated that elevated IL-6 was associated with significantly worse OS (pooled HR 1.52, 95% CI 1.34–1.72, I²=43%). CRP showed similar associations (pooled HR 1.41, 95% CI 1.22–1.63). These findings support inflammatory markers as prognostic biomarkers in advanced lung cancer.",

    researchQuestion:
      "Are pre-treatment inflammatory markers (IL-6, CRP, NLR) associated with overall survival in patients with advanced lung cancer, and what is the magnitude of association across published studies?",

    hypotheses: [
      "Elevated baseline IL-6 is associated with worse overall survival across multiple studies (pooled analysis).",
      "CRP and NLR provide additional or complementary prognostic information.",
    ],

    studyDesign: "Systematic review and random-effects meta-analysis of 24 published cohort studies",
    studyType: "Meta-analysis",
    population: "Patients with advanced (stage III–IV) lung cancer across 24 studies published 2010–2023, n=6,842 total",
    sampleSize: 6842,
    followUpDuration: "Study-specific; median OS across included studies 12.1–31.4 months",

    inclusionCriteria: [
      "Studies reporting baseline IL-6, CRP, or NLR and OS outcome",
      "Advanced lung cancer (stage III–IV) population",
      "Hazard ratio and 95% CI reported or derivable",
      "Published 2010–2023",
    ],
    exclusionCriteria: [
      "Early-stage lung cancer studies",
      "Studies without survival endpoint",
      "Case reports or case series <20 patients",
      "No available HRs",
    ],

    primaryEndpoint: "Overall survival (OS)",
    secondaryEndpoints: ["Progression-free survival (PFS)", "Objective response rate"],

    variables: [
      { name: "il6_elevated", role: "independent", type: "binary", description: "Elevated baseline IL-6 (study-specific cutoffs)" },
      { name: "crp_elevated", role: "independent", type: "binary", description: "Elevated baseline CRP" },
      { name: "nlr_elevated", role: "independent", type: "binary", description: "Elevated neutrophil-to-lymphocyte ratio" },
      { name: "os_hr", role: "primary_outcome", type: "continuous", description: "Pooled hazard ratio for OS" },
      { name: "pfs_hr", role: "secondary_outcome", type: "continuous", description: "Pooled hazard ratio for PFS" },
    ],

    statisticalMethods: [
      "Random-effects meta-analysis (DerSimonian-Laird method)",
      "Cochran Q test and I² statistic for heterogeneity",
      "Funnel plot asymmetry and Egger's test for publication bias",
      "Sensitivity analysis excluding high-risk-of-bias studies",
      "Subgroup analysis by treatment type (ICI vs chemotherapy)",
    ],
    primaryAnalysis:
      "Random-effects meta-analysis of HR for OS in studies reporting elevated vs non-elevated IL-6, CRP, and NLR.",
    softwareUsed: ["R 4.2", "meta package", "metafor package"],

    keyFindings: [
      "IL-6 elevated vs normal: pooled HR for OS = 1.52 (95% CI 1.34–1.72), p<0.001, I²=43%",
      "CRP elevated vs normal: pooled HR for OS = 1.41 (95% CI 1.22–1.63)",
      "NLR elevated vs normal: pooled HR for OS = 1.38 (95% CI 1.19–1.60)",
      "Subgroup: IL-6 effect larger in ICI-treated patients (HR 1.67) vs chemotherapy (HR 1.38)",
      "No significant publication bias detected (Egger's p=0.18)",
    ],

    limitations: [
      "Heterogeneous IL-6 cutoffs across studies (no universal threshold)",
      "Moderate heterogeneity for IL-6 (I²=43%)",
      "Most included studies retrospective",
      "Limited data on combined multi-marker models",
    ],

    conclusions:
      "Pre-treatment elevated IL-6, CRP, and NLR are consistent prognostic markers for worse overall survival in advanced lung cancer. The effect appears larger in ICI-treated populations, supporting their evaluation as predictive as well as prognostic biomarkers.",

    datasetConnectionSummary:
      "This is a meta-analysis — direct data replication is not applicable. However, the pooled HRs from this paper provide valuable benchmarks for comparing your study's effect estimates. Your HR for IL-6 → PFS (1.42) is consistent with this paper's pooled OS HR (1.52), supporting external validity.",
    replicabilityScore: 20,
    replicabilityNotes: [
      "Not directly replicable (meta-analysis, not primary data study)",
      "Use as external benchmark: compare your HR to pooled HRs reported here",
      "Subgroup finding (stronger IL-6 effect in ICI patients) directly relevant to your cohort",
    ],
    variableMatchCount: 2,
    variableMissingCount: 3,

    keyTakeaways: {
      clinicalRelevance: "Provides an external benchmark — your own IL-6 effect size can be compared against this pooled estimate across 24 studies.",
      statisticalApproach: "Random-effects meta-analysis is appropriate given between-study heterogeneity (I²=43%); not a method you'd run directly on your own single-cohort dataset.",
      reusable: "The subgroup finding (IL-6 effect larger in ICI-treated patients) is directly relevant context for interpreting your own cohort.",
      caution: "Heterogeneous IL-6 cutoffs across the 24 included studies — pooled HR should be treated as a rough benchmark, not a precise target.",
    },

    claims: [
      {
        finding: "Elevated IL-6 associated with worse overall survival",
        statistic: "Pooled HR 1.52",
        ci: "95% CI 1.34–1.72",
        pValue: "p < 0.001",
        model: "Random-effects meta-analysis (24 studies, n=6,842)",
        sourceRef: "p. 9, Figure 3 (forest plot)",
      },
      {
        finding: "IL-6 effect larger in ICI-treated vs. chemotherapy-treated patients",
        statistic: "HR 1.67 vs. 1.38",
        sourceRef: "p. 12, Subgroup analysis",
      },
    ],

    concepts: [
      {
        name: "Effect modification",
        whyItMatters: "The IL-6/survival relationship differs by treatment type (ICI vs. chemo) — treatment may modify the effect rather than just confound it.",
        howToCheck: "Test an IL-6 × treatment interaction term if you have both treatment groups in your data.",
        datasetSupport: "not_supported",
      },
      {
        name: "Publication bias",
        whyItMatters: "Meta-analyses can overstate effects if null studies go unpublished.",
        howToCheck: "Paper reports a non-significant Egger's test (p=0.18) — read as reassuring but not definitive.",
        datasetSupport: "not_supported",
      },
    ],

    agentTrace: [
      { agent: "Paper Agent", action: "Extracted meta-analysis methodology and pooled effect estimates", timestamp: "2026-05-18T14:02:00Z" },
      { agent: "Critic Agent", action: "Flagged paper as not directly replicable — recommended use as external benchmark only", timestamp: "2026-05-18T14:05:00Z" },
    ],

    suggestedQuestions: [
      {
        question: "Can I replicate this paper?",
        answer: "No — this is a meta-analysis of 24 published studies, not a primary dataset. Use its pooled hazard ratios as an external benchmark to compare against your own cohort's effect estimates instead.",
        sources: "p. 2, Study design",
        confidence: "high",
        relatedActions: [],
      },
      {
        question: "What are the major limitations?",
        answer: "Heterogeneous IL-6 cutoffs across studies (I²=43%), most included studies were retrospective, and limited data on combined multi-marker models.",
        sources: "p. 14, Limitations",
        confidence: "medium",
        relatedActions: [],
      },
    ],
  },

  {
    id: "paper_003",
    projectId: "project_001",
    sensitivityLevel: "public",
    title: "Cox Proportional Hazards Models in Clinical Oncology Trials",
    authors: "Williams, P., Osei, K., Tanaka, M.",
    journal: "Statistics in Medicine",
    year: 2022,
    doi: "10.1002/sim.9512",
    pageCount: 18,
    uploadedAt: "2026-06-01",
    status: "pending",
    libraryStatus: "processing",
  },

  {
    id: "paper_101",
    projectId: "project_002",
    sensitivityLevel: "restricted",
    title: "Depressive Symptom Severity and Glycemic Control in Adults with Type 2 Diabetes",
    authors: "Okonkwo, C., Reyes, M., Lindqvist, S.",
    journal: "Diabetes Care",
    year: 2025,
    doi: "10.2337/dc25-0417",
    pageCount: 11,
    uploadedAt: "2026-06-20",
    status: "processed",
    libraryStatus: "extracted",
    extractionCompletedAt: "2026-06-20T15:40:00Z",
    extractionConfidence: "medium",
    methodsPageRef: "p. 2–3, Methods section",

    abstract:
      "Background: Depression is common among adults with type 2 diabetes (T2D) and has been linked to poorer self-management. We examined whether depressive symptom severity is cross-sectionally associated with glycemic control. Methods: We analyzed 150 adults with T2D from a single outpatient endocrinology clinic. Depressive symptoms were measured via PHQ-9; glycemic control was defined as HbA1c ≥8%. Logistic regression estimated the association between PHQ-9 score and poor glycemic control, adjusting for medication adherence, age, and diabetes duration. Results: Higher PHQ-9 scores were associated with greater odds of poor glycemic control (OR 1.09 per point, 95% CI 1.02–1.17, p=0.01), attenuated but not eliminated after adjusting for medication adherence. Conclusions: Depressive symptom severity is independently associated with glycemic control in T2D and may partly act through reduced adherence.",

    researchQuestion:
      "Is depressive symptom severity (PHQ-9 score) associated with poor glycemic control (HbA1c ≥8%) in adults with type 2 diabetes, independent of medication adherence?",

    studyDesign: "Cross-sectional observational study at a single outpatient endocrinology clinic",
    studyType: "Cross-sectional",
    population: "Adults with type 2 diabetes attending a single outpatient endocrinology clinic",
    sampleSize: 150,
    primaryEndpoint: "Poor glycemic control (HbA1c ≥8%)",

    variables: [
      { name: "phq9_score", role: "independent", type: "continuous", description: "PHQ-9 depressive symptom severity score (0–27)", datasetMatch: "phq9_score" },
      { name: "hba1c", role: "primary_outcome", type: "continuous", description: "Glycated hemoglobin (%)", unit: "%", datasetMatch: "hba1c" },
      { name: "medication_adherence", role: "covariate", type: "continuous", description: "Self-reported medication adherence (%)", unit: "%", datasetMatch: "medication_adherence_pct" },
      { name: "age", role: "covariate", type: "continuous", description: "Age", unit: "years", datasetMatch: "age" },
      { name: "diabetes_duration", role: "covariate", type: "continuous", description: "Years since T2D diagnosis", unit: "years", datasetMatch: "diabetes_duration_years" },
    ],

    statisticalMethods: ["Logistic regression", "Chi-square test", "Spearman correlation"],
    primaryAnalysis:
      "Logistic regression with poor glycemic control (HbA1c ≥8%) as the outcome, PHQ-9 score as the primary predictor, adjusted for medication adherence, age, and diabetes duration.",
    softwareUsed: ["R 4.3.1"],

    keyFindings: [
      "Higher PHQ-9 score associated with greater odds of poor glycemic control: OR 1.09 per point (95% CI 1.02–1.17), p=0.01",
      "Association attenuated but not eliminated after adjusting for medication adherence",
    ],

    limitations: [
      "Cross-sectional design — cannot establish temporal or causal direction",
      "Single-clinic sample — limited generalizability",
      "Medication adherence self-reported, not objectively measured",
    ],

    conclusions:
      "Depressive symptom severity is independently associated with glycemic control in adults with type 2 diabetes, partly but not fully explained by medication adherence.",

    datasetConnectionSummary:
      "Your dataset (t2d_depression_cohort_150_patients.csv) maps directly to this paper's core variables — phq9_score, hba1c, medication_adherence_pct, age, and diabetes_duration_years are all present.",
    replicabilityScore: 82,
    variableMatchCount: 5,
    variableMissingCount: 0,

    keyTakeaways: {
      clinicalRelevance: "PHQ-9 is a quick, widely-used screening tool — if this association replicates, routine depression screening could flag patients at risk of poor glycemic control.",
      statisticalApproach: "Straightforward logistic regression with a binary glycemic-control outcome — directly reusable on your cross-sectional dataset.",
      reusable: "The adjusted model structure (PHQ-9 + adherence + age + duration) maps directly onto your dataset's columns.",
      caution: "Cross-sectional design — treat the association as hypothesis-generating, not causal.",
    },
  },
]
