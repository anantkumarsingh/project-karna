"""Deterministic-only metadata extraction for uploaded files — page count for
PDFs, row/column/dtype counts for tabular files. No LLM/AI parsing here; that's
B5's job (real content extraction) once the agent system exists.

`sensitivity_level` is persisted on the Paper/Dataset row by the upload routes
but is not enforced anywhere in this module or elsewhere yet — no agent-prompt
construction exists to enforce it against. Enforcement (blocking `no_ai`,
restricting `restricted` to schema/aggregate-only) starts B4/B5.
"""
import io
import re

import pandas as pd
from pypdf import PdfReader

from app.services.dataset_profiling import profile_dataset

SUPPORTED_TABULAR_EXTENSIONS = (".csv", ".xlsx", ".xls")

# DOIs have a fixed, well-defined format — a reliable deterministic match,
# not a guess. Deliberately NOT attempting year/journal here: a PDF's
# CreationDate reflects file creation, not publication date, and Subject
# inconsistently holds journal names across publishers — using either would
# present an unreliable guess as fact.
_DOI_PATTERN = re.compile(r"10\.\d{4,9}/[-._;()/:A-Za-z0-9]+")


def extract_pdf_metadata(data: bytes) -> dict:
    """Raises on an unreadable/corrupt PDF — callers should turn that into a
    400, not silently store a page_count of 0 that would look like a valid
    empty result later.

    title/authors/doi are best-effort from the PDF's own embedded metadata
    dictionary and a page-1 text scan — None when not found, never guessed.
    """
    reader = PdfReader(io.BytesIO(data))
    info = reader.metadata

    title = (info.title or "").strip() if info else ""
    authors = (info.author or "").strip() if info else ""

    doi = None
    if reader.pages:
        first_page_text = reader.pages[0].extract_text() or ""
        match = _DOI_PATTERN.search(first_page_text)
        if match:
            doi = match.group(0).rstrip(".,;)")

    return {
        "page_count": len(reader.pages),
        "title": title or None,
        "authors": authors or None,
        "doi": doi,
    }


def extract_tabular_metadata(data: bytes, filename: str) -> dict:
    """Raises ValueError on an unsupported extension or unparseable file —
    callers should turn that into a 400."""
    lower = filename.lower()
    if lower.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(data))
    elif lower.endswith(".xlsx") or lower.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(data))
    else:
        raise ValueError(
            f"Unsupported file type for {filename!r} — only CSV/Excel are supported in this phase"
        )

    metadata = {
        "rows": len(df),
        "columns": len(df.columns),
        "column_dtypes": {str(col): str(dtype) for col, dtype in df.dtypes.items()},
    }
    metadata.update(profile_dataset(df))
    return metadata
