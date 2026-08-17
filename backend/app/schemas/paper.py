from datetime import datetime
from typing import Literal

from app.schemas._base import CamelModel


class PaperBase(CamelModel):
    """All fields optional here so PaperUpdate can reuse this as-is for PATCH;
    PaperCreate re-declares the couple of fields that are actually required."""

    project_id: str | None = None
    title: str | None = None
    authors: str = ""
    journal: str = ""
    year: int | None = None
    doi: str | None = None
    page_count: int = 0
    status: str = "pending"
    library_status: str = "processing"
    extraction_confidence: str | None = None
    methods_page_ref: str | None = None
    storage_path: str | None = None
    sensitivity_level: Literal["public", "restricted", "no_ai"] = "restricted"
    content_hash: str | None = None

    abstract: str | None = None
    research_question: str | None = None
    study_design: str | None = None
    study_type: str | None = None
    population: str | None = None
    sample_size: int | None = None
    follow_up_duration: str | None = None
    primary_endpoint: str | None = None
    primary_analysis: str | None = None
    conclusions: str | None = None

    dataset_connection_summary: str | None = None
    replicability_score: int | None = None
    variable_match_count: int | None = None
    variable_missing_count: int | None = None

    hypotheses: list | None = None
    inclusion_criteria: list | None = None
    exclusion_criteria: list | None = None
    secondary_endpoints: list | None = None
    statistical_methods: list | None = None
    software_used: list | None = None
    key_findings: list | None = None
    limitations: list | None = None
    research_gaps: list | None = None
    replicability_notes: list | None = None

    variables: list | None = None
    claims: list | None = None
    concepts: list | None = None
    replication_readiness: dict | None = None
    method_card: dict | None = None
    key_takeaways: dict | None = None
    agent_trace: list | None = None
    suggested_questions: list | None = None


class PaperCreate(PaperBase):
    id: str
    project_id: str
    title: str


class PaperUpdate(PaperBase):
    pass


class PaperRead(PaperBase):
    id: str
    uploaded_at: datetime
    extraction_completed_at: datetime | None = None


class PaperDependents(CamelModel):
    research_question_count: int
    artifact_count: int
    report_count: int
    analysis_count: int
