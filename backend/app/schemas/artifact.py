from datetime import datetime

from app.schemas._base import CamelModel


class ArtifactBase(CamelModel):
    """All fields optional here so ArtifactUpdate can reuse this as-is for PATCH;
    ArtifactCreate re-declares the fields that are actually required."""

    project_id: str | None = None
    paper_id: str | None = None
    question_id: str | None = None
    analysis_id: str | None = None
    title: str | None = None
    kind: str | None = None
    chart_type: str | None = None
    status: str = "draft"
    outdated_reason: str | None = None
    caption: str | None = None

    used_variables: list | None = None
    export_formats: list | None = None
    figure_config: dict | None = None
    table_config: dict | None = None
    km_preview: list | None = None
    forest_preview: list | None = None
    result_columns: list | None = None
    result_rows: list | None = None


class ArtifactCreate(ArtifactBase):
    id: str
    project_id: str
    paper_id: str
    question_id: str
    title: str
    kind: str
    chart_type: str


class ArtifactUpdate(ArtifactBase):
    pass


class ArtifactRead(ArtifactBase):
    id: str
    generated_at: datetime
