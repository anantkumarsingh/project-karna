from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Report(Base):
    __tablename__ = "reports"

    # One report per research question (mirrors the frontend's QuestionReportData,
    # which is keyed 1:1 by questionId) — the question's own id doubles as this row's id.
    question_id: Mapped[str] = mapped_column(ForeignKey("research_questions.id"), primary_key=True)
    # Nullable (Session 11 cont.) — a deleted paper nulls this out rather than
    # deleting the report, so it becomes independent instead of dangling.
    paper_id: Mapped[str | None] = mapped_column(ForeignKey("papers.id"), nullable=True, index=True)

    status: Mapped[str] = mapped_column(String, nullable=False, default="not_started")

    # Structured/nested content kept as JSON for now (Session 9, B1) — sections
    # (with their nested claims) and validation checks are display/traceability
    # data, not independently queried yet; see paper.py for the same reasoning.
    included: Mapped[list | None] = mapped_column(JSON, nullable=True)
    missing: Mapped[list | None] = mapped_column(JSON, nullable=True)
    sections: Mapped[list | None] = mapped_column(JSON, nullable=True)
    validation_checks: Mapped[list | None] = mapped_column(JSON, nullable=True)
