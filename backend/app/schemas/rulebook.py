from datetime import datetime

from app.schemas._base import CamelModel


class RulebookEntryBase(CamelModel):
    project_id: str | None = None
    scope: str = "project"
    text: str | None = None
    confidence: str = "medium"
    source: str = ""


class RulebookEntryCreate(RulebookEntryBase):
    id: str
    project_id: str
    text: str


class RulebookEntryUpdate(RulebookEntryBase):
    pass


class RulebookEntryRead(RulebookEntryBase):
    id: str
    created_at: datetime
