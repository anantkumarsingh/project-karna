from datetime import datetime

from app.schemas._base import CamelModel


class AnalysisBase(CamelModel):
    """All fields optional here so AnalysisUpdate can reuse this as-is for PATCH;
    AnalysisCreate re-declares the couple of fields that are actually required."""

    project_id: str | None = None
    research_question_id: str | None = None
    name: str | None = None
    type: str = "Untitled"
    status: str = "draft"
    agent: str = "—"
    script_used: str = "—"
    provenance: str = "—"
    favorite: bool = False

    interpretation: str | None = None
    code_used: str | None = None

    result_table: dict | None = None
    statistical_output: list | None = None
    assumptions_checked: list | None = None
    warnings: list | None = None
    reproducibility: dict | None = None
    export_formats: list | None = None


class AnalysisCreate(AnalysisBase):
    id: str
    name: str


class AnalysisUpdate(AnalysisBase):
    pass


class AnalysisRead(AnalysisBase):
    id: str
    run_at: datetime
