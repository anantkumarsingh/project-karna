from app.schemas._base import CamelModel


class ReportBase(CamelModel):
    paper_id: str | None = None
    status: str = "not_started"
    included: list | None = None
    missing: list | None = None
    sections: list | None = None
    validation_checks: list | None = None


class ReportCreate(ReportBase):
    question_id: str
    paper_id: str


class ReportUpdate(ReportBase):
    pass


class ReportRead(ReportBase):
    question_id: str
