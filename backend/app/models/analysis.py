from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    # Fallback project scope for drafts not yet linked to a research question
    # (mirrors the frontend's ExecutedAnalysis.projectId fallback field).
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True, index=True)
    research_question_id: Mapped[str | None] = mapped_column(ForeignKey("research_questions.id"), nullable=True, index=True)

    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False, default="Untitled")
    status: Mapped[str] = mapped_column(String, nullable=False, default="draft")
    run_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    agent: Mapped[str] = mapped_column(String, nullable=False, default="—")
    script_used: Mapped[str] = mapped_column(String, nullable=False, default="—")
    provenance: Mapped[str] = mapped_column(String, nullable=False, default="—")
    favorite: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    interpretation: Mapped[str | None] = mapped_column(String, nullable=True)
    code_used: Mapped[str | None] = mapped_column(String, nullable=True)

    # Structured/nested content kept as JSON for now (Session 9, B1) — becomes
    # real deterministic output once B3 wires up actual execution.
    result_table: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    statistical_output: Mapped[list | None] = mapped_column(JSON, nullable=True)
    assumptions_checked: Mapped[list | None] = mapped_column(JSON, nullable=True)
    warnings: Mapped[list | None] = mapped_column(JSON, nullable=True)
    reproducibility: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    export_formats: Mapped[list | None] = mapped_column(JSON, nullable=True)
