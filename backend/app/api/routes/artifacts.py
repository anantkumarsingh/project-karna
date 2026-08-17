from app.api.routes._crud import make_crud_router
from app.models.artifact import Artifact
from app.schemas.artifact import ArtifactCreate, ArtifactRead, ArtifactUpdate

router = make_crud_router(
    model=Artifact,
    create_schema=ArtifactCreate,
    update_schema=ArtifactUpdate,
    read_schema=ArtifactRead,
    prefix="/artifacts",
    tags=["artifacts"],
    auto_timestamp_fields=("generated_at",),
    has_project_id=True,
)
