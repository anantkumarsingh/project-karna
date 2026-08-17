import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings:
    database_url: str = os.environ.get("DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'karna.db'}")
    cors_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
