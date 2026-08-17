from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)

    filename: Mapped[str] = mapped_column(String, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    library_status: Mapped[str] = mapped_column(String, nullable=False, default="uploaded")
    version: Mapped[str] = mapped_column(String, nullable=False, default="v1 — raw")
    derived_from: Mapped[str | None] = mapped_column(String, nullable=True)
    rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    columns: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    file_size_kb: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    patients: Mapped[int | None] = mapped_column(Integer, nullable=True)
    timepoints: Mapped[int | None] = mapped_column(Integer, nullable=True)

    summary: Mapped[str | None] = mapped_column(String, nullable=True)
    structure_type: Mapped[str | None] = mapped_column(String, nullable=True)
    structure_notes: Mapped[str | None] = mapped_column(String, nullable=True)

    total_missing_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    duplicate_rows: Mapped[int | None] = mapped_column(Integer, nullable=True)
    data_quality_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    analysis_readiness_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    missingness_risk: Mapped[str | None] = mapped_column(String, nullable=True)
    variable_mapping_progress: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Structured/nested content kept as JSON for now (Session 9, B1) — see paper.py
    # for the same reasoning; revisit if/when B5's Data Agent needs to query into these.
    variables: Mapped[list | None] = mapped_column(JSON, nullable=True)
    quality_checks: Mapped[list | None] = mapped_column(JSON, nullable=True)
    group_balance: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    group_balance_checks: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    correlations: Mapped[list | None] = mapped_column(JSON, nullable=True)
    cleaning_steps: Mapped[list | None] = mapped_column(JSON, nullable=True)
    analysis_readiness: Mapped[list | None] = mapped_column(JSON, nullable=True)
    paper_alignment: Mapped[list | None] = mapped_column(JSON, nullable=True)
    suggested_questions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    agent_trace: Mapped[list | None] = mapped_column(JSON, nullable=True)
