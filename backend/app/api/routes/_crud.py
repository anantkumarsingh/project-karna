from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Query as SAQuery
from sqlalchemy.orm import Session

from app.db.session import get_db


def make_crud_router(
    *,
    model: type,
    create_schema: type[BaseModel],
    update_schema: type[BaseModel],
    read_schema: type[BaseModel],
    prefix: str,
    tags: list[str],
    auto_timestamp_fields: tuple[str, ...] = (),
    touch_on_update_fields: tuple[str, ...] = (),
    has_project_id: bool = False,
    project_filter: Callable[[Session, SAQuery, str], SAQuery] | None = None,
) -> APIRouter:
    """Builds the standard list/get/create/update/delete endpoints for one entity.

    All eight B1 entities need identical CRUD shape — the only real differences
    are which model/schemas to use and which columns need server-side timestamps
    or a project_id filter — so this factory covers all of them instead of
    repeating near-identical route functions eight times.

    `project_filter` overrides the default `model.project_id == project_id`
    match — needed for entities like Analysis, where most rows only carry a
    research_question_id (project_id is a fallback-only column), so scoping by
    project has to join through the linked research question instead.
    """
    router = APIRouter(prefix=prefix, tags=tags)

    def _get_or_404(db: Session, item_id: str) -> Any:
        item = db.get(model, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail=f"{model.__name__} '{item_id}' not found")
        return item

    if has_project_id or project_filter:

        @router.get("/", response_model=list[read_schema])
        def list_items(project_id: str | None = Query(default=None, alias="projectId"), db: Session = Depends(get_db)):
            query = db.query(model)
            if project_id is not None:
                query = project_filter(db, query, project_id) if project_filter else query.filter(model.project_id == project_id)
            return query.all()
    else:

        @router.get("/", response_model=list[read_schema])
        def list_items(db: Session = Depends(get_db)):
            return db.query(model).all()

    @router.get("/{item_id}", response_model=read_schema)
    def get_item(item_id: str, db: Session = Depends(get_db)):
        return _get_or_404(db, item_id)

    @router.post("/", response_model=read_schema, status_code=201)
    def create_item(payload: create_schema, db: Session = Depends(get_db)):
        data = payload.model_dump()
        now = datetime.now(UTC).replace(tzinfo=None)
        for field in auto_timestamp_fields:
            data[field] = now
        item = model(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @router.patch("/{item_id}", response_model=read_schema)
    def update_item(item_id: str, payload: update_schema, db: Session = Depends(get_db)):
        item = _get_or_404(db, item_id)
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(item, key, value)
        for field in touch_on_update_fields:
            setattr(item, field, datetime.now(UTC).replace(tzinfo=None))
        db.commit()
        db.refresh(item)
        return item

    @router.delete("/{item_id}", status_code=204)
    def delete_item(item_id: str, db: Session = Depends(get_db)):
        item = _get_or_404(db, item_id)
        db.delete(item)
        db.commit()
        return None

    return router
