from app.api.routes._crud import make_crud_router
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

router = make_crud_router(
    model=Project,
    create_schema=ProjectCreate,
    update_schema=ProjectUpdate,
    read_schema=ProjectRead,
    prefix="/projects",
    tags=["projects"],
    auto_timestamp_fields=("created_at", "last_activity"),
    touch_on_update_fields=("last_activity",),
)
