# backend-byte

Personal technical blog built with [Hugo Extended](https://gohugo.io/). Covers Linux kernel, backend engineering, networking, and systems programming. Hosted at [backendbyte.com](https://backendbyte.com).

---

## Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) v0.136.5+
- [Pagefind](https://pagefind.app/) (for search) — `npm install -g pagefind`

---

## Local Development

```bash
make dev
```

This builds the site, indexes search, copies the index, then starts the live-reload server at `http://localhost:1313`.

If you just want the server without rebuilding search:

```bash
hugo server -D
```

---

## Content Structure

```
content/
├── posts/
│   ├── kernel/
│   ├── backend/
│   ├── networking/
│   ├── systems/
│   └── devtools/
├── shelf/          # research papers you've read
└── logs/           # manual notes/updates (posts auto-appear here)
```

---

## Adding a Blog Post

### 1. Create the file

```bash
hugo new content posts/<category>/<slug>.md
```

**Categories:** `kernel` · `backend` · `networking` · `systems` · `devtools`

Example:

```bash
hugo new content posts/kernel/linux-memory-management.md
```

### 2. Fill in the frontmatter

```yaml
---
title: "Linux Memory Management Internals"
date: 2026-03-27T10:00:00+06:00
description: "A deep dive into the buddy allocator, slab allocator, and how the kernel manages physical memory."
category: kernel
tags: [linux, memory, mm, kernel]
draft: false          # set to true while writing, false when ready to publish
toc: true             # show table of contents sidebar
math: false           # set true if you use LaTeX math blocks
mermaid: false        # set true if you use Mermaid diagrams
series: ""            # optional: group multi-part posts by a series name
seriesPart: 0         # optional: part number within the series
---
```

### 3. Write the post

The archetype pre-fills these sections:

```markdown
## Introduction

## Background

## Deep Dive

## Conclusion
```

### 4. Publish

Change `draft: false` and push. The post will automatically appear:
- On the homepage (if it's one of the 9 most recent)
- On `/posts/` and the category page (e.g. `/posts/kernel/`)
- On `/logs/` as a **published** entry with the category → tags trace

> **Search index** is rebuilt automatically by GitHub Actions on deploy. For local search, run `make search` after adding posts.

---

## Adding a Shelf Entry (Research Paper)

The shelf is for research papers or articles you've read, with a summary and optional link to a related blog post.

### 1. Create the file

```bash
hugo new content shelf/<slug>.md
```

Example:

```bash
hugo new content shelf/attention-is-all-you-need.md
```

### 2. Fill in the frontmatter

```yaml
---
title: "Attention Is All You Need"
date: 2026-03-27T10:00:00+06:00   # date you read it
authors: ["Vaswani et al."]
year: 2017                          # publication year
paperURL: "https://arxiv.org/abs/1706.03762"
summary: "Introduces the Transformer architecture, replacing recurrence and convolution entirely with attention mechanisms. The self-attention mechanism allows modeling dependencies regardless of distance in sequences."
relatedPost: "/posts/backend/transformer-architecture-explained/"  # optional
tags: [transformers, attention, deep-learning, nlp]
draft: false
---
```

### 3. Write your notes

The archetype pre-fills:

```markdown
## Why I Read This

## Key Takeaways

## What I Found Surprising
```

### 4. Result

The paper appears on `/shelf/` as a single-line row showing year, authors, title, tags, and links. It also auto-appears on `/logs/` as a **reading** entry with the first author and year in the trace.

---

## Adding a Manual Log Entry

Logs are mostly auto-generated (every post → **published**, every shelf entry → **reading**). But you can add manual entries for notes, updates, or anything that isn't a post or paper.

### 1. Create the file

```bash
hugo new content logs/<slug>.md
```

### 2. Fill in the frontmatter

```yaml
---
title: "Migrated comments to a self-hosted solution"
date: 2026-03-27T10:00:00+06:00
logType: "update"      # published | reading | note | update
link: ""               # optional: URL this entry points to
description: "Moved from Disqus to a self-hosted Remark42 instance."
trace: ["infra", "comments", "remark42"]   # optional breadcrumb trail
draft: false
---
```

**logType values:**

| Value | Badge color | When to use |
|---|---|---|
| `published` | green | new post (auto-generated) |
| `reading` | cyan | paper added to shelf (auto-generated) |
| `note` | amber | quick thought or observation |
| `update` | purple | site change, correction, or revision |

---

## Series (Multi-Part Posts)

To group posts into a series, set `series` and `seriesPart` in each post's frontmatter:

```yaml
# Part 1
series: "Linux Networking Internals"
seriesPart: 1

# Part 2
series: "Linux Networking Internals"
seriesPart: 2
```

---

## Deployment

Push to `main`. GitHub Actions builds the site, runs Pagefind to index search, and deploys to GitHub Pages automatically.

```
.github/workflows/deploy.yml
```

To build locally for production:

```bash
make build
```

Output goes to `public/`.

---

## Make Commands

| Command | What it does |
|---|---|
| `make dev` | Build + index search + start live server |
| `make build` | Production build (used by CI) |
| `make search` | Rebuild search index only (faster) |
