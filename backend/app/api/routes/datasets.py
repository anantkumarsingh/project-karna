from app.api.routes._crud import make_crud_router
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetCreate, DatasetRead, DatasetUpdate

router = make_crud_router(
    model=Dataset,
    create_schema=DatasetCreate,
    update_schema=DatasetUpdate,
    read_schema=DatasetRead,
    prefix="/datasets",
    tags=["datasets"],
    auto_timestamp_fields=("uploaded_at",),
    has_project_id=True,
)
