from fastapi import APIRouter

from app.api.routes.analyses import router as analyses_router
from app.api.routes.artifacts import router as artifacts_router
from app.api.routes.datasets import router as datasets_router
from app.api.routes.papers import router as papers_router
from app.api.routes.projects import router as projects_router
from app.api.routes.reports import router as reports_router
from app.api.routes.research_questions import router as research_questions_router
from app.api.routes.rulebook import router as rulebook_router

api_router = APIRouter()
api_router.include_router(projects_router)
api_router.include_router(papers_router)
api_router.include_router(datasets_router)
api_router.include_router(research_questions_router)
api_router.include_router(analyses_router)
api_router.include_router(artifacts_router)
api_router.include_router(reports_router)
api_router.include_router(rulebook_router)
