# Contractor Money Tools — Codex Instructions

## Project purpose

Contractor Money Tools is an English-language web product for U.S. home-service business owners and contractors.

The product helps users understand the economics of employees, labor, pricing, jobs, overhead, equipment, and business profitability through practical calculators and supporting educational content.

The primary audience includes HVAC, plumbing, electrical, roofing, remodeling, landscaping, painting, cleaning, pest-control, and similar service businesses.

The project is currently an MVP.

## Core product principle

Tools are the product.
Articles support the tools.

Do not turn this project into a generic SEO blog or AI content farm.

Prefer useful calculators, transparent methodology, original calculations, examples, and decision-support tools over high volumes of generic content.

## Technical principles

- Prefer a simple static architecture suitable for Cloudflare Pages.
- Avoid backend services unless explicitly requested.
- Avoid databases unless explicitly requested.
- Avoid authentication unless explicitly requested.
- Avoid unnecessary frameworks and dependencies.
- Keep JavaScript and dependencies minimal.
- Calculator math must be separated from presentation/UI logic.
- Business formulas must be testable with unit tests.
- Use semantic HTML and accessible controls.
- Design mobile-first and responsive.
- Optimize for performance and Core Web Vitals.
- Do not add analytics, advertising, affiliate scripts, trackers, or third-party services unless explicitly requested.
- Do not publish or deploy anything unless explicitly requested.

## Content principles

All public-facing content is written in clear U.S. English.

Tone:
- professional;
- practical;
- concise;
- non-hype;
- aimed at small-business owners rather than accountants.

Avoid:
- generic AI filler;
- exaggerated marketing language;
- unsupported statistics;
- fake quotes;
- invented benchmarks;
- invented sources;
- claims such as "industry standard" unless supported by a reliable source.

Never invent factual data.

If current tax rates, regulations, benchmarks, costs, or other time-sensitive facts are needed, flag them for verification instead of guessing.

## Calculator principles

Every calculator must:

1. clearly state what question it answers;
2. expose important assumptions;
3. distinguish user-entered assumptions from factual values;
4. show understandable results;
5. provide methodology;
6. provide formulas in human-readable form;
7. validate impossible or invalid input;
8. avoid double-counting costs;
9. include unit tests for calculation logic;
10. work without requiring an account.

Calculator outputs must distinguish:
- cost;
- revenue;
- markup;
- margin;
- profit;
- productive hours;
- paid hours.

Do not treat markup and margin as interchangeable.

## Financial/legal positioning

This product provides business planning calculators and educational information.

Do not present tax, legal, accounting, investment, insurance, or financial advice.

Do not imply that calculator assumptions are universally applicable.

State when results depend on:
- state law;
- tax treatment;
- workers' compensation rates;
- insurance;
- employee classification;
- business-specific circumstances.

## UX principles

Primary result first.
Explanation second.

Default calculator flow:
- Quick inputs
- Result
- Improve accuracy / Advanced inputs
- Breakdown
- Insight / sensitivity
- Methodology
- FAQ

Do not overwhelm users with every possible input before they can see a result.

Prefer real-time calculation where appropriate.

## SEO principles

- One clear search intent per indexable page.
- One H1 per page.
- Unique title and meta description.
- Use internal linking naturally.
- Avoid doorway pages and near-duplicate keyword pages.
- Do not generate hundreds of pages by changing only numbers, cities, trades, or trivial keyword variants.
- Structured data must reflect visible page content and must not be added just for SEO decoration.

## Git and change discipline

Before editing:
- inspect the existing project structure;
- preserve working functionality;
- understand existing conventions.

After substantive changes:
- run relevant tests;
- run the build;
- report failures honestly;
- summarize files changed.

Do not:
- silently remove existing functionality;
- rewrite unrelated parts of the project;
- introduce large dependencies without explaining why;
- change architecture without explicit justification.

## Current MVP scope

Initial calculator family:

1. Labor Burden Calculator
2. True Employee Cost Calculator
3. Billable Hour Rate Calculator
4. Markup vs Margin Calculator
5. Job Profitability Calculator

Do not implement additional calculators unless explicitly requested.

## Deployment

Target hosting is Cloudflare Pages.

Do not connect Cloudflare, register domains, configure DNS, or deploy production changes unless explicitly requested.
