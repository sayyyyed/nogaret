# Shining Nova Architecture

## 1. Architecture Overview

Shining Nova is an Astro-first personal knowledge platform. Content collections are the source of truth for writing, projects, labs, notes, reading, bookmarks, and changelog entries. Astro renders the durable content layer statically; React islands are reserved for search, graphs, charts, demos, and visualizations that justify client-side JavaScript.

Primary design decisions:

- Content is modeled before interface details.
- URLs map to future subdomain ownership boundaries.
- MDX is the primary authoring format.
- Interactive work lives behind explicit island boundaries.
- Projects, labs, and notes are content-managed, not hardcoded.

## 2. Folder Structure Tree

```text
src/
  components/
    content/           Reusable cards, heroes, related content, tags, callouts.
    layout/            Header, footer, shells, page chrome.
    mdx/               Custom MDX components and embeds.
    navigation/        Primary nav, breadcrumbs, topic navigation.
    search/            Search input, result rendering, future index UI.
    visualizations/    D3, Plotly, Three.js, and graph island boundaries.
  content/
    blog/              Essays and technical articles.
    tutorials/         Step-by-step learning content.
    research/          Research notes with sources and confidence.
    projects/          Portfolio projects and case studies.
    notes/             Digital garden notes, concepts, references, MOCs.
    labs/              Experiments, prototypes, and interactive tools.
    bookmarks/         External resources and saved references.
    reading/           Reading notes and source summaries.
    changelog/         Site and project evolution records.
  data/                Site metadata and navigation constants.
  layouts/             Base document layouts and article/project shells.
  lib/content/         Content sorting, routing, graph, and relation helpers.
  pages/               Route entry points and collection renderers.
  styles/              Global CSS and design tokens.
  utils/               General-purpose utilities.
```

## 3. Content Collection Schemas

Implemented in `src/content.config.ts`.

- `blog`: articles, essays, and notes with status, series, difficulty, tags, technology, and related content.
- `tutorials`: structured learning paths with prerequisites and outcomes.
- `research`: research notes with area, confidence, sources, and related topics.
- `projects`: portfolio records with status, repository, demo, tech stack, dates, category, screenshots, architecture diagram, and related articles.
- `notes`: digital garden entries with note type, aliases, and explicit connections.
- `labs`: AI experiments, LLM demos, visualizations, prototypes, learning tools, and data explorations.
- `bookmarks`: saved external resources with source URL, tags, and reading state.
- `reading`: reading notes with author, source URL, rating, and standard article metadata.
- `changelog`: versioned public updates.

## 4. Component Hierarchy

```text
BaseLayout
  SiteHeader
  SiteFooter
  SectionHero
  ContentCard
  ArticleLayout
    TableOfContents
    ReadingProgress
    RelatedContent
    TagList
  ProjectLayout
    TechStack
    ProjectLinks
    ScreenshotGallery
  MDXProvider
    Callout
    CodeBlock
    MathBlock
    Figure
    Embed
  VisualizationIsland
    D3Canvas
    PlotlyChart
    ThreeScene
    KnowledgeGraph
```

The current implementation includes the foundational layout, section hero, content cards, and visualization boundary. The remaining components should be added as content demands them.

## 5. Routing Strategy

- `/blog/`, `/tutorials/`, `/research/`, `/notes/`, `/projects/`, `/labs/`, `/reading/`, and `/changelog/` render collection indexes.
- `/{collection}/{slug}/` renders detail pages from content collections.
- `/visualizations/` owns reusable visualization surfaces.
- `/about/`, `/now/`, `/uses/`, `/contact/`, `/bookmarks/`, and `/timeline/` support personal site navigation.
- Future topic, tag, and series routes should be generated from collection metadata rather than manually maintained.

## 6. MDX Strategy

MDX should support:

- Callouts for notes, warnings, tips, and research caveats.
- Enhanced code blocks with file names, highlights, and copy actions.
- Math rendering when research content requires it.
- Interactive embeds for labs and visualizations.
- Footnotes and references for research notes.
- Table of contents and reading progress for long-form articles.
- Stable metadata in frontmatter only; avoid ad hoc inline metadata.

## 7. Visualization Architecture

Visualizations are isolated by default:

- Use static explanatory content around every visualization.
- Mount D3, Plotly, Three.js, or React Three Fiber only in island components.
- Keep data loaders separate from rendering components.
- Version datasets under `src/data/` until they outgrow the repository.
- Promote reusable graph primitives into `src/components/visualizations/`.

## 8. Search Architecture

MVP search should use a generated local JSON index from content collections. The index should include title, description, tags, collection, URL, date, and excerpt. Later versions can add Pagefind, vector search, or a FastAPI-backed semantic index without changing collection ownership.

## 9. SEO Architecture

Required SEO layers:

- Unique title and description per route.
- Canonical URLs based on the site metadata.
- Open Graph and Twitter metadata.
- RSS and Atom feeds for blog, research, and changelog.
- Sitemap generation.
- Structured data for articles, projects, breadcrumbs, and profile pages.
- Tag, topic, series, and hub pages generated from metadata.
- Internal links from related content, note connections, and topic hubs.

## 10. Future Subdomain Migration Plan

Current ownership boundaries should map cleanly to future subdomains:

- `labs.domain.com`: `src/content/labs`, visualization islands, demos.
- `notes.domain.com`: `src/content/notes`, backlinks, graph UI.
- `api.domain.com`: future FastAPI and PostgreSQL services.
- `graph.domain.com`: knowledge graph APIs and graph visualizations.
- `research.domain.com`: `src/content/research`, sources, datasets.

Keep collection schemas portable and avoid coupling content rendering to root-domain-only routes.

## 11. 30-Day Implementation Roadmap

1. Finish base design system, navigation, and article layouts.
2. Add tag, topic, and series pages.
3. Add RSS, sitemap, canonical URLs, and structured data.
4. Build MDX callouts, code block enhancements, and table of contents.
5. Add local search index and UI.
6. Add related content and note connection helpers.
7. Build the first D3 knowledge graph lab.
8. Migrate real articles, projects, and research notes.

## 12. Prioritized MVP

- Typed content collections.
- Home page and all major section routes.
- Collection index and detail pages.
- Base layout, navigation, footer, cards, and hero.
- Seed content for every collection.
- Architecture documentation.
- Build passing with strict TypeScript.

## 13. Nice-to-Have Version

- Pagefind search.
- RSS and Atom feeds.
- Tag/topic/series pages.
- MDX component library.
- Knowledge graph visualization.
- Reading progress and automatic table of contents.
- Project screenshot galleries.
- Framer Motion/GSAP enhancements for selected interactions only.

## 14. Long-Term 3-Year Evolution Plan

Year 1: establish publishing cadence, stable schemas, search, RSS, topic hubs, and first visualizations.

Year 2: add richer labs, datasets, interactive education tools, backlinks, graph exploration, and research workflows.

Year 3: split high-growth areas into subdomains, add FastAPI/PostgreSQL services, semantic search, and graph-backed knowledge navigation.
