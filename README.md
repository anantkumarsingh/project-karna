# Project Karna

An AI-powered research analytics workspace for biomedical and clinical researchers.

Given a research question, a paper, and a dataset, Karna helps a researcher decide what analysis is valid, run it, explain it, visualize it, and document it — as a guided, traceable, reproducible workflow, not a generic "chat with your data" tool.

## What it does

- **Paper Understanding** — extract methods, variables, claims, and concepts from a paper; assess whether a dataset can replicate it.
- **Data Understanding** — profile a dataset, run quality/cleaning checks, and check readiness for specific statistical analyses.
- **Research Question Builder** — turn a paper + dataset into well-formed, feasibility-scored research questions, AI-recommended or self-authored.
- **Analysis Execution** — configure and run statistical analyses (guided, advanced, or code mode), with generated code and results.
- **Visualization Studio** — build figures and tables from analysis results, with paper-vs-own-data comparisons.
- **Report Builder** — compile a report with claim-level traceability back to its source data, flagging unsupported claims automatically.
- **Agent system** (in progress) — nine specialized agents (Planner, Paper, Data, Stats, Code, Visualization, Report, Critic, Memory) assist at each step, with every output labeled by provenance (rulebook / new reasoning / deterministic / paper source / dataset source). All statistics are computed deterministically in Python — never invented by an LLM.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 + Alembic, Pydantic v2 |
| Database | SQLite (local first) → PostgreSQL later |
| Analysis | pandas, numpy, scipy, statsmodels, lifelines, pingouin |
| Package managers | pnpm (frontend), uv (backend) |

## Project structure

```
project-karna/
  frontend/                 # Next.js app
  backend/                  # FastAPI app
  research-workspace/       # Runtime data (uploads, logs, prompts, rulebook) — not code
  Makefile                  # make install / make dev
```

## Getting started

```bash
make install   # installs frontend + backend dependencies
make dev       # runs frontend (localhost:3000) + backend (localhost:8000) together
```

API docs (Swagger UI) are available at `localhost:8000/docs` while the backend is running.

## Current status

- **Frontend:** all 7 tabs built end-to-end. Dashboard, Paper Understanding, and Data Understanding are wired to the live backend, including real file upload; Research Question Builder, Analysis Execution, Visualization Studio, and Report Builder are still on realistic placeholder data pending backend support.
- **Backend:** core data models, migrations, and CRUD API are complete for all entities (Project, Paper, Dataset, Research Question, Analysis, Artifact, Report, Rulebook Entry). Real PDF/CSV/Excel upload is live, with deterministic metadata extraction, encryption at rest, and a per-item AI-sensitivity level. Deterministic analysis execution and the agent system are not yet built.
- **Agent system:** not yet started.

## Recent updates

- **2026-08-16** — Real file upload for papers/datasets: deterministic metadata extraction (page count; row/column/dtype counts), encryption at rest, and a three-tier sensitivity level (public / restricted / do-not-send-to-AI) that governs what a future AI agent may see about an item. Public GitHub repo set up (monorepo).
