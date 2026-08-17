from datetime import datetime

from app.schemas._base import CamelModel


class DatasetBase(CamelModel):
    """All fields optional here so DatasetUpdate can reuse this as-is for PATCH;
    DatasetCreate re-declares the couple of fields that are actually required."""

    project_id: str | None = None
    filename: str | None = None
    status: str = "pending"
    library_status: str = "uploaded"
    version: str = "v1 — raw"
    derived_from: str | None = None
    rows: int = 0
    columns: int = 0
    file_size_kb: int = 0
    patients: int | None = None
    timepoints: int | None = None

    summary: str | None = None
    structure_type: str | None = None
    structure_notes: str | None = None

    total_missing_percent: float | None = None
    duplicate_rows: int | None = None
    data_quality_score: int | None = None
    analysis_readiness_score: int | None = None
    missingness_risk: str | None = None
    variable_mapping_progress: int | None = None

    variables: list | None = None
    quality_checks: list | None = None
    group_balance: dict | None = None
    group_balance_checks: dict | None = None
    correlations: list | None = None
    cleaning_steps: list | None = None
    analysis_readiness: list | None = None
    paper_alignment: list | None = None
    suggested_questions: list | None = None
    agent_trace: list | None = None


class DatasetCreate(DatasetBase):
    id: str
    project_id: str
    filename: str


class DatasetUpdate(DatasetBase):
    pass


class DatasetRead(DatasetBase):
    id: str
    uploaded_at: datetime
