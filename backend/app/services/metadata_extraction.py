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
# not a guess. Journal is deliberately NOT attempted: Subject inconsistently
# holds journal names across publishers and there's no reliable anchor
# pattern the way year/DOI have.
_DOI_PATTERN = re.compile(r"10\.\d{4,9}/[-._;()/:A-Za-z0-9]+")

# Year is anchored to these publication-adjacent keywords rather than a blind
# whole-page scan, to avoid picking up an arbitrary 4-digit number (e.g. from
# a reference list). A PDF's own CreationDate is NOT used for this — it
# reflects file creation, not publication date, which could be actively wrong.
_YEAR_KEYWORDS = ("©", "received", "accepted", "published")
_YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")
_YEAR_WINDOW = 60


def _looks_like_real_title(title: str) -> bool:
    """Real paper titles are always multi-word. A single unbroken token
    (e.g. an internal filename fragment like "rare_155_611.643_659.tp") is
    not a plausible title — reject rather than surface it as fact."""
    return " " in title.strip()


def _looks_like_real_author(author: str) -> bool:
    """Real author strings have spaces (initials/full names, "Chen, X.").
    A single token, or one containing "@" (looks like a username/email,
    e.g. "cbrown@sun10"), is not a plausible author — reject."""
    stripped = author.strip()
    return " " in stripped and "@" not in stripped


def _extract_year(text: str) -> int | None:
    lower = text.lower()
    for keyword in _YEAR_KEYWORDS:
        idx = lower.find(keyword)
        if idx == -1:
            continue
        window = text[max(0, idx - _YEAR_WINDOW) : idx + _YEAR_WINDOW]
        match = _YEAR_PATTERN.search(window)
        if match:
            return int(match.group(0))
    return None


def extract_pdf_metadata(data: bytes) -> dict:
    """Raises on an unreadable/corrupt PDF — callers should turn that into a
    400, not silently store a page_count of 0 that would look like a valid
    empty result later.

    title/authors/doi/year are best-effort from the PDF's own embedded
    metadata dictionary and a page-1 text scan — None when not found or when
    a candidate value fails a basic sanity check, never guessed or surfaced
    as garbage.
    """
    reader = PdfReader(io.BytesIO(data))
    info = reader.metadata

    title = (info.title or "").strip() if info else ""
    authors = (info.author or "").strip() if info else ""

    doi = None
    year = None
    if reader.pages:
        first_page_text = reader.pages[0].extract_text() or ""
        doi_match = _DOI_PATTERN.search(first_page_text)
        if doi_match:
            candidate = doi_match.group(0).rstrip(".,;)-")
            # A DOI ending in a bare hyphen (before stripping) is a strong
            # sign of a truncated match — likely a line-break split during
            # PDF text extraction. Don't surface a partial DOI as fact.
            if not doi_match.group(0).endswith("-"):
                doi = candidate
        year = _extract_year(first_page_text)

    return {
        "page_count": len(reader.pages),
        "title": title if title and _looks_like_real_title(title) else None,
        "authors": authors if authors and _looks_like_real_author(authors) else None,
        "doi": doi,
        "year": year,
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
