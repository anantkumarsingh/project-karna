from datetime import UTC, datetime
from uuid import uuid4

from fastapi import Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.routes._crud import make_crud_router
from app.db.session import get_db
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetCreate, DatasetRead, DatasetUpdate
from app.services.metadata_extraction import extract_tabular_metadata
from app.services.storage import dataset_upload_path, save_encrypted, to_relative

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

_SENSITIVITY_LEVELS = ("public", "restricted", "no_ai")


@router.post("/upload", response_model=DatasetRead, status_code=201)
async def upload_dataset(
    project_id: str = Form(..., alias="projectId"),
    sensitivity_level: str = Form("restricted", alias="sensitivityLevel"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if sensitivity_level not in _SENSITIVITY_LEVELS:
        raise HTTPException(status_code=400, detail=f"sensitivityLevel must be one of {_SENSITIVITY_LEVELS}")

    data = await file.read()
    filename = file.filename or "upload.csv"
    try:
        metadata = extract_tabular_metadata(data, filename)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read file: {exc}") from exc

    dataset_id = f"dataset_{uuid4().hex[:8]}"
    path = dataset_upload_path(project_id, dataset_id, filename)
    save_encrypted(path, data)

    item = Dataset(
        id=dataset_id,
        project_id=project_id,
        filename=filename,
        rows=metadata["rows"],
        columns=metadata["columns"],
        column_dtypes=metadata["column_dtypes"],
        file_size_kb=len(data) // 1024,
        storage_path=to_relative(path),
        sensitivity_level=sensitivity_level,
        uploaded_at=datetime.now(UTC).replace(tzinfo=None),
        status="profiled",
        library_status="profiled",
        total_missing_percent=metadata["total_missing_percent"],
        duplicate_rows=metadata["duplicate_rows"],
        missingness_risk=metadata["missingness_risk"],
        data_quality_score=metadata["data_quality_score"],
        variables=metadata["variables"],
        quality_checks=metadata["quality_checks"],
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
