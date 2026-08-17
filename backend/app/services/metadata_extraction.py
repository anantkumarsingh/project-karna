"""Deterministic-only metadata extraction for uploaded files — page count for
PDFs, row/column/dtype counts for tabular files. No LLM/AI parsing here; that's
B5's job (real content extraction) once the agent system exists.

`sensitivity_level` is persisted on the Paper/Dataset row by the upload routes
but is not enforced anywhere in this module or elsewhere yet — no agent-prompt
construction exists to enforce it against. Enforcement (blocking `no_ai`,
restricting `restricted` to schema/aggregate-only) starts B4/B5.
"""
import io

import pandas as pd
from pypdf import PdfReader

SUPPORTED_TABULAR_EXTENSIONS = (".csv", ".xlsx", ".xls")


def extract_pdf_metadata(data: bytes) -> dict:
    """Raises on an unreadable/corrupt PDF — callers should turn that into a
    400, not silently store a page_count of 0 that would look like a valid
    empty result later."""
    reader = PdfReader(io.BytesIO(data))
    return {"page_count": len(reader.pages)}


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

    return {
        "rows": len(df),
        "columns": len(df.columns),
        "column_dtypes": {str(col): str(dtype) for col, dtype in df.dtypes.items()},
    }
