from app.api.routes._crud import make_crud_router
from app.models.paper import Paper
from app.schemas.paper import PaperCreate, PaperRead, PaperUpdate

router = make_crud_router(
    model=Paper,
    create_schema=PaperCreate,
    update_schema=PaperUpdate,
    read_schema=PaperRead,
    prefix="/papers",
    tags=["papers"],
    auto_timestamp_fields=("uploaded_at",),
    has_project_id=True,
)
