from sqlalchemy import or_

from app.api.routes._crud import make_crud_router
from app.models.analysis import Analysis
from app.models.research_question import ResearchQuestion
from app.schemas.analysis import AnalysisCreate, AnalysisRead, AnalysisUpdate


def _project_filter(db, query, project_id: str):
    """Most analyses only carry a research_question_id (project_id is a
    fallback for drafts not yet linked to a question) — so scoping by project
    means matching either the direct project_id, or via the linked question."""
    rq_ids = [row[0] for row in db.query(ResearchQuestion.id).filter(ResearchQuestion.project_id == project_id)]
    return query.filter(or_(Analysis.project_id == project_id, Analysis.research_question_id.in_(rq_ids)))


router = make_crud_router(
    model=Analysis,
    create_schema=AnalysisCreate,
    update_schema=AnalysisUpdate,
    read_schema=AnalysisRead,
    prefix="/analyses",
    tags=["analyses"],
    auto_timestamp_fields=("run_at",),
    project_filter=_project_filter,
)
