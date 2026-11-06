# Tim's HVAC: Webflow → Cloudflare Pages

The Webflow export turned into a static site for Cloudflare Pages:

- **Forms** are sent through [Formspree](https://formspree.io) (instead of the Webflow backend, which doesn't work after export).
- **Blog**: the `/blog/` page and one `/blog/<slug>/` page per post are generated from CSV files.
- `sitemap.xml` and `robots.txt` are generated automatically.

No dependencies: the build is plain Node.js (18+).

## Structure

```
├── site/                 ← Webflow export (index.html, 404.html, css/, js/, images/)
│   ├── _headers          ← Cloudflare Pages headers
│   ├── _redirects        ← Cloudflare Pages redirects
│   ├── css/blog.css      ← blog styles (new)
│   └── js/formspree.js   ← form submission to Formspree (new)
├── content/blog/*.csv    ← blog posts
├── templates/            ← blog page templates (layout, list, card, post)
├── scripts/build.js      ← build → dist/
├── site.config.json      ← settings (Formspree ID, URL, blog text)
├── .nvmrc                ← Node version for the Cloudflare build
└── CLAUDE.md             ← rules for Claude (staging only)
```

## Updating from Webflow

The whole export (`timshvac.webflow.zip`) is unpacked into `site/`. On a re-export, copy the new files
into `site/` **without overwriting `index.html`** (it has changes, see the end of this file), or carry
those changes over by hand.

## Local run

```bash
npm run dev          # build + server at http://localhost:8080
npm run build        # build only, into dist/
npm run build:strict # fails if there are warnings (missing files, no Formspree ID)
```

## Deploying to Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → GitLab,
   repository `piesoft-public-sites/timhvac.com`.
2. Build settings:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Production branch: **`main`**
3. **Settings → Variables and Secrets**: add `FORMSPREE_FORM_ID` (see below) for Production and Preview.
   Node 20 is taken from `.nvmrc`.
4. **Settings → Builds → Branch control**: enable preview deployments for `staging`.
   The staging version will be at `https://staging.<project>.pages.dev`, and Cloudflare closes it from
   indexing on its own.
5. **Custom domains**: add `timhvac.com` (and `www.timhvac.com` if needed).

Branches: `main` → production (timhvac.com), `staging` → preview. Changes go to `staging`, and after checking the
preview `staging` is merged into `main` through a Merge Request (see `CLAUDE.md`).

The production domain for canonical and `sitemap.xml` is taken from `site.config.json` → `siteUrl`
(`https://timhvac.com`); it can be overridden with the `SITE_URL` variable.

Headers are in `site/_headers`, redirects in `site/_redirects` (Cloudflare Pages format). Cloudflare serves
`404.html` for missing pages and opens pages without `.html` on its own.

## Formspree

1. Create a form at formspree.io. Its endpoint looks like `https://formspree.io/f/abcdwxyz`.
2. The ID is `abcdwxyz`. Put it in `FORMSPREE_FORM_ID` in Cloudflare Pages (or in `site.config.json` → `formspreeFormId`).
3. In the Formspree form settings, add your site domain to **Allowed domains**.

How it works: the form in `index.html` has `action="__FORMSPREE_ENDPOINT__"`, which the build replaces
with the real address. `js/formspree.js` sends the form via `fetch` and shows the standard Webflow
"Thanks! We'll be in touch soon." / "Please check your info…" blocks, and keeps `webflow.js`
from intercepting the submit. Without JavaScript the form still submits (a plain POST to Formspree).
Fields: `name`, `email` (Formspree uses it as Reply-To), `message`, plus the `_gotcha` anti-spam field.

To connect another form: give it `data-formspree` and `action="__FORMSPREE_ENDPOINT__" method="POST"`
and include `<script src="js/formspree.js">`.

## Blog from CSV

Every `*.csv` in `content/blog/` is read and merged into one blog, newest posts first.
The delimiter (`,`, `;` or tab) is detected automatically, so CSVs from Excel/Google Sheets work too.
The file must be UTF-8.

Column names are case-insensitive. Both the **Webflow CMS export format** and plain names work:

| Field | Accepted columns | Required |
|---|---|---|
| Title | `Name`, `title` | yes |
| Text | `Post Body`, `body`, `content` — HTML or plain text (blank lines → paragraphs) | yes |
| URL | `Slug`, `slug` — generated from the title if empty | |
| Summary | `Post Summary`, `summary`, `excerpt` — taken from the text if empty | |
| Image | `Main Image`, `image` — URL or path like `/images/foo.jpg` | |
| Date | `Published On`, `date` — `2026-10-01`, `01.10.2026` or the Webflow format | |
| Category | `Category`, `tags` | |
| Author | `Author` | |
| SEO | `SEO Title`, `SEO Description` | |
| Hide | `Draft` / `Archived` = `true` | |

Examples: `content/blog/webflow-posts.csv` (Webflow format) and `content/blog/tips.csv` (`;`, plain text).
**These are demo posts: delete them or replace them with your own.**

The look of the pages is in `templates/` (`{{var}}` is escaped, `{{{var}}}` is inserted as HTML) and
`site/css/blog.css`. The site header and footer are taken automatically from `site/index.html` (between the
`<!-- partial:nav -->` and `<!-- partial:footer -->` comments), so blog pages always match the home page.

## What changed in `site/index.html` compared to the export

- the contact form: `action`/`method` for Formspree, readable field names, `_subject` and `_gotcha`;
- a **Blog** link in the menu and in the footer (in place of the empty link);
- the e-mail in contacts is now a `mailto:` link;
- `js/formspree.js` is included;
- `partial:nav` / `partial:footer` markers for the blog templates;
- the Webflow map widget (it needs Webflow's Google Maps key, which doesn't work on another domain)
  is replaced with a plain Google Maps `<iframe>` for 3301 Allen St, Easton, PA: satellite view,
  zoom 12, height 400px, as in the original.

When you re-export from Webflow, carry these changes over (or make the same ones in Webflow:
the Blog link, the form's custom action, the field names).
