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

- Deploy using your platform (e.g. set `NODE_ENV=production`, `GEMINI_API_KEY`, `PORT`, run `npm run build` then `npm run start`).
- Attach the tag to a GitHub/GitLab release if you use one.
