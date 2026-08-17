from datetime import datetime

from app.schemas._base import CamelModel


class ProjectBase(CamelModel):
    name: str
    description: str = ""
    domain: str = ""
    status: str = "active"
    focused_question_id: str | None = None


class ProjectCreate(ProjectBase):
    id: str


class ProjectUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    domain: str | None = None
    status: str | None = None
    focused_question_id: str | None = None


class ProjectRead(ProjectBase):
    id: str
    created_at: datetime
    last_activity: datetime
