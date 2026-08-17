"""Deterministic per-dataset statistical profiling — no AI/LLM. Produces the
same shapes the frontend's DatasetVariable/QualityCheck types expect
(frontend/src/lib/dummy-datasets.ts), since the whole point is to render
through the Variables/Quality/Distributions tabs that already exist for
dummy data.

IMPORTANT: `variables`/`quality_checks` are stored as opaque JSON columns.
CamelModel's snake_case->camelCase alias generator only applies to declared
Pydantic model fields, not to dict keys inside a JSON blob — so every dict
built here must use the frontend's exact camelCase keys directly
(missingPercent, outlierCount, binLabels, valueCounts, rowsAffected, ...).
There is no automatic conversion for nested content (same rule B1 already
established for Paper/Dataset's other JSON columns).

Semantic fields the frontend types require but that need domain knowledge —
`role`, `usedAs`, `clinicalRangeFlag`, `paperMatch` — are deliberately given
honest placeholder values ("unassigned" / "Not yet assigned") rather than a
fabricated-but-plausible-looking guess. Real role assignment happens later
(a human, or B6's Stats/Planner Agent).
"""
import numpy as np
import pandas as pd

_MISSING_WARN_THRESHOLD = 10.0  # % missing on a column before it's flagged
_SMALL_GROUP_THRESHOLD = 5  # category count below this is flagged
_MAX_CATEGORIES_FOR_TYPE = 10  # more unique values than this -> not "categorical"
_TEXT_AVG_LEN_THRESHOLD = 30  # avg string length above this -> "text" not "categorical"
_HISTOGRAM_BINS = 10
_TOP_VALUE_COUNTS = 8


def _infer_type(series: pd.Series) -> str:
    non_null = series.dropna()
    if non_null.empty:
        return "text"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "date"

    nunique = non_null.nunique()
    if nunique == len(non_null) and len(non_null) > 1:
        return "identifier"
    if nunique <= 2:
        return "binary"
    if pd.api.types.is_numeric_dtype(series):
        return "continuous"
    if pd.api.types.is_object_dtype(series) or pd.api.types.is_string_dtype(series):
        avg_len = non_null.astype(str).str.len().mean()
        if nunique <= _MAX_CATEGORIES_FOR_TYPE and avg_len <= _TEXT_AVG_LEN_THRESHOLD:
            return "categorical"
        return "text"
    return "categorical"


def _outlier_count(series: pd.Series) -> int:
    non_null = series.dropna()
    if len(non_null) < 4:
        return 0
    q1, q3 = non_null.quantile(0.25), non_null.quantile(0.75)
    iqr = q3 - q1
    if iqr == 0:
        return 0
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return int(((non_null < lower) | (non_null > upper)).sum())


def _range_str(series: pd.Series, var_type: str) -> str:
    non_null = series.dropna()
    if non_null.empty:
        return "N/A"
    if var_type == "continuous":
        return f"{non_null.min():.2f}–{non_null.max():.2f}"
    if var_type in ("binary", "categorical"):
        top = non_null.astype(str).value_counts().head(5).index.tolist()
        return ", ".join(top)
    if var_type == "date":
        return f"{non_null.min()}–{non_null.max()}"
    return f"{non_null.nunique()} unique values"


def _summary_str(series: pd.Series, var_type: str, missing_pct: float, missing_count: int) -> str:
    non_null = series.dropna()
    base = f"{missing_count} missing ({missing_pct}%)"
    if non_null.empty:
        return f"All values missing. {base}"
    if var_type == "continuous":
        return f"Mean {non_null.mean():.2f}, median {non_null.median():.2f}, range {non_null.min():.2f}–{non_null.max():.2f}. {base}"
    if var_type in ("binary", "categorical"):
        counts = non_null.astype(str).value_counts()
        top_label, top_n = counts.index[0], counts.iloc[0]
        top_pct = round(top_n / len(non_null) * 100, 1)
        return f"{non_null.nunique()} categories. Most common: {top_label} ({top_pct}%). {base}"
    if var_type == "identifier":
        return f"{non_null.nunique()} unique values, no duplicates detected. {base}"
    if var_type == "date":
        return f"Spans {non_null.min()} to {non_null.max()}. {base}"
    return f"{non_null.nunique()} unique values. {base}"


def _distribution(series: pd.Series, var_type: str) -> dict | None:
    non_null = series.dropna()
    if non_null.empty:
        return None

    if var_type == "continuous":
        counts, edges = np.histogram(non_null, bins=_HISTOGRAM_BINS)
        bin_labels = [f"{edges[i]:.1f}–{edges[i+1]:.1f}" for i in range(len(edges) - 1)]
        q1, median, q3 = non_null.quantile(0.25), non_null.median(), non_null.quantile(0.75)
        return {
            "bins": [int(c) for c in counts],
            "binLabels": bin_labels,
            "boxplot": {
                "min": float(non_null.min()),
                "q1": float(q1),
                "median": float(median),
                "q3": float(q3),
                "max": float(non_null.max()),
            },
        }

    if var_type in ("binary", "categorical"):
        counts = non_null.astype(str).value_counts().head(_TOP_VALUE_COUNTS)
        return {"valueCounts": [{"label": label, "count": int(count)} for label, count in counts.items()]}

    return None


def _build_variable(df: pd.DataFrame, col: str) -> dict:
    series = df[col]
    var_type = _infer_type(series)
    missing_count = int(series.isna().sum())
    missing_pct = round(missing_count / len(df) * 100, 1) if len(df) else 0.0

    variable = {
        "name": str(col),
        "type": var_type,
        "role": "unassigned",
        "missingPercent": missing_pct,
        "range": _range_str(series, var_type),
        "usedAs": "Not yet assigned",
        "summary": _summary_str(series, var_type, missing_pct, missing_count),
    }

    if var_type == "continuous":
        variable["outlierCount"] = _outlier_count(series)

    distribution = _distribution(series, var_type)
    if distribution:
        variable["distribution"] = distribution

    return variable


def _build_quality_checks(df: pd.DataFrame, variables: list[dict], duplicate_rows: int) -> list[dict]:
    checks: list[dict] = []

    for v in variables:
        if v["missingPercent"] > _MISSING_WARN_THRESHOLD:
            severity = "critical" if v["missingPercent"] > 30 else "warning"
            checks.append({
                "category": "missingness",
                "variable": v["name"],
                "issue": f"{v['missingPercent']}% missing values",
                "rowsAffected": int(round(v["missingPercent"] / 100 * len(df))),
                "severity": severity,
            })

        if v["type"] == "continuous" and v.get("outlierCount", 0) > 0:
            checks.append({
                "category": "outliers",
                "variable": v["name"],
                "issue": f"{v['outlierCount']} potential outliers (IQR rule)",
                "rowsAffected": v["outlierCount"],
                "severity": "info",
            })

        if df[v["name"]].isna().all():
            checks.append({
                "category": "type_problems",
                "variable": v["name"],
                "issue": "Column is entirely empty",
                "severity": "warning",
            })

        if v["type"] in ("binary", "categorical"):
            counts = df[v["name"]].dropna().astype(str).value_counts()
            small = counts[counts < _SMALL_GROUP_THRESHOLD]
            if not small.empty:
                checks.append({
                    "category": "small_groups",
                    "variable": v["name"],
                    "issue": f"Smallest group ({small.index[0]}) has only {int(small.iloc[0])} rows",
                    "rowsAffected": int(small.iloc[0]),
                    "severity": "warning",
                })

    if duplicate_rows > 0:
        checks.append({
            "category": "duplicates",
            "issue": f"{duplicate_rows} duplicate rows detected",
            "rowsAffected": duplicate_rows,
            "severity": "warning",
        })
    else:
        checks.append({"category": "duplicates", "issue": "No duplicate rows detected", "severity": "info"})

    return checks


def profile_dataset(df: pd.DataFrame) -> dict:
    total_cells = df.size
    missing_cells = int(df.isna().sum().sum())
    total_missing_percent = round(missing_cells / total_cells * 100, 1) if total_cells else 0.0
    duplicate_rows = int(df.duplicated().sum())
    duplicate_row_percent = (duplicate_rows / len(df) * 100) if len(df) else 0.0

    missingness_risk = "low" if total_missing_percent < 5 else "medium" if total_missing_percent <= 20 else "high"
    data_quality_score = round(
        max(0, min(100, 100 - min(total_missing_percent, 40) - min(duplicate_row_percent, 20)))
    )

    variables = [_build_variable(df, col) for col in df.columns]
    quality_checks = _build_quality_checks(df, variables, duplicate_rows)

    return {
        "total_missing_percent": total_missing_percent,
        "duplicate_rows": duplicate_rows,
        "missingness_risk": missingness_risk,
        "data_quality_score": data_quality_score,
        "variables": variables,
        "quality_checks": quality_checks,
    }
