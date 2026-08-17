.PHONY: dev frontend backend install

dev:
	@echo "Starting Karna (frontend + backend)..."
	@make -j2 frontend backend

frontend:
	cd frontend && pnpm run dev

backend:
	cd backend && $(HOME)/.local/bin/uv run python main.py

install:
	cd frontend && pnpm install --ignore-scripts
	cd backend && $(HOME)/.local/bin/uv sync
