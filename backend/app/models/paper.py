from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Paper(Base):
    __tablename__ = "papers"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String, nullable=False)
    authors: Mapped[str] = mapped_column(String, nullable=False, default="")
    journal: Mapped[str] = mapped_column(String, nullable=False, default="")
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    doi: Mapped[str | None] = mapped_column(String, nullable=True)
    page_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    library_status: Mapped[str] = mapped_column(String, nullable=False, default="processing")
    extraction_completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    extraction_confidence: Mapped[str | None] = mapped_column(String, nullable=True)
    methods_page_ref: Mapped[str | None] = mapped_column(String, nullable=True)

    # B2: file storage (relative to research_workspace_dir; None for non-file
    # add-paths like DOI/PubMed) and the AI-exposure sensitivity tier chosen at
    # upload time. Enforcement of sensitivity_level happens starting B4/B5 once
    # agent prompt construction exists — not enforced by any code yet.
    storage_path: Mapped[str | None] = mapped_column(String, nullable=True)
    sensitivity_level: Mapped[str] = mapped_column(String, nullable=False, default="restricted")

    abstract: Mapped[str | None] = mapped_column(String, nullable=True)
    research_question: Mapped[str | None] = mapped_column(String, nullable=True)
    study_design: Mapped[str | None] = mapped_column(String, nullable=True)
    study_type: Mapped[str | None] = mapped_column(String, nullable=True)
    population: Mapped[str | None] = mapped_column(String, nullable=True)
    sample_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    follow_up_duration: Mapped[str | None] = mapped_column(String, nullable=True)
    primary_endpoint: Mapped[str | None] = mapped_column(String, nullable=True)
    primary_analysis: Mapped[str | None] = mapped_column(String, nullable=True)
    conclusions: Mapped[str | None] = mapped_column(String, nullable=True)

    dataset_connection_summary: Mapped[str | None] = mapped_column(String, nullable=True)
    replicability_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    variable_match_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    variable_missing_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Structured/nested content kept as JSON for now (Session 9, B1) — not yet
    # independently queried, so normalizing into child tables is deferred until
    # an agent (B5 Paper Agent) or a UI feature actually needs to filter on them.
    hypotheses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    inclusion_criteria: Mapped[list | None] = mapped_column(JSON, nullable=True)
    exclusion_criteria: Mapped[list | None] = mapped_column(JSON, nullable=True)
    secondary_endpoints: Mapped[list | None] = mapped_column(JSON, nullable=True)
    statistical_methods: Mapped[list | None] = mapped_column(JSON, nullable=True)
    software_used: Mapped[list | None] = mapped_column(JSON, nullable=True)
    key_findings: Mapped[list | None] = mapped_column(JSON, nullable=True)
    limitations: Mapped[list | None] = mapped_column(JSON, nullable=True)
    research_gaps: Mapped[list | None] = mapped_column(JSON, nullable=True)
    replicability_notes: Mapped[list | None] = mapped_column(JSON, nullable=True)

    variables: Mapped[list | None] = mapped_column(JSON, nullable=True)
    claims: Mapped[list | None] = mapped_column(JSON, nullable=True)
    concepts: Mapped[list | None] = mapped_column(JSON, nullable=True)
    replication_readiness: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    method_card: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    key_takeaways: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    agent_trace: Mapped[list | None] = mapped_column(JSON, nullable=True)
    suggested_questions: Mapped[list | None] = mapped_column(JSON, nullable=True)
