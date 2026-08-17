# AI Research Analytics Workspace

## Product Vision

This project is an AI-powered analytics workspace for researchers. The primary focus is biomedical and clinical research, because that is the initial domain of interest. The product should still be designed so it can later support psychology, social science, education research, and general graduate student research workflows.

The goal is to help researchers move from paper, dataset, and research question to valid analysis, visualization, interpretation, and report generation faster, while keeping the process traceable, reproducible, and scientifically responsible.

The software should not simply be a generic "chat with your data" tool. Its core value should be:

> Given my research question, paper, and dataset, help me decide what analysis is valid, run it, explain it, visualize it, and document it.

## Primary Target Domain

The first version should be streamlined for biomedical and clinical research.

Biomedical and clinical researchers often work with:

- patient datasets
- clinical trial data
- observational cohort data
- case-control studies
- biomarker measurements
- lab test results
- survey/questionnaire data
- treatment groups
- outcomes and endpoints
- longitudinal patient follow-up
- survival/time-to-event outcomes
- adverse events
- demographics and clinical covariates
- research papers, protocols, and supplementary methods

The product should support these workflows first, while keeping the architecture flexible enough for:

- psychology research
- social science research
- education research
- general graduate student research

## Broader Research Fields To Keep In Mind

### Biomedical and Clinical Research

Primary focus. The tool should support clinical study design, paper-method extraction, patient-level data analysis, biomarker analysis, survival analysis, regression modeling, group comparisons, visualizations, and manuscript-ready reports.

### Psychology Research

Important secondary use case. Psychology researchers often work with surveys, experimental groups, behavioral outcomes, scales, factor analysis, t-tests, ANOVA, correlation, regression, and mediation/moderation analysis.

### Social Science Research

Useful expansion area. Social science researchers often work with survey data, demographics, policy outcomes, categorical variables, regression models, longitudinal datasets, and mixed quantitative/qualitative workflows.

### General Graduate Student Research

Broad user base. Graduate students need help understanding papers, cleaning datasets, choosing analyses, interpreting statistics, making figures, and writing results sections.

## Researcher Workflow

The software should reflect how researchers actually work.

### 1. Question Formation

Researchers start by defining what they are trying to prove, compare, predict, explain, replicate, or explore.

Examples:

- Does treatment A improve outcome B compared with treatment C?
- Which baseline clinical variables predict disease progression?
- Are biomarker levels associated with survival?
- Can this published method be replicated with my dataset?
- What variables explain patient response differences?

### 2. Literature and Paper Review

Researchers read existing papers to understand:

- research questions
- hypotheses
- study population
- inclusion and exclusion criteria
- methods
- variables
- endpoints
- statistical tests
- model choices
- sample size
- limitations
- conclusions

The software should help extract these elements from papers and connect them to the user's dataset.

### 3. Data Understanding

Researchers need to understand:

- what variables exist
- what each column means
- whether values are coded correctly
- variable types
- missing data
- outliers
- distribution shapes
- group balance
- data quality issues
- whether the dataset can answer the research question

### 4. Method Selection

Researchers must choose appropriate statistical tests or models.

The system should help decide based on:

- research question
- outcome type
- predictor type
- number of groups
- paired vs independent samples
- repeated measures
- longitudinal structure
- time-to-event data
- normality
- variance equality
- sample size
- covariates/confounders
- assumptions and limitations

### 5. Analysis

The product should support analysis execution using deterministic statistical libraries, not only AI-generated text.

The system should run:

- descriptive statistics
- hypothesis tests
- regression models
- survival analysis
- classification models
- clustering
- dimensionality reduction
- assumption checks
- sensitivity analyses
- visualizations

### 6. Interpretation

Researchers need help understanding:

- what the result means
- whether the result is statistically significant
- whether the result is clinically or practically meaningful
- how it relates to the hypothesis
- what limitations exist
- whether assumptions were violated
- what alternative analyses should be considered

### 7. Writing and Reporting

Researchers eventually need:

- methods sections
- results sections
- figure captions
- table captions
- limitations
- reproducibility notes
- supplementary analysis outputs
- exportable tables and charts

The system should generate drafts while making clear what is AI-generated, what is computed from data, and what needs human review.

## Core Product Structure

The product should be a full dashboard-based research workspace with multiple tabs for the complete research workflow.

## Research Workspace

Each project should contain:

- uploaded papers
- uploaded datasets
- research questions
- study notes
- variable dictionary
- analysis history
- generated charts
- generated tables
- agent outputs
- code outputs
- report drafts
- audit logs
- export files

This workspace should behave like a combination of:

- lab notebook
- data analysis dashboard
- paper reader
- AI research assistant
- reproducible analysis environment

## Paper Understanding Tab

Researchers should be able to upload a paper, protocol, or supplemental reading.

Features:

- summarize paper by section
- extract abstract, methods, results, and limitations
- identify research question
- identify hypotheses
- extract study design
- extract population/sample information
- extract inclusion and exclusion criteria
- extract variables and endpoints
- extract statistical methods
- extract models/tests used
- extract sample size
- identify conclusions
- identify limitations
- compare multiple papers
- create a concept map
- connect paper methods to user datasets

Key workflow:

> Can I replicate, adapt, or extend this paper's method using my dataset?

## Data Understanding Tab

Researchers should be able to upload datasets such as CSV, Excel, JSON, SPSS exports, REDCap exports, clinical trial datasets, or other structured files.

Features:

- schema detection
- variable type inference
- data dictionary generation
- missingness report
- distribution summaries
- outlier detection
- group balance checks
- correlation map
- variable relationship discovery
- duplicate detection
- invalid value detection
- clinical range checks
- categorical encoding review
- date/time parsing
- longitudinal structure detection
- patient/event structure detection
- plain-language dataset summary

Example output:

> Your dataset appears to contain 312 patients, 18 clinical variables, 6 demographic variables, 4 biomarkers, and 2 outcome variables. The outcome `progression_free_survival_months` appears to be time-to-event data, and the variable `event_status` may be the censoring indicator.

## Research Question Builder

This should be one of the most important features.

Researchers should be able to describe their goal naturally:

- Does treatment A improve survival compared with treatment B?
- Are biomarker levels associated with disease progression?
- Which clinical variables predict readmission?
- Can I replicate the analysis from this paper?
- Are depression scores related to sleep quality?
- Which variables predict academic performance?

The system should translate the natural-language research goal into:

- dependent variable
- independent variable
- covariates
- population/subgroup
- hypothesis
- endpoint
- expected statistical family
- possible primary analysis
- alternative analyses
- assumptions to check

## Test and Model Recommendation Engine

The recommendation engine is the core intelligence of the product.

Inputs:

- research question
- paper methods
- dataset schema
- variable types
- sample size
- missingness
- distribution properties
- study design
- assumptions
- user preferences

Outputs:

- recommended primary analysis
- alternative analyses
- assumption checks
- suggested visualizations
- warnings
- explanation of why a method fits
- explanation of when it may not fit

Example:

> Because your outcome is continuous and your grouping variable has three categories, one-way ANOVA may be appropriate. However, Levene's test suggests unequal variances, so Welch's ANOVA is safer. If the outcome is not normally distributed, consider Kruskal-Wallis as a nonparametric alternative.

Biomedical and clinical analysis recommendations should eventually include:

- t-test
- chi-square test
- Fisher's exact test
- ANOVA
- Welch's ANOVA
- Mann-Whitney U test
- Wilcoxon signed-rank test
- Kruskal-Wallis test
- correlation analysis
- linear regression
- logistic regression
- ordinal regression
- Poisson/negative binomial regression
- Cox proportional hazards model
- Kaplan-Meier analysis
- log-rank test
- mixed effects models
- repeated measures analysis
- propensity score matching/weighting
- sensitivity analysis
- subgroup analysis
- ROC/AUC analysis
- calibration analysis
- classification models
- clustering
- PCA/dimensionality reduction

The system should not blindly run tests. It should explain why a test/model is recommended and what assumptions matter.

## Analysis Execution Tab

The analysis tab should allow researchers to run recommended or custom analyses.

Each analysis should produce:

- result table
- statistical output
- assumptions checked
- interpretation
- warnings
- visualization
- code used
- reproducibility metadata
- exportable result

The product should support both guided workflows and advanced custom workflows.

Guided workflow:

- user selects research question
- system recommends analysis
- user reviews recommendation
- user approves execution
- system runs analysis
- system explains results

Advanced workflow:

- user selects variables
- user selects model/test
- user configures covariates/options
- system runs analysis
- system checks assumptions
- system explains output

## Visualization Studio

Researchers need publication-ready charts.

The software should support:

- histogram
- density plot
- boxplot
- violin plot
- scatterplot
- regression line
- bar chart with error bars
- line chart
- heatmap
- correlation matrix
- PCA plot
- Kaplan-Meier curve
- forest plot
- ROC curve
- calibration plot
- waterfall plot
- volcano plot, if later supporting omics data
- CONSORT-style flow diagram, eventually

Key feature:

> Suggest the best visualizations for this research question and analysis.

Visualization outputs should be exportable for:

- manuscript figures
- presentations
- supplementary materials
- reports

## Report Builder

The report builder should generate research-ready drafts.

Outputs:

- methods section
- results section
- figure captions
- table captions
- limitations
- clinical/statistical interpretation
- summary for nontechnical readers
- supplementary analysis notes
- reproducibility appendix

Export formats:

- Word
- PDF
- Markdown
- LaTeX
- CSV tables
- PNG/SVG/PDF figures

Important principle:

The product should clearly separate:

- AI-generated draft text
- verified statistical output
- user-edited final text

## AI Agent Architecture

The product should use an agentic system with multiple specialized roles, but the first version should not build custom LLM agents from scratch and should not depend on API-token model usage as the primary path.

The first version should use external CLI-based AI tools, primarily Codex CLI and/or Claude CLI, installed on the user's local machine and authenticated through the user's subscription/login. Each "agent" in this product is a role-specific prompt pack plus rulebook context, project context, expected output schema, and allowed local tools.

The product's own software should handle:

- orchestration
- prompt packaging
- rulebook retrieval
- self-improvement tracking
- reusable script generation
- deterministic computation
- logging
- rollback
- user interface
- project storage

The external CLI agent should handle the AI reasoning and code-generation work for the specific task it is given.

The AI layer should be designed around specialist prompt-driven roles, deterministic validation, and detailed traceability.

### External CLI Agent Runner

The system should have an AI runner layer that can call external CLI tools from the local machine.

Supported runners:

- Codex CLI
- Claude CLI / Claude Code

The runner should:

- create an isolated task workspace
- write the role prompt and context files
- call the selected CLI agent
- enforce expected output structure when possible
- capture stdout/stderr and generated files
- record token/cost/usage estimates when available
- store logs for each run
- return structured results to the backend

Example local flow:

```text
Research dashboard request
  -> FastAPI backend
  -> Prompt Pack Manager
  -> Rulebook Engine
  -> CLI Runner
  -> Codex CLI or Claude CLI
  -> structured output
  -> validation/logging/storage
```

Each CLI task should run with only the files and context needed for that task. The agent should not automatically receive unrestricted access to all projects, all datasets, or all user files.

### Prompt Packs

Each agent role should be implemented as a versioned prompt pack.

Prompt packs should exist for:

- Planner Agent
- Paper Agent
- Data Agent
- Stats Agent
- Code Agent
- Visualization Agent
- Report Agent
- Critic/Verification Agent
- Memory Agent

Each prompt pack should include:

- role definition
- task boundaries
- required input format
- required output format
- provenance requirements
- rulebook usage instructions
- when to use deterministic scripts
- when to generate a new reusable script
- logging requirements
- self-improvement rules
- rollback metadata requirements

Prompt packs should be versioned, for example:

```text
prompts/stats_agent/v1.md
prompts/stats_agent/v2.md
prompts/report_agent/v1.md
```

When the agent auto-improves a prompt, the system should create a new prompt version instead of overwriting the old one.

### Planner Agent

Understands the user's request, breaks it into steps, and routes work to specialist agents.

### Paper Agent

Reads papers, protocols, and supplemental files.

Responsibilities:

- summarize papers
- extract methods
- extract variables
- extract endpoints
- extract sample size
- extract statistical tests
- extract limitations
- compare papers
- connect paper methods to available data

### Data Agent

Profiles datasets and identifies data quality issues.

Responsibilities:

- infer schema
- detect variable types
- identify missingness
- find outliers
- detect duplicate records
- detect possible coding problems
- identify patient/time/event structure
- generate data dictionary
- summarize dataset

### Stats Agent

Recommends statistical tests and models.

Responsibilities:

- map research questions to statistical approaches
- check assumptions
- recommend primary analysis
- recommend alternatives
- identify confounders/covariates
- explain statistical reasoning
- flag invalid or risky analysis choices

### Code Agent

Generates and executes analysis code.

Responsibilities:

- produce Python/R analysis code
- run deterministic statistical libraries
- return tables and model outputs
- preserve executable code
- support reproducibility

### Visualization Agent

Creates and recommends charts.

Responsibilities:

- suggest chart types
- generate analysis-specific visualizations
- format figures for research use
- create publication-ready exports

### Report Agent

Writes research outputs.

Responsibilities:

- draft methods sections
- draft results sections
- write figure captions
- write table captions
- generate limitations
- produce nontechnical summaries

### Critic/Verification Agent

Checks whether the analysis, reasoning, and generated text are valid.

Responsibilities:

- challenge unsupported claims
- detect assumption violations
- verify that the statistical method matches the research question
- check whether paper methods were represented accurately
- flag hallucinated citations or claims
- review generated reports for overstatement

This agent is essential because wrong analysis advice can mislead research.

### Memory Agent

Tracks project context.

Responsibilities:

- remember project goals
- track uploaded papers
- track datasets
- track selected variables
- preserve researcher preferences
- maintain analysis history
- support continuity across sessions
- maintain the project rulebook
- remember accepted user corrections
- prevent repeated analysis mistakes
- reduce repeated LLM calls by reusing validated rules and prior decisions

## Self-Learning Rulebook

All agents should improve from user feedback, project history, repeated workflows, successful analyses, failed analyses, and corrections. If a user corrects an agent, rejects a suggestion, changes an interpretation, repeatedly performs the same workflow, or if the system detects that a reusable pattern is forming, the system should learn from that interaction.

The product should maintain a rulebook that captures validated project knowledge, user preferences, and domain-specific analysis decisions.

The rulebook is not the same as unrestricted model training. It should be an explicit, versioned knowledge layer that agents retrieve from before generating new recommendations.

The system should auto-improve without requiring human validation before every change. Instead, every automatic improvement should be logged, versioned, and reversible so the user can inspect it and undo it if it is not working or not feasible.

### Auto-Improvement Policy

The agent system should automatically improve itself by deciding whether a repeated pattern should become:

- a rulebook entry
- a reusable Python script
- a prompt pack update
- a workflow update
- a cached analysis artifact

The system should not add every one-off idea to the rulebook. Rulebook entries should be reserved for recurring, repetitive, or clearly reusable suggestions and analyses.

Recommended triggers:

- the same correction appears more than once
- the same analysis workflow is repeated
- the same variable mapping is reused
- the same statistical decision is repeatedly selected
- a deterministic validation step confirms a repeated issue
- a generated script succeeds and is reused
- the user repeatedly edits agent output in the same way

### Reusable Python Script Generation

Repeated analyses should be converted into reusable Python scripts whenever possible. This reduces token usage because the system can run tested scripts instead of asking the AI agent to regenerate analysis code from scratch.

Examples:

- `missingness_profile.py`
- `group_comparison_table.py`
- `survival_kaplan_meier.py`
- `survival_cox_adjusted.py`
- `logistic_regression_adjusted.py`
- `correlation_matrix_report.py`
- `clinical_baseline_table.py`

Each reusable script should include:

- input schema
- output schema
- required variable types
- assumptions
- generated-by metadata
- script version
- last successful run
- compatible project/data contexts
- error handling
- log output

Future analyses should prefer existing reusable scripts when they fit the current task. The AI agent should only generate new code when no suitable reusable script exists or when the current task requires meaningful adaptation.

### Prompt Auto-Updates

Agents should be able to auto-update their prompt packs when the problem is behavioral rather than project-specific.

Examples:

- Stats Agent learns to always distinguish clinical significance from statistical significance.
- Report Agent learns to avoid overstating observational findings.
- Data Agent learns to check event/censoring columns before survival analysis.
- Visualization Agent learns to prefer Kaplan-Meier curves for time-to-event comparisons.

Prompt updates should create a new version and log the change. Old prompt versions should remain available for rollback.

### Rulebook Goals

- prevent agents from making the same mistake repeatedly
- avoid suggesting the same invalid analysis over and over
- remember user-approved analysis choices
- remember user corrections
- reduce token usage by reusing established rules
- improve consistency across sessions
- make agent reasoning more transparent
- support researcher-specific and project-specific preferences

### Rulebook Examples

Examples of useful rules:

- For this project, `OS_months` is the survival time variable.
- For this project, `death_event` is the event indicator.
- The user prefers Cox regression adjusted for age, sex, and disease stage.
- Do not recommend a t-test for `tumor_stage` because it is ordinal.
- Use Fisher's exact test instead of chi-square when expected cell counts are small.
- The user corrected `treatment_group` labels; use the cleaned mapping.
- Do not rerun missingness profiling unless the dataset changes.
- For this paper, the primary endpoint is progression-free survival, not overall survival.
- For this user, always show both statistical significance and clinical interpretation.

### Rule Types

The rulebook should store different kinds of rules:

- project rules
- user preference rules
- dataset-specific rules
- paper-specific rules
- statistical decision rules
- visualization preference rules
- report-writing preference rules
- correction rules
- cost-saving cache rules

### Rule Creation

Rules can be created when:

- a user corrects an agent
- a user approves a recommendation
- a user rejects a recommendation and explains why
- a user manually selects a better test/model
- the system detects a repeated workflow
- the Critic/Verification Agent flags a mistake
- a deterministic validation step proves a choice is invalid
- an agent detects that a repeated analysis should be converted into a reusable script
- an agent updates its own prompt pack to avoid repeating a behavioral mistake

Every new rule should include:

- rule text
- source interaction
- agent involved
- scope
- confidence
- timestamp
- creator, such as user, system, or verifier
- whether the rule was auto-created or user-created
- related reusable script, if applicable
- related prompt version, if applicable

### Rule Scope

Rules should have clear scope:

- global product-level rules
- domain-level rules, such as biomedical or psychology
- user-level rules
- organization/lab-level rules
- project-level rules
- dataset-level rules
- paper-level rules
- analysis-level rules

The system should avoid applying a narrow rule too broadly. For example, a correction about one dataset should not automatically become a universal biomedical rule.

### Rule Review and Editing

Users should be able to:

- view the rulebook
- approve new rules
- edit rules
- disable rules
- delete rules
- see where a rule came from
- see where a rule was used
- reset rules for a project if needed
- undo an auto-created rule
- rollback to a previous rulebook version

This is important because incorrect learned rules can be as harmful as incorrect AI output.

### Agent Use of the Rulebook

Before providing an answer, analysis recommendation, visualization suggestion, or report draft, the relevant agent should:

1. retrieve applicable rules
2. check whether the rule applies to the current context
3. use deterministic validation where possible
4. decide whether existing rules are enough or new reasoning is needed
5. cite whether the output came from the rulebook, fresh reasoning, or both

### Required Output Provenance

Every agent output should clearly state its source of reasoning.

Possible labels:

- Rulebook: taken from a stored and previously validated rule
- New reasoning: generated for the current request
- Rulebook + new reasoning: based on an existing rule, extended for the current context
- Deterministic computation: produced by code/statistical library output
- Paper source: extracted from an uploaded paper
- Dataset source: derived from uploaded data

Example:

> Recommendation source: Rulebook + new reasoning. The rulebook says `death_event` is the event indicator for this project. New reasoning was used to recommend Cox regression because the current question asks about time-to-event survival differences while adjusting for covariates.

### Token Reduction Strategy

The rulebook should reduce token usage by:

- reusing validated dataset summaries
- reusing variable mappings
- reusing paper method extractions
- reusing approved statistical decisions
- reusing generated Python scripts
- reusing prompt-pack improvements
- avoiding repeated full-document processing
- avoiding repeated full-dataset summaries
- retrieving only relevant rules for each task
- using compact structured rules instead of long chat history
- caching agent outputs that are still valid

The system should prefer concise structured context over repeatedly sending large documents, long conversation history, or full datasets to the LLM.

### Rulebook Safety

The rulebook should not silently override scientific reasoning. If a stored rule conflicts with the current dataset, paper, or statistical assumptions, the agent should flag the conflict and ask for review.

Example:

> Rule conflict: the rulebook says to use logistic regression for this endpoint, but the current endpoint appears to be time-to-event data with censoring. Cox regression may be more appropriate.

### Self-Improvement Log

Every automatic improvement should be written to a dedicated self-improvement log.

This log should track:

- timestamp
- agent name
- change type
- trigger
- rulebook version before and after
- prompt version before and after
- scripts created or modified
- files changed
- reason for the change
- expected benefit
- usage/cost reduction expectation
- rollback pointer

Example:

```json
{
  "id": "change_000142",
  "timestamp": "2026-06-16T14:32:00-07:00",
  "agent": "stats_agent",
  "change_type": "python_script_created",
  "trigger": "same adjusted Cox regression workflow repeated 3 times",
  "files_changed": [
    "scripts/analysis/survival_cox_adjusted.py"
  ],
  "rulebook_entries_added": [
    "rule_0041"
  ],
  "prompt_version_before": "stats_agent_v7",
  "prompt_version_after": "stats_agent_v8",
  "summary": "Created reusable adjusted Cox regression script and updated Stats Agent to prefer this script when survival time, event indicator, and covariates are already mapped.",
  "rollback_available": true
}
```

The user should be able to inspect this log and undo any self-improvement if the change is not useful.

### Rollback System

The system should support rollback for:

- rulebook entries
- rulebook versions
- prompt pack versions
- generated scripts
- workflow changes
- cached analysis decisions

Rollback should work at both levels:

- undo a single change, such as `change_000142`
- rollback an entire agent to a previous known-good version

Example:

```text
Rollback Stats Agent to prompt v7 and rulebook v14.
Undo generated script survival_cox_adjusted.py from change_000142.
```

## Per-Agent Activity Logs

Every agent should have its own log so every step can be tracked, audited, debugged, and rolled back when needed. This is separate from the self-improvement log.

The activity log tracks what the agent did during normal work. The improvement log tracks when the agent changed a prompt, rulebook entry, reusable script, workflow, or internal behavior.

Each agent should maintain a dedicated log:

- `planner_agent.log`
- `paper_agent.log`
- `data_agent.log`
- `stats_agent.log`
- `code_agent.log`
- `visualization_agent.log`
- `report_agent.log`
- `critic_agent.log`
- `memory_agent.log`

Each log entry should include:

- timestamp
- project ID
- user request ID
- agent name
- agent prompt version
- rulebook version used
- task received
- context files or summaries used
- rules retrieved
- actions taken
- tools or scripts called
- CLI agent used, such as Codex CLI or Claude CLI
- deterministic computations run
- outputs produced
- provenance label used
- errors, warnings, or conflicts
- token/cost estimate when available
- runtime duration
- downstream agent handoff, if any

Example log entry:

```json
{
  "timestamp": "2026-06-16T14:32:00-07:00",
  "project_id": "project_001",
  "request_id": "request_089",
  "agent": "stats_agent",
  "prompt_version": "stats_agent_v8",
  "rulebook_version": "rulebook_v14",
  "task": "Recommend analysis for survival endpoint",
  "rules_used": ["rule_0041", "rule_0047"],
  "actions_taken": [
    "checked endpoint type",
    "checked event indicator",
    "recommended Cox proportional hazards model"
  ],
  "cli_runner": "codex_cli",
  "provenance": "Rulebook + New reasoning",
  "warnings": ["proportional hazards assumption still needs verification"],
  "outputs": ["analysis_recommendation_021.json"],
  "duration_ms": 8420
}
```

The system should also support a combined trace view for a full request, showing the complete path across all agents from upload to final report.

Example trace:

```text
request_089
  Planner Agent -> Paper Agent -> Data Agent -> Stats Agent -> Critic Agent -> Code Agent -> Visualization Agent -> Report Agent -> Memory Agent
```

This makes it possible to inspect exactly how an answer was produced, which rules were used, which agent made each decision, and where a mistake entered the workflow.

## Agent Flow

Recommended flow:

1. User uploads paper and dataset.
2. Planner Agent determines required steps.
3. Backend creates an isolated task workspace.
4. Memory Agent retrieves applicable rulebook entries and prior reusable scripts.
5. Prompt Pack Manager builds the correct role-specific prompt.
6. CLI Runner calls Codex CLI or Claude CLI for the selected agent role.
7. Paper Agent extracts research context.
8. Data Agent profiles the dataset.
9. Stats Agent maps research goals to possible analyses.
10. Critic/Verification Agent checks recommendations.
11. Each agent labels whether its output uses rulebook knowledge, new reasoning, deterministic computation, paper sources, dataset sources, or reusable scripts.
12. Each agent writes a step-by-step activity log entry.
13. Code Agent runs deterministic Python/R analysis or generates a reusable script when a repeated pattern is detected.
14. Visualization Agent generates charts.
15. Report Agent drafts interpretation and report sections.
16. Critic/Verification Agent reviews final output.
17. Memory Agent auto-updates rulebook entries, prompt packs, reusable scripts, and caches when recurring patterns are detected.
18. Self-improvement changes are logged with rollback pointers.
19. User exports results, figures, code, and report.

## Cost-Effective AI Strategy

The product should be powerful but cost-aware.

Preferred approach:

- use subscription-authenticated Codex CLI and/or Claude CLI as the primary AI execution path for the local-first version
- avoid API-token model usage as the primary path in the initial version
- use role-specific prompt packs instead of self-built LLM agents
- use embeddings and retrieval for paper/document search
- use deterministic Python/R libraries for statistical computation
- cache repeated document and dataset processing
- use the rulebook to avoid repeated reasoning and repeated mistakes
- convert repeated analysis workflows into reusable Python scripts
- auto-update prompt packs when recurring behavioral improvements are detected
- retrieve compact validated rules instead of sending long chat history
- avoid sending unnecessary full datasets to LLMs
- send schemas, summaries, and sampled rows when possible
- use background jobs for expensive operations
- allow the user to choose analysis depth/cost

The system should not rely on local open-source LLMs as the main path. Local models may be considered later for privacy-sensitive deployments, but they are not the preferred initial strategy.

For the public version later, the team may explore running Codex CLI and/or Claude CLI from a server terminal, but that is not the initial priority. Before public deployment, subscription, automation, concurrency, account, and product-policy constraints should be reviewed carefully. The first version should stay local-first.

## Deterministic Analysis Stack

AI should suggest, explain, and coordinate. Actual statistics should be computed using reliable libraries.

Possible Python libraries:

- pandas
- numpy
- scipy
- statsmodels
- scikit-learn
- lifelines
- pingouin
- matplotlib
- seaborn
- plotly

Possible R support later:

- tidyverse
- ggplot2
- lme4
- survival
- brms
- MatchIt
- caret/tidymodels

Possible document/data tooling:

- PyMuPDF
- unstructured
- docling
- marker
- pandas readers
- pyreadstat for SPSS/Stata/SAS files

Possible vector search:

- Qdrant
- Chroma
- FAISS

## Trust, Safety, and Reproducibility

This product must be designed for trust.

Every important output should include:

- source references
- dataset evidence
- analysis code
- assumptions checked
- warnings/caveats
- output provenance, such as rulebook, new reasoning, deterministic computation, paper source, or dataset source
- rulebook entries used
- conflicts between learned rules and current evidence
- per-agent activity logs
- complete request trace across agents
- confidence or uncertainty
- reproducibility metadata
- user approval history

The software should avoid presenting AI output as unquestionable fact.

It should act like:

> Here is the recommended analysis, why it fits, what assumptions were checked, what the result means, and what you should be careful about.

Not:

> Here is the answer.

## Clinical and Biomedical Safety Considerations

Because biomedical and clinical research can affect high-stakes decisions, the product must be careful.

Principles:

- do not provide medical diagnosis or treatment advice as a final authority
- do not overstate statistical significance
- distinguish statistical significance from clinical significance
- flag small sample sizes
- flag missingness and bias risks
- flag confounding
- identify observational vs experimental limits
- preserve audit trails
- protect patient privacy
- avoid unnecessary transmission of sensitive data
- support de-identification workflows
- make all analysis steps reviewable

Future versions may need:

- HIPAA-aware deployment options
- role-based access control
- data retention controls
- encryption
- institutional review/audit support
- compliance review for clinical environments

## Minimum Viable Product

The first useful version should do the following:

1. Run as a browser-based local web app on `localhost`.
2. Upload one paper PDF.
3. Upload one dataset such as CSV or Excel.
4. Extract paper methods, variables, endpoints, and statistical tests.
5. Profile the dataset.
6. Ask the user for their research goal.
7. Use Codex CLI or Claude CLI through the local AI Runner.
8. Suggest several possible analyses.
9. Explain why each analysis fits or does not fit.
10. Run the selected analysis with deterministic Python code.
11. Generate at least one chart.
12. Explain the result in researcher-friendly language.
13. Log every agent step.
14. Auto-create rulebook entries or reusable scripts when recurring patterns are detected.
15. Export a mini report with methods, results, figure, and code.

For the biomedical/clinical MVP, prioritize:

- descriptive statistics
- missingness report
- group comparisons
- correlation
- linear regression
- logistic regression
- Kaplan-Meier analysis
- Cox regression, if feasible
- basic publication-ready charts
- local agent activity logs
- local self-improvement log
- reusable generated Python scripts

## Features To Avoid Building Too Early

Do not start with:

- full collaboration system
- complete citation manager
- every possible statistical model
- advanced multi-dataset support
- perfect paper understanding
- full notebook replacement
- complex compliance infrastructure before the product is validated

These can come later once the core workflow proves useful.

## Product Principle

The user should always understand:

- what the software did
- why it did it
- what data was used
- what code was run
- what assumptions were checked
- what the result means
- what the limitations are

The product should reduce cognitive load without hiding the scientific process.

## Research and Validation Plan

### 1. Interview Researchers

Talk to:

- clinical researchers
- biomedical PhD students
- postdocs
- research coordinators
- biostatisticians
- psychology researchers
- social science researchers
- graduate students
- professors

Ask:

- What software do you use now?
- Where do you lose the most time?
- How do you decide what analysis to run?
- Which statistical tests confuse you?
- How do you move between papers, Excel, SPSS, R, Python, and Word?
- What makes you trust or distrust AI-generated analysis?
- What outputs do you need for manuscripts or presentations?
- What privacy constraints affect your data?

### 2. Study Existing Tools

Analyze:

- SPSS
- RStudio
- JASP
- Jamovi
- GraphPad Prism
- Stata
- Excel
- Python notebooks
- REDCap exports/workflows
- Elicit
- SciSpace
- Julius AI
- ChatGPT data analysis
- Notion/Obsidian research workflows

Look for the gap between paper understanding and data analysis. That gap is the product opportunity.

### 3. Map Statistical Workflows

Build decision trees for:

- outcome type
- predictor type
- number of groups
- paired vs independent samples
- repeated measures
- normality
- variance equality
- covariates
- confounders
- censoring/time-to-event outcomes
- sample size
- missing data
- study design

This decision tree becomes the backbone of the Stats Agent.

### 4. Design for Trust and Reproducibility

Plan early for:

- code visibility
- exportable reports
- audit logs
- rerunnable analyses
- versioned datasets
- transparent transformations
- citations for claims
- source-linked paper summaries
- human review checkpoints for high-stakes outputs

## Development Roadmap

### Phase 1: Research and Prototype

- interview target users
- define exact first user persona
- collect sample papers and datasets
- build dashboard mockups
- manually test the full workflow
- validate biomedical/clinical use cases first
- design prompt packs for each agent role
- design local CLI runner flow for Codex CLI and Claude CLI

### Phase 2: Browser-Based Local MVP

- build as a local browser web app first
- implement project workspace
- support PDF upload
- support CSV/Excel upload
- extract paper methods
- profile datasets
- build research question builder
- build basic analysis recommendation engine
- integrate Codex CLI and/or Claude CLI runner
- add isolated task workspaces for CLI runs
- run common biomedical analyses
- generate charts
- generate mini report
- add local logs for analysis runs and CLI runs

### Phase 3: Agent System

- add Planner Agent
- add Paper Agent
- add Data Agent
- add Stats Agent
- add Code Agent
- add Visualization Agent
- add Report Agent
- add Critic/Verification Agent
- add Memory Agent
- add self-learning rulebook
- add automatic user correction capture
- add automatic prompt pack updates
- add automatic reusable Python script generation
- add self-improvement log
- add rollback system for rulebook, prompts, scripts, and workflows
- add output provenance labels for every agent response
- add rule review/editing interface
- add project-level audit trail
- add per-agent activity logs
- add complete request trace view across agents

### Phase 4: Desktop Packaging

- wrap the browser app into a desktop application with Tauri if the browser workflow is working well
- keep the same core UI, backend, rulebook, logs, scripts, and CLI runner architecture
- package local app launch/startup more cleanly
- keep biomedical/clinical data local by default

### Phase 5: Advanced Research Assistant

- compare multiple papers
- support multi-dataset projects
- support advanced models
- support richer survival analysis
- support propensity score methods
- support longitudinal/mixed models
- add collaboration
- add citation/export integrations
- add compliance and privacy controls
- consider optional local/private deployments for sensitive institutions
- evaluate public/server deployment of Codex CLI and Claude CLI only after the local version is stable

## Possible Framework Direction

The first implementation should be a browser-based local web app. The user opens the dashboard in a browser, while the backend runs locally and has access to local files, Python, generated scripts, logs, and Codex/Claude CLI tools.

Recommended initial stack:

- frontend: Next.js or React-based dashboard running in the browser
- backend: Python FastAPI running locally
- AI runner: local Codex CLI and/or Claude CLI
- prompt system: versioned prompt packs per agent role
- database: SQLite for early local prototype, PostgreSQL later for heavier projects or lab/self-hosted use
- worker queue: RQ/Celery or a simpler local job runner during early MVP
- file storage: local project directories first, object storage later only for hosted or lab deployments
- vector database: pgvector with PostgreSQL later, or Chroma/FAISS for simple local retrieval during prototype
- analysis runtime: Python first, optional R later
- visualization: Plotly, matplotlib/seaborn exports, or a hybrid approach
- AI orchestration: custom local orchestrator that builds task packets and calls CLI agents
- desktop packaging later: Tauri, after the browser workflow is complete

The framework should support:

- large file uploads
- long-running analysis jobs
- project history
- reusable analysis artifacts
- secure data handling
- exportable reports
- local CLI execution
- prompt pack versioning
- rulebook versioning
- generated Python script libraries
- per-agent logs
- self-improvement logs
- rollback
- future desktop packaging
- future multi-user collaboration or lab deployment

Recommended local architecture:

```text
Browser UI
Next.js / React dashboard
        |
        v
Local FastAPI backend
        |
        +--> Project storage
        +--> Rulebook Engine
        +--> Prompt Pack Manager
        +--> AI CLI Runner
        +--> Python analysis runtime
        +--> Generated script library
        +--> Logs and rollback
        |
        v
Codex CLI / Claude CLI
```

Later desktop architecture:

```text
Tauri Desktop App
        |
        +--> same Next.js/React UI
        +--> same local FastAPI backend
        +--> same Python analysis runtime
        +--> same Codex/Claude CLI runner
        +--> same local rulebook, scripts, logs, and rollback system
```

## Local Workspace Layout

The local-first version should keep project data, prompt packs, generated scripts, logs, and rollback metadata in a clear workspace structure.

Suggested structure:

```text
research-workspace/
  projects/
    project_001/
      uploads/
        papers/
        datasets/
      summaries/
      outputs/
        analyses/
        charts/
        reports/
      task_workspaces/
        request_001/
        request_002/

  prompts/
    planner_agent/
      v1.md
    paper_agent/
      v1.md
    data_agent/
      v1.md
    stats_agent/
      v1.md
    code_agent/
      v1.md
    visualization_agent/
      v1.md
    report_agent/
      v1.md
    critic_agent/
      v1.md
    memory_agent/
      v1.md

  rulebook/
    current.json
    versions/

  scripts/
    analysis/
    generated/
    history/

  logs/
    agents/
      planner_agent.log
      paper_agent.log
      data_agent.log
      stats_agent.log
      code_agent.log
      visualization_agent.log
      report_agent.log
      critic_agent.log
      memory_agent.log
    self_improvement.log
    analysis_runs.log
    cli_runs.log
    request_traces.log

  rollback/
    changes/
    snapshots/
```

Each request-specific task workspace should contain only the context needed for that task:

```text
task_workspaces/request_089/
  prompt.md
  rules.json
  dataset_summary.json
  paper_summary.json
  inputs/
  outputs/
  cli_stdout.log
  cli_stderr.log
  result.json
```

This keeps local execution inspectable and limits how much data the CLI agent sees for each task.

## Initial Positioning

The product should be positioned as:

> An AI research analytics workspace for biomedical and clinical researchers that helps move from paper and dataset to valid analysis, visualization, and report faster, with traceable reasoning and reproducible output.

Broader positioning later:

> A research analytics workspace for biomedical, psychology, social science, and graduate researchers that connects literature, data, statistical analysis, visualization, and writing in one reproducible AI-assisted environment.
