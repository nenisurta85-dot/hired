#!/usr/bin/env node
'use strict';

/**
 * Site build for Cloudflare Pages.
 *
 *   site/            Webflow export (copied to dist/ as is)
 *   content/blog/    CSV files with blog posts (all *.csv are merged)
 *   templates/       blog page templates
 *   dist/            result (Build output directory on Cloudflare Pages)
 *
 * Settings (environment variables override site.config.json):
 *   FORMSPREE_FORM_ID  ID of the Formspree form (https://formspree.io/f/<ID>)
 *   SITE_URL           production site URL, used for canonical and sitemap.xml
 *                      (by default siteUrl from site.config.json)
 */

const fs = require('fs');
const path = require('path');
const { parseCSV } = require('./lib/csv');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'site');
const DIST = path.join(ROOT, 'dist');
const BLOG_CONTENT = path.join(ROOT, 'content', 'blog');
const TEMPLATES = path.join(ROOT, 'templates');
const FORMSPREE_PLACEHOLDER = '__FORMSPREE_ENDPOINT__';

const warnings = [];
const warn = (msg) => { warnings.push(msg); console.warn('⚠  ' + msg); };

// ---------------------------------------------------------------- config

function loadConfig() {
  const file = path.join(ROOT, 'site.config.json');
  const cfg = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const formId = (process.env.FORMSPREE_FORM_ID || cfg.formspreeFormId || '').trim();
  const siteUrl = (process.env.SITE_URL || cfg.siteUrl || '').trim().replace(/\/+$/, '');
  return {
    formId,
    siteUrl,
    blog: Object.assign({
      title: 'Blog',
      heading: 'HVAC tips & news',
      intro: 'Advice on heating, cooling and keeping your home comfortable all year round.',
      siteName: "Tim's HVAC"
    }, cfg.blog || {})
  };
}

// ---------------------------------------------------------------- utils

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

/** {{var}} is escaped, {{{var}}} is inserted as is. */
function render(template, data) {
  return template
    .replace(/\{\{\{\s*(\w+)\s*\}\}\}/g, (_, k) => (data[k] == null ? '' : String(data[k])))
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => escapeHtml(data[k]));
}

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

function walk(dir, ext, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, ext, out);
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function slugify(text) {
  return String(text)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9Ѐ-ӿ]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';
}

function truthy(v) {
  return /^(true|yes|1|да)$/i.test(String(v || '').trim());
}

// ---------------------------------------------------------------- partials

/**
 * Extracts the header and footer from index.html (between the
 * <!-- partial:name --> markers) and rewrites links to absolute ones so
 * they work from /blog/... pages.
 */
function extractPartial(html, name) {
  const m = html.match(new RegExp(`<!-- partial:${name} -->([\\s\\S]*?)<!-- /partial:${name} -->`));
  if (!m) throw new Error(`Marker <!-- partial:${name} --> not found in site/index.html`);
  return absolutize(m[1]);
}

function absolutize(html) {
  const fixPath = (p) => (/^(https?:|mailto:|tel:|data:|\/|#)/.test(p) ? p : '/' + p.replace(/^\.\//, ''));
  return html
    .replace(/(href)="#"/g, '$1="/"')
    .replace(/(href)="#([^"]+)"/g, '$1="/#$2"')
    .replace(/(src|href)="([^"]+)"/g, (_, attr, p) => `${attr}="${fixPath(p)}"`)
    .replace(/srcset="([^"]+)"/g, (_, set) => 'srcset="' + set.split(',').map((part) => {
      const [url, ...rest] = part.trim().split(/\s+/);
      return [fixPath(url), ...rest].join(' ');
    }).join(', ') + '"');
}

// ---------------------------------------------------------------- blog

/**
 * Column names are case-insensitive. Supports the Webflow CMS export format
 * (Name, Slug, Post Body, Post Summary, Main Image, Published On, Draft,
 * Archived) and plain names (title, body, summary, image, date, ...).
 */
const COLUMNS = {
  title: ['name', 'title', 'post title', 'заголовок', 'название'],
  slug: ['slug', 'url', 'ссылка'],
  body: ['post body', 'body', 'content', 'text', 'html', 'текст', 'содержание'],
  summary: ['post summary', 'summary', 'excerpt', 'description', 'описание', 'анонс'],
  image: ['main image', 'image', 'cover', 'thumbnail image', 'thumbnail', 'изображение', 'картинка'],
  imageAlt: ['image alt', 'alt', 'main image alt'],
  date: ['published on', 'publish date', 'date', 'published', 'created on', 'дата'],
  author: ['author', 'автор'],
  category: ['category', 'categories', 'tag', 'tags', 'категория'],
  seoTitle: ['seo title', 'meta title'],
  seoDescription: ['seo description', 'meta description'],
  draft: ['draft', 'черновик'],
  archived: ['archived', 'архив']
};

function pick(row, field) {
  const keys = Object.keys(row);
  for (const alias of COLUMNS[field]) {
    const key = keys.find((k) => k.toLowerCase() === alias);
    if (key && row[key] !== '') return row[key];
  }
  return '';
}

function parseDate(value) {
  if (!value) return null;
  let d = new Date(value);
  if (isNaN(d)) {
    // DD.MM.YYYY
    const m = value.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
    if (m) d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  }
  return isNaN(d) ? null : d;
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/** If the body has no HTML tags, turns plain text into paragraphs. */
function bodyToHtml(body) {
  if (/<[a-z][\s\S]*>/i.test(body)) return body;
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

function decodeEntities(text) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return named[e.toLowerCase()] != null ? named[e.toLowerCase()] : m;
  });
}

/** Plain text from HTML (for the summary); escaped again when inserted into the page. */
function stripHtml(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function loadPosts() {
  if (!fs.existsSync(BLOG_CONTENT)) return [];
  const files = fs.readdirSync(BLOG_CONTENT).filter((f) => f.toLowerCase().endsWith('.csv')).sort();
  const posts = [];
  const slugs = new Set();

  for (const file of files) {
    const rows = parseCSV(fs.readFileSync(path.join(BLOG_CONTENT, file), 'utf8'));
    rows.forEach((row, i) => {
      const where = `${file}, row ${i + 2}`;
      if (truthy(pick(row, 'draft')) || truthy(pick(row, 'archived'))) return;

      const title = pick(row, 'title');
      const rawBody = pick(row, 'body');
      if (!title) { warn(`${where}: no title, row skipped`); return; }
      if (!rawBody) warn(`${where}: post "${title}" has no body`);

      let slug = slugify(pick(row, 'slug') || title);
      if (slugs.has(slug)) {
        let n = 2;
        while (slugs.has(`${slug}-${n}`)) n++;
        warn(`${where}: slug "${slug}" is already taken, using "${slug}-${n}"`);
        slug = `${slug}-${n}`;
      }
      slugs.add(slug);

      const rawDate = pick(row, 'date');
      const date = parseDate(rawDate);
      if (rawDate && !date) warn(`${where}: could not parse date "${rawDate}"`);

      const body = bodyToHtml(rawBody);
      const summary = pick(row, 'summary') || truncate(stripHtml(body), 180);

      posts.push({
        title,
        slug,
        body,
        summary,
        image: pick(row, 'image'),
        imageAlt: pick(row, 'imageAlt') || title,
        date,
        author: pick(row, 'author'),
        category: pick(row, 'category'),
        seoTitle: pick(row, 'seoTitle'),
        seoDescription: pick(row, 'seoDescription'),
        url: `/blog/${slug}/`,
        source: file
      });
    });
  }

  posts.sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0));
  return posts;
}

function metaHtml(post) {
  const parts = [];
  if (post.category) parts.push(`<span class="tag">${escapeHtml(post.category)}</span>`);
  if (post.date) parts.push(`<time datetime="${post.date.toISOString().slice(0, 10)}">${formatDate(post.date)}</time>`);
  if (post.author) parts.push(`<span>${escapeHtml(post.author)}</span>`);
  return parts.join('<span aria-hidden="true">·</span>');
}

function imageUrl(src) {
  if (!src) return '';
  return /^(https?:)?\/\//.test(src) || src.startsWith('/') ? src : '/' + src.replace(/^\.\//, '');
}

function buildBlog(cfg, partials) {
  const layout = readTemplate('layout.html');
  const indexTpl = readTemplate('blog-index.html');
  const cardTpl = readTemplate('blog-card.html');
  const postTpl = readTemplate('blog-post.html');
  const posts = loadPosts();

  const page = (data) => render(layout, Object.assign({
    nav: partials.nav,
    footer: partials.footer,
    ogType: 'website',
    canonical: cfg.siteUrl ? `<link rel="canonical" href="${escapeHtml(cfg.siteUrl + data.path)}">` : '',
    ogImage: data.image ? `<meta property="og:image" content="${escapeHtml(absoluteUrl(cfg, data.image))}">` : ''
  }, data));

  for (const post of posts) {
    const img = imageUrl(post.image);
    const content = render(postTpl, {
      title: post.title,
      meta: metaHtml(post),
      summaryBlock: post.summary
        ? `<div class="subheading rich-text w-richtext"><p>${escapeHtml(post.summary)}</p></div>` : '',
      image: img
        ? `<div class="blog-post_image"><img src="${escapeHtml(img)}" alt="${escapeHtml(post.imageAlt)}"></div>` : '',
      body: post.body
    });
    writeFile(path.join(DIST, 'blog', post.slug, 'index.html'), page({
      title: `${post.seoTitle || post.title} | ${cfg.blog.siteName}`,
      description: post.seoDescription || post.summary,
      ogType: 'article',
      path: post.url,
      image: img,
      content
    }));
  }

  const cards = posts.map((post) => {
    const img = imageUrl(post.image);
    return render(cardTpl, {
      url: post.url,
      title: post.title,
      summary: post.summary,
      meta: metaHtml(post),
      image: img
        ? `<div class="blog-card_image"><img src="${escapeHtml(img)}" alt="${escapeHtml(post.imageAlt)}" loading="lazy"></div>` : ''
    });
  }).join('\n');

  writeFile(path.join(DIST, 'blog', 'index.html'), page({
    title: `${cfg.blog.title} | ${cfg.blog.siteName}`,
    description: cfg.blog.intro,
    path: '/blog/',
    content: render(indexTpl, {
      heading: cfg.blog.heading,
      intro: cfg.blog.intro,
      posts: posts.length
        ? `<div class="blog-grid">\n${cards}\n      </div>`
        : '<p class="blog-empty">No posts yet.</p>'
    })
  }));

  return posts;
}

function absoluteUrl(cfg, p) {
  if (/^(https?:)?\/\//.test(p) || !cfg.siteUrl) return p;
  return cfg.siteUrl + p;
}

// ---------------------------------------------------------------- forms

function applyFormspree(cfg) {
  const endpoint = cfg.formId ? `https://formspree.io/f/${encodeURIComponent(cfg.formId)}` : null;
  let found = 0;
  for (const file of walk(DIST, '.html')) {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes(FORMSPREE_PLACEHOLDER)) continue;
    found++;
    if (endpoint) fs.writeFileSync(file, html.split(FORMSPREE_PLACEHOLDER).join(endpoint));
  }
  if (found && !endpoint) {
    warn('FORMSPREE_FORM_ID is not set: forms will not send. Set it in the Cloudflare Pages variables or in site.config.json.');
  }
}

// ---------------------------------------------------------------- sitemap

function buildSitemap(cfg, posts) {
  if (!cfg.siteUrl) {
    warn('Site URL unknown (SITE_URL or siteUrl in site.config.json): sitemap.xml skipped.');
    return;
  }
  const urls = [
    { loc: '/', lastmod: null },
    { loc: '/blog/', lastmod: posts[0] && posts[0].date },
    ...posts.map((p) => ({ loc: p.url, lastmod: p.date }))
  ];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${escapeHtml(cfg.siteUrl + u.loc)}</loc>` +
      (u.lastmod ? `<lastmod>${u.lastmod.toISOString().slice(0, 10)}</lastmod>` : '') + '</url>').join('\n') +
    '\n</urlset>\n';
  writeFile(path.join(DIST, 'sitemap.xml'), xml);
  writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nDisallow: /style-guide\nSitemap: ${cfg.siteUrl}/sitemap.xml\n`);
}

// ---------------------------------------------------------------- asset check

/** Lists local files that HTML/CSS reference but that are missing from dist/. */
function checkAssets() {
  const missing = new Map();
  const note = (ref, from) => {
    const clean = decodeURI(ref.split(/[?#]/)[0]);
    if (!clean || /^(https?:|mailto:|tel:|data:|\/\/|#)/.test(ref)) return;
    const abs = clean.startsWith('/') ? path.join(DIST, clean) : path.join(path.dirname(from), clean);
    if (abs.endsWith(path.sep) || clean.endsWith('/')) return; // directory URLs
    if (!fs.existsSync(abs)) {
      const key = path.relative(DIST, abs);
      if (!missing.has(key)) missing.set(key, new Set());
      missing.get(key).add(path.relative(DIST, from));
    }
  };
  for (const file of walk(DIST, '.html')) {
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/\s(?:src|href)="([^"]+)"/g)) note(m[1], file);
    for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) {
      m[1].split(',').forEach((part) => note(part.trim().split(/\s+/)[0], file));
    }
  }
  for (const file of walk(DIST, '.css')) {
    const css = fs.readFileSync(file, 'utf8');
    for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      if (!m[1].endsWith('/')) note(m[1], file);
    }
  }
  if (missing.size) {
    warn(`${missing.size} referenced files are missing (copy them from the Webflow export into site/):\n` +
      [...missing].map(([f, from]) => `     - ${f}  (used in: ${[...from].join(', ')})`).join('\n'));
  }
}

// ---------------------------------------------------------------- main

function main() {
  const cfg = loadConfig();
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(SRC, DIST);

  const indexHtml = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const partials = { nav: extractPartial(indexHtml, 'nav'), footer: extractPartial(indexHtml, 'footer') };

  const posts = buildBlog(cfg, partials);
  applyFormspree(cfg);
  buildSitemap(cfg, posts);
  checkAssets();

  console.log(`\n✔ Build finished: ${path.relative(process.cwd(), DIST) || 'dist'}/`);
  console.log(`  blog posts: ${posts.length}`);
  console.log(`  Formspree: ${cfg.formId ? 'https://formspree.io/f/' + cfg.formId : 'not configured'}`);
  if (warnings.length) console.log(`  warnings: ${warnings.length}`);
  if (process.env.STRICT === '1' && warnings.length) process.exit(1);
}

main();
