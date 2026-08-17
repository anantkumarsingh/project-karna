from app.api.routes._crud import make_crud_router
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportRead, ReportUpdate

router = make_crud_router(
    model=Report,
    create_schema=ReportCreate,
    update_schema=ReportUpdate,
    read_schema=ReportRead,
    prefix="/reports",
    tags=["reports"],
)
