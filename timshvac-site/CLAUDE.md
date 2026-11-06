# CLAUDE.md

Tim's HVAC site (timhvac.com): a Webflow export, deployed on Netlify.
Repository: https://gitlab.com/piesoft-public-sites/timhvac.com

## Git rules (required)

- **All changes go only to the `staging` branch.** Before starting work: `git checkout staging && git pull origin staging`.
- **Never push to `main` directly** — no `git push origin main`, no `git push origin staging:main`,
  no force-push to `main`, no merging into `main` locally followed by a push.
- `main` is updated only through a **Merge Request `staging` → `main`** in GitLab, and only a person merges it.
  You may create the MR if asked, but never merge it yourself.
- If a task seems to require changing `main` directly, stop and ask the user.

## Project

- `site/` — Webflow export (index.html, css/, js/, images/). On a re-export, don't overwrite `site/index.html`:
  it has edits (Formspree form, Blog link, Google Maps iframe, partial markers), listed in the README.
- `content/blog/*.csv` — blog posts; `templates/` — blog page templates; `site/css/blog.css` — their styles.
- `scripts/build.js` — build into `dist/` (dependency-free, Node 18+).
- Settings: `FORMSPREE_FORM_ID`, `SITE_URL` (env, or `site.config.json`).

## Commands

```bash
npm run build         # build into dist/
npm run build:strict  # fails on warnings (missing files, no Formspree ID)
npm run dev           # build + local server http://localhost:8080
```

Before committing, run `npm run build` and make sure there are no warnings about missing files.
