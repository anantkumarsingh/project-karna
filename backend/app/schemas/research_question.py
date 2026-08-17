from datetime import datetime

from app.schemas._base import CamelModel


class ResearchQuestionBase(CamelModel):
    """All fields optional here so ResearchQuestionUpdate can reuse this as-is for
    PATCH; ResearchQuestionCreate re-declares the fields that are actually required."""

    project_id: str | None = None
    paper_id: str | None = None
    question: str | None = None
    status: str = "draft"
    question_type: str | None = None

    population: str | None = None
    dependent_variable: str | None = None
    independent_variable: str | None = None
    hypothesis: str | None = None
    endpoint: str | None = None
    statistical_family: str | None = None
    primary_analysis: str | None = None
    null_hypothesis: str | None = None
    alternative_hypothesis: str | None = None
    expected_direction: str | None = None
    gap_source: str | None = None

    covariates: list | None = None
    alternative_analyses: list | None = None
    assumptions_to_check: list | None = None
    feasibility: dict | None = None
    evidence_map: list | None = None
    limitations: list | None = None
    related_concepts: list | None = None
    suggested_papers: list | None = None
    versions: list | None = None
    agent_trace: list | None = None
    linked_analysis_ids: list | None = None


class ResearchQuestionCreate(ResearchQuestionBase):
    id: str
    project_id: str
    paper_id: str
    question: str


class ResearchQuestionUpdate(ResearchQuestionBase):
    pass


class ResearchQuestionRead(ResearchQuestionBase):
    id: str
    created_at: datetime
