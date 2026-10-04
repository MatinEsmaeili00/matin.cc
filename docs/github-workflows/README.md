# GitHub Actions workflows (parked)

These belong in `.github/workflows/`, but pushing files there requires a GitHub token with the
`workflow` scope, which the `gh` login on the first computer didn't have. They're kept here so they
travel with the repo.

To activate them (once, on any computer):

```bash
gh auth refresh -h github.com -s workflow     # or: gh auth login --scopes workflow
mkdir -p .github/workflows
cp docs/github-workflows/*.yml .github/workflows/
git add .github && git commit -m "Add CI and rebuild workflows" && git push
```

- `ci.yml` — validate, typecheck, lint and build on every push / pull request.
- `rebuild.yml` — manual "Rebuild site" button (Actions tab). Needs the `DEPLOY_HOOK_URL` repository secret.
