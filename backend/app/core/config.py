import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings:
    database_url: str = os.environ.get("DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'karna.db'}")
    cors_origins: list[str] = ["http://localhost:3000"]
    research_workspace_dir: Path = Path(
        os.environ.get("RESEARCH_WORKSPACE_DIR", str(BACKEND_DIR.parent / "research-workspace"))
    )


settings = Settings()
