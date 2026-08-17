from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ResearchQuestion(Base):
    __tablename__ = "research_questions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    paper_id: Mapped[str] = mapped_column(ForeignKey("papers.id"), nullable=False, index=True)

    question: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="draft")
    question_type: Mapped[str | None] = mapped_column(String, nullable=True)

    population: Mapped[str | None] = mapped_column(String, nullable=True)
    dependent_variable: Mapped[str | None] = mapped_column(String, nullable=True)
    independent_variable: Mapped[str | None] = mapped_column(String, nullable=True)
    hypothesis: Mapped[str | None] = mapped_column(String, nullable=True)
    endpoint: Mapped[str | None] = mapped_column(String, nullable=True)
    statistical_family: Mapped[str | None] = mapped_column(String, nullable=True)
    primary_analysis: Mapped[str | None] = mapped_column(String, nullable=True)
    null_hypothesis: Mapped[str | None] = mapped_column(String, nullable=True)
    alternative_hypothesis: Mapped[str | None] = mapped_column(String, nullable=True)
    expected_direction: Mapped[str | None] = mapped_column(String, nullable=True)
    gap_source: Mapped[str | None] = mapped_column(String, nullable=True)

    # Structured/nested content kept as JSON for now (Session 9, B1) — same
    # reasoning as paper.py/dataset.py; RecommendedQuestion generation itself is
    # deferred to B6 (Stats/Planner Agent), not modeled as its own table yet.
    covariates: Mapped[list | None] = mapped_column(JSON, nullable=True)
    alternative_analyses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    assumptions_to_check: Mapped[list | None] = mapped_column(JSON, nullable=True)
    feasibility: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    evidence_map: Mapped[list | None] = mapped_column(JSON, nullable=True)
    limitations: Mapped[list | None] = mapped_column(JSON, nullable=True)
    related_concepts: Mapped[list | None] = mapped_column(JSON, nullable=True)
    suggested_papers: Mapped[list | None] = mapped_column(JSON, nullable=True)
    versions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    agent_trace: Mapped[list | None] = mapped_column(JSON, nullable=True)
    linked_analysis_ids: Mapped[list | None] = mapped_column(JSON, nullable=True)
