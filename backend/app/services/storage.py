"""Encrypted file storage under research-workspace/projects/<id>/uploads/.
Paths are stored in the DB relative to research_workspace_dir so the workspace
folder stays portable if it's ever moved.
"""
import os
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from app.core.config import settings
from app.services.encryption import decrypt_bytes, encrypt_bytes


def _upload_path(project_id: str, kind: str, entity_id: str, original_filename: str) -> Path:
    path = (
        settings.research_workspace_dir
        / "projects"
        / project_id
        / "uploads"
        / kind
        / f"{entity_id}_{original_filename}.enc"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def paper_upload_path(project_id: str, paper_id: str, original_filename: str) -> Path:
    return _upload_path(project_id, "papers", paper_id, original_filename)


def dataset_upload_path(project_id: str, dataset_id: str, original_filename: str) -> Path:
    return _upload_path(project_id, "datasets", dataset_id, original_filename)


def save_encrypted(path: Path, plaintext: bytes) -> None:
    path.write_bytes(encrypt_bytes(plaintext))


def to_relative(path: Path) -> str:
    return str(path.relative_to(settings.research_workspace_dir))


def to_absolute(rel_path: str) -> Path:
    return settings.research_workspace_dir / rel_path


@contextmanager
def decrypted_tempfile(storage_path_rel: str) -> Iterator[Path]:
    """Decrypt a stored file into a short-lived temp file for the duration of
    an operation (e.g. B3 running analysis code, B5 reading paper/dataset
    content). Plaintext is deleted the moment the caller is done with it —
    nothing in B2 itself calls this besides its own verification step, but
    B3/B5 need this exact shape, so it's built once here rather than
    duplicated later.
    """
    absolute = to_absolute(storage_path_rel)
    plaintext = decrypt_bytes(absolute.read_bytes())

    original_name = Path(storage_path_rel).stem  # strips only the trailing .enc
    suffix = Path(original_name).suffix  # e.g. ".pdf" or ".csv"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        tmp.write(plaintext)
        tmp.close()
        yield Path(tmp.name)
    finally:
        os.unlink(tmp.name)
