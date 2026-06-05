# ROLE

You are a senior Astro architect, technical writer platform designer, and frontend engineer.

Your task is to create the COMPLETE project structure, architecture plan, content model, and implementation roadmap for a personal website that is primarily:

1. Technical blog
2. Knowledge base
3. Digital garden
4. Project portfolio
5. Interactive learning platform

The website should be designed for long-term growth over several years.

---

# PRIMARY GOALS

This is NOT a typical portfolio.

The site should be treated as a personal knowledge hub.

The author writes about:

* Software engineering
* Web development
* PHP
* CodeIgniter
* Python
* FastAPI
* AI engineering
* LLMs
* RAG systems
* Educational systems
* Data visualization
* Arabic language technology
* Islamic digital resources
* Research notes
* Tutorials
* Experiments

The website should encourage visitors to:

* Read articles
* Explore projects
* Browse experiments
* Discover interconnected notes
* Interact with visualizations
* Follow long-term research

---

# TECH STACK

Use:

* Astro 5
* TypeScript
* Tailwind CSS
* MDX
* Astro Content Collections
* React Islands
* GSAP
* Framer Motion
* D3
* Plotly
* Three.js
* React Three Fiber

Future backend services:

* FastAPI
* PostgreSQL

Do NOT use Next.js.

Favor Astro-first architecture.

---

# DESIGN PRINCIPLES

1. Content first
2. Fast loading
3. SEO friendly
4. Minimal JavaScript by default
5. Interactive only where useful
6. Scalable for 500+ articles
7. Scalable for multiple future subdomains
8. Strong information architecture
9. Maintainable by one developer
10. Long-form writing optimized

---

# WEBSITE SECTIONS

Design information architecture for:

Home

About

Now

Uses

Projects

Blog

Tutorials

Research

Notes

Labs

Visualizations

Bookmarks

Reading List

Timeline

Changelog

Contact

---

# BLOG CONTENT STRATEGY

Design content collections for:

Blog Posts

Tutorials

Research Notes

Project Logs

Case Studies

Bookmarks

Reading Notes

Create schemas for every content type.

Include:

title

slug

description

date

updated

tags

series

draft

featured

readingTime

coverImage

status

difficulty

technology

relatedContent

and any additional fields that make sense.

---

# PROJECT PORTFOLIO STRATEGY

Projects should NOT be hardcoded.

Use Astro Content Collections.

Each project should contain:

title

description

status

featured

repository

demo

techStack

startDate

endDate

category

screenshots

architectureDiagram

and related articles.

Design a complete schema.

---

# KNOWLEDGE BASE STRATEGY

I want a digital garden.

Create structure for:

Permanent Notes

Concept Notes

Research Notes

Reference Notes

Maps of Content

Topic Hubs

Tag Pages

Connections

Backlinks

Suggested Related Reading

Design the folder structure and metadata strategy.

---

# LABS SECTION

The Labs section should contain:

AI Experiments

LLM Demos

Visualization Experiments

Prototype Applications

Interactive Learning Tools

Data Exploration Projects

Provide a scalable architecture.

---

# VISUALIZATION SECTION

I want interactive educational visualizations.

Examples:

Network Graphs

Arabic Root Relationships

Hadith Narrator Networks

University Statistics

Scheduling Visualizations

Machine Learning Explanations

Algorithm Demonstrations

Design reusable component architecture.

---

# CONTENT COLLECTION STRUCTURE

Propose complete Astro Content Collections.

Example categories:

content/
├── blog/
├── tutorials/
├── research/
├── projects/
├── notes/
├── labs/
├── bookmarks/
├── reading/
├── changelog/

Expand this significantly.

Use Astro best practices and Content Collections. Astro Content Collections should be the primary content management approach. See Astro documentation recommendations regarding schemas and typed content collections.

---

# FOLDER STRUCTURE

Create a complete production-grade folder structure.

Example:

src/
├── components/
├── layouts/
├── pages/
├── content/
├── styles/
├── lib/
├── hooks/
├── animations/
├── visualizations/
├── data/
├── utils/

Expand this into a real architecture.

Explain why each folder exists.

---

# COMPONENT ARCHITECTURE

Design components for:

Navigation

Footer

Article Layout

Project Layout

Timeline

Tag System

Search

Related Content

Callouts

Code Blocks

MDX Components

Charts

Graphs

Embeds

Interactive Demos

Knowledge Graphs

Create a hierarchy.

---

# MDX STRATEGY

I want MDX as the primary writing format.

Design:

Custom components

Code block enhancements

Callouts

Math rendering

Interactive embeds

Visualization embeds

Reference system

Footnotes

Article metadata

Reading progress

Table of contents

---

# SEO STRATEGY

Design:

Structured data

Open Graph

Sitemap

RSS

Atom

Canonical URLs

Tag pages

Series pages

Topic pages

Knowledge hub pages

Internal linking strategy

---

# FUTURE SUBDOMAIN STRATEGY

The main website should remain compatible with future migration into:

labs.domain.com

notes.domain.com

api.domain.com

graph.domain.com

research.domain.com

Without major refactoring.

Design content ownership boundaries from the beginning.

---

# OUTPUT FORMAT

Produce:

1. Complete architecture overview
2. Folder structure tree
3. Content collection schemas
4. Component hierarchy
5. Routing strategy
6. MDX strategy
7. Visualization architecture
8. Search architecture
9. SEO architecture
10. Future subdomain migration plan
11. 30-day implementation roadmap
12. Prioritized MVP version
13. Nice-to-have version
14. Long-term 3-year evolution plan

Be opinionated.

Act like a principal engineer designing a platform that will survive for many years rather than a simple portfolio website.
