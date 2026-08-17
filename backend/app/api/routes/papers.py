from datetime import UTC, datetime
from uuid import uuid4

from fastapi import Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.routes._crud import make_crud_router
from app.db.session import get_db
from app.models.paper import Paper
from app.schemas.paper import PaperCreate, PaperRead, PaperUpdate
from app.services.metadata_extraction import extract_pdf_metadata
from app.services.storage import compute_content_hash, paper_upload_path, save_encrypted, to_relative

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

_SENSITIVITY_LEVELS = ("public", "restricted", "no_ai")


@router.post("/upload", response_model=PaperRead, status_code=201)
async def upload_paper(
    project_id: str = Form(..., alias="projectId"),
    sensitivity_level: str = Form("restricted", alias="sensitivityLevel"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if sensitivity_level not in _SENSITIVITY_LEVELS:
        raise HTTPException(status_code=400, detail=f"sensitivityLevel must be one of {_SENSITIVITY_LEVELS}")

    data = await file.read()

    content_hash = compute_content_hash(data)
    existing = db.query(Paper).filter(Paper.project_id == project_id, Paper.content_hash == content_hash).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"This file was already uploaded as '{existing.title or existing.id}' (uploaded {existing.uploaded_at:%Y-%m-%d}).",
        )

    try:
        metadata = extract_pdf_metadata(data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {exc}") from exc

    paper_id = f"paper_{uuid4().hex[:8]}"
    path = paper_upload_path(project_id, paper_id, file.filename or "upload.pdf")
    save_encrypted(path, data)

    found_metadata = bool(metadata.get("title") or metadata.get("authors") or metadata.get("doi") or metadata.get("year"))
    now = datetime.now(UTC).replace(tzinfo=None)

    item = Paper(
        id=paper_id,
        project_id=project_id,
        title=metadata.get("title") or file.filename or "Untitled paper",
        authors=metadata.get("authors") or "",
        doi=metadata.get("doi"),
        year=metadata.get("year"),
        page_count=metadata["page_count"],
        storage_path=to_relative(path),
        sensitivity_level=sensitivity_level,
        content_hash=content_hash,
        uploaded_at=now,
        status="processing",
        library_status="needs_review" if found_metadata else "processing",
        extraction_confidence="low" if found_metadata else None,
        extraction_completed_at=now if found_metadata else None,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
