from app.api.routes._crud import make_crud_router
from app.models.rulebook import RulebookEntry
from app.schemas.rulebook import (
    RulebookEntryCreate,
    RulebookEntryRead,
    RulebookEntryUpdate,
)

router = make_crud_router(
    model=RulebookEntry,
    create_schema=RulebookEntryCreate,
    update_schema=RulebookEntryUpdate,
    read_schema=RulebookEntryRead,
    prefix="/rulebook-entries",
    tags=["rulebook"],
    auto_timestamp_fields=("created_at",),
    has_project_id=True,
)
