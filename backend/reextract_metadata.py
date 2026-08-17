"""Re-runs deterministic metadata extraction against already-uploaded files.

Standalone, idempotent, rerunnable admin script (same pattern as seed.py) —
not a permanent API endpoint, since nothing else calls this yet. Useful any
time extract_pdf_metadata/extract_tabular_metadata gain new fields and
existing uploads should be backfilled, not just future ones.

Usage: uv run python reextract_metadata.py
"""
from datetime import UTC, datetime

from app.db.session import SessionLocal
from app.models import Dataset, Paper
from app.services.metadata_extraction import extract_pdf_metadata, extract_tabular_metadata
from app.services.storage import decrypted_tempfile


def reextract_papers(db) -> int:
    updated = 0
    for paper in db.query(Paper).filter(Paper.storage_path.isnot(None)).all():
        with decrypted_tempfile(paper.storage_path) as path:
            metadata = extract_pdf_metadata(path.read_bytes())

        found_metadata = bool(metadata.get("title") or metadata.get("authors") or metadata.get("doi"))
        if metadata.get("title"):
            paper.title = metadata["title"]
        if metadata.get("authors"):
            paper.authors = metadata["authors"]
        if metadata.get("doi"):
            paper.doi = metadata["doi"]
        paper.page_count = metadata["page_count"]
        if found_metadata:
            paper.library_status = "needs_review"
            paper.extraction_confidence = "low"
            paper.extraction_completed_at = datetime.now(UTC).replace(tzinfo=None)
        updated += 1
        print(f"  paper {paper.id}: title={paper.title!r} authors={paper.authors!r} doi={paper.doi!r}")
    return updated


def reextract_datasets(db) -> int:
    updated = 0
    for dataset in db.query(Dataset).filter(Dataset.storage_path.isnot(None)).all():
        with decrypted_tempfile(dataset.storage_path) as path:
            metadata = extract_tabular_metadata(path.read_bytes(), dataset.filename)

        dataset.rows = metadata["rows"]
        dataset.columns = metadata["columns"]
        dataset.column_dtypes = metadata["column_dtypes"]
        dataset.total_missing_percent = metadata["total_missing_percent"]
        dataset.duplicate_rows = metadata["duplicate_rows"]
        dataset.missingness_risk = metadata["missingness_risk"]
        dataset.data_quality_score = metadata["data_quality_score"]
        dataset.variables = metadata["variables"]
        dataset.quality_checks = metadata["quality_checks"]
        updated += 1
        print(f"  dataset {dataset.id}: quality_score={dataset.data_quality_score} missing={dataset.total_missing_percent}%")
    return updated


def main():
    db = SessionLocal()
    try:
        print("Re-extracting papers...")
        papers_updated = reextract_papers(db)
        print("Re-extracting datasets...")
        datasets_updated = reextract_datasets(db)
        db.commit()
        print(f"Done. {papers_updated} paper(s), {datasets_updated} dataset(s) updated.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
