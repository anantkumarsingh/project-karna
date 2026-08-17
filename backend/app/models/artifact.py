from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Artifact(Base):
    __tablename__ = "artifacts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    # Direct column (not derived via paper_id/question_id) so it can be filtered
    # on the same way every other entity is — added Session 9 cont., replacing
    # an earlier client-side join-by-paperId approach used on the Dashboard.
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    paper_id: Mapped[str] = mapped_column(ForeignKey("papers.id"), nullable=False, index=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("research_questions.id"), nullable=False, index=True)
    analysis_id: Mapped[str | None] = mapped_column(ForeignKey("analyses.id"), nullable=True, index=True)

    title: Mapped[str] = mapped_column(String, nullable=False)
    kind: Mapped[str] = mapped_column(String, nullable=False)  # figure | table
    chart_type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="draft")
    generated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    outdated_reason: Mapped[str | None] = mapped_column(String, nullable=True)
    caption: Mapped[str | None] = mapped_column(String, nullable=True)

    # Structured/nested content kept as JSON for now (Session 9, B1) — see
    # paper.py for the same reasoning. SuggestedVisualization/ArtifactComparison
    # are generated/ephemeral content, not modeled as tables yet (deferred to B7).
    used_variables: Mapped[list | None] = mapped_column(JSON, nullable=True)
    export_formats: Mapped[list | None] = mapped_column(JSON, nullable=True)
    figure_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    table_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    km_preview: Mapped[list | None] = mapped_column(JSON, nullable=True)
    forest_preview: Mapped[list | None] = mapped_column(JSON, nullable=True)
    result_columns: Mapped[list | None] = mapped_column(JSON, nullable=True)
    result_rows: Mapped[list | None] = mapped_column(JSON, nullable=True)
