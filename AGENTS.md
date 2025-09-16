# Repository Guidelines

## Project Structure & Module Organization
- `public/`: Web root with `index.php`, API endpoints under `api/*.php`, and assets in `assets/js` and `assets/css`.
- `src/`: PHP domain classes (e.g., `Project.php`, `Scene.php`, `MediaLibrary.php`).
- `data/`: JSON storage and per‑project folders (`projects.json`, `projects/{id}/`). Writable at runtime; do not commit contents.
- `templates/`: HTML snippets/UI templates (if used by pages).
- `specs/`: Requirements and design docs.
- Root scripts: `start.sh`, `start-server.sh`, `server.sh` for local development.

## Build, Test, and Development Commands
- `bash start.sh`: Quick start at `http://localhost:8000` using PHP built‑in server.
- `bash start-server.sh [PORT]`: Start with higher upload limits (e.g., `bash start-server.sh 8080`).
- `cd public && php -S localhost:8000`: Manual start without scripts.
- Manual checks: open `public/test-*.php` / `public/test-*.html` in a browser.
- API smoke test: `curl 'http://localhost:8000/api/projects.php'` (GET list).

## Coding Style & Naming Conventions
- PHP: PSR‑12, 4‑space indent, UTF‑8. Classes in `src/` use PascalCase (`Project.php`), methods/properties camelCase. API scripts under `public/api/` are lowercase (`projects.php`).
- JavaScript: ES6+, 4‑space indent, camelCase; keep logic modular in `public/assets/js/app.js`.
- CSS: Utility‑first (Tailwind) plus `public/assets/css/style.css`; prefer semantic class names for custom styles.
- Keep functions small and pure; validate input at API boundaries.

## Testing Guidelines
- No framework tests yet. Perform manual smoke tests:
  - Load `http://localhost:8000` and verify project create/edit/delete.
  - Call API: `curl 'http://localhost:8000/api/projects.php'`.
  - Use `public/test-*.php` pages to validate uploads and scene operations.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Keep PRs small and focused. Include: description, motivation, affected areas, linked issue, and screenshots/GIFs for UI changes.
- Note testing performed (pages/API exercised, sample inputs). Add repro steps and anonymized snippets from `data/projects/{id}/` when relevant.

## Security & Configuration Tips
- Ensure `data/` and `data/projects/` are writable and git‑ignored; never trust client input—sanitize/validate in API endpoints.
- For large uploads during dev, prefer `start-server.sh` to set PHP limits.
- Avoid committing runtime artifacts or local configuration secrets.

