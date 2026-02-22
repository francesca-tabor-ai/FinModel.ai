# Release & checkpoint process

Use this for creating a final checkpoint or release (e.g. v1.0.0).

## Pre-checkpoint

1. **Lint**  
   `npm run lint`

2. **Build**  
   `npm run build`

3. **Optional: run locally**  
   `npm run start` and verify the app and API.

## Checkpoint / tag

1. Bump version in `package.json` if needed (e.g. 1.0.0 → 1.1.0).
2. Update `CHANGELOG.md` with the new version and changes.
3. Commit:  
   `git add -A && git commit -m "Release v1.0.0"`  
   (or your version)
4. Create a tag:  
   `git tag -a v1.0.0 -m "Release v1.0.0"`
5. Push (including tags):  
   `git push origin main --tags`

## After checkpoint

- Deploy using your platform. Set `NODE_ENV=production`, `GEMINI_API_KEY`, and **`SESSION_SECRET`** (required in production). Optionally set `PORT`, `DATABASE_URL` (PostgreSQL), `CORS_ORIGIN`. Run `npm run build` then `npm run start`. Use `GET /api/health` for probes.
- Attach the tag to a GitHub/GitLab release if you use one.
