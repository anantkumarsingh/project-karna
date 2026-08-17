"""Seeds karna.db with data equivalent to the frontend's dummy-*.ts files.

Source of truth for this data is the frontend TypeScript (frontend/dump_dummy_data.mts
dumps it to seed_data.json via Node's native TS support — re-run that first if the
dummy data has changed). This script only converts + loads it into the real DB.
"""

import json
import re
from datetime import UTC, datetime
from pathlib import Path

from app.db.session import SessionLocal
from app.models import Analysis, Artifact, Dataset, Paper, Project, Report, ResearchQuestion, RulebookEntry

SEED_PATH = Path(__file__).resolve().parent / "seed_data.json"

_CAMEL_RE = re.compile(r"(?<!^)(?=[A-Z])")

DATETIME_FIELDS = {
    "created_at",
    "last_activity",
    "uploaded_at",
    "extraction_completed_at",
    "run_at",
    "generated_at",
}


def to_snake(key: str) -> str:
    return _CAMEL_RE.sub("_", key).lower()


def parse_dt(value):
    if value is None or isinstance(value, datetime):
        return value
    v = value.replace("Z", "+00:00") if value.endswith("Z") else value
    try:
        return datetime.fromisoformat(v)
    except ValueError:
        return datetime.fromisoformat(v + "T00:00:00")


def snake_row(obj: dict, model) -> dict:
    """Converts a camelCase JSON object into kwargs for the given model,
    dropping any keys that aren't real columns (e.g. Project.researchQuestionIds,
    which is derived via the reverse FK rather than stored)."""
    columns = set(model.__table__.columns.keys())
    out = {}
    for key, value in obj.items():
        snake_key = to_snake(key)
        if snake_key not in columns:
            continue
        if snake_key in DATETIME_FIELDS and value is not None:
            value = parse_dt(value)
        out[snake_key] = value
    return out


def seed() -> None:
    with open(SEED_PATH) as f:
        data = json.load(f)

    db = SessionLocal()
    try:
        for row in data["projects"]:
            db.merge(Project(**snake_row(row, Project)))
        for row in data["papers"]:
            db.merge(Paper(**snake_row(row, Paper)))
        for row in data["datasets"]:
            db.merge(Dataset(**snake_row(row, Dataset)))
        for row in data["researchQuestions"]:
            db.merge(ResearchQuestion(**snake_row(row, ResearchQuestion)))
        for row in data["analyses"]:
            db.merge(Analysis(**snake_row(row, Analysis)))

        # Artifact.project_id has no equivalent field in the frontend's Artifact
        # type (it's scoped via paperId there) — derive it from each artifact's
        # paper instead of expecting it in the JSON dump.
        project_id_by_paper = {p["id"]: p["projectId"] for p in data["papers"]}
        for row in data["artifacts"]:
            artifact_data = snake_row(row, Artifact)
            artifact_data["project_id"] = project_id_by_paper[row["paperId"]]
            db.merge(Artifact(**artifact_data))

        checks_by_question: dict[str, list] = {}
        for check in data["validationChecks"]:
            checks_by_question.setdefault(check["questionId"], []).append(check)
        for row in data["questionReports"]:
            report_data = snake_row(row, Report)
            report_data["validation_checks"] = checks_by_question.get(row["questionId"], [])
            db.merge(Report(**report_data))

        for row in data["rulebookEntries"]:
            entry_data = snake_row(row, RulebookEntry)
            entry_data.setdefault("created_at", datetime.now(UTC).replace(tzinfo=None))
            db.merge(RulebookEntry(**entry_data))

        db.commit()
        counts = {name: db.query(model).count() for name, model in [
            ("projects", Project), ("papers", Paper), ("datasets", Dataset),
            ("research_questions", ResearchQuestion), ("analyses", Analysis),
            ("artifacts", Artifact), ("reports", Report), ("rulebook_entries", RulebookEntry),
        ]}
        print("Seed complete:", counts)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
