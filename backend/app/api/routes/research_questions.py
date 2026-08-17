from app.api.routes._crud import make_crud_router
from app.models.research_question import ResearchQuestion
from app.schemas.research_question import (
    ResearchQuestionCreate,
    ResearchQuestionRead,
    ResearchQuestionUpdate,
)

router = make_crud_router(
    model=ResearchQuestion,
    create_schema=ResearchQuestionCreate,
    update_schema=ResearchQuestionUpdate,
    read_schema=ResearchQuestionRead,
    prefix="/research-questions",
    tags=["research_questions"],
    auto_timestamp_fields=("created_at",),
    has_project_id=True,
)
