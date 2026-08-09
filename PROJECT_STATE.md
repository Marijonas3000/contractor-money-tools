# Contractor Money Tools — Project State

Canonical project status as of 2026-08-09.

Update this file only when production state, roadmap status, monetization status, or core methodology changes materially.

---

## 1. Project Positioning

**Current fact**

- Contractor Money Tools (CMT) is U.S.-focused.
- Audience: contractors, home-service businesses, owner-operators, and small trade/service businesses.
- Core domain: contractor business economics.
- Core economic chain: Labor Cost → Overhead → Pricing → Job Profitability.
- Product strategy is tool-first: calculators are the core product; guides support calculator intent.

**Current status**

- Primary early monetization paths: affiliate partnerships and qualified lead generation.
- SaaS/subscription is only a possible later layer and does not currently drive product decisions.
- Avoid intrusive advertising and low-quality affiliate content.
- Primary initial acquisition hypothesis: high-intent U.S. organic search → useful calculator / guide. Social, paid acquisition, email, and other distribution channels are not current priorities unless Strategy changes this based on evidence.

## Working ICP Hypothesis

Current working hypothesis — **not yet validated by CMT traffic or customer data**:

**Primary ICP:** U.S. trade/service contractor with roughly 2–20 employees, where the owner is still directly involved in estimating, pricing, and profitability decisions.

Priority trade segments for future validation:

- HVAC
- plumbing
- electrical
- roofing
- remodeling / residential general contracting

Core organizational condition:

**Too complex to price by gut feel, but still owner-led enough that enterprise software may be excessive.**

Current product hypothesis:

CMT may occupy a useful layer between spreadsheets/manual calculations and full field-service / contractor-management software.

CMT should remain focused on contractor business economics:

- what labor really costs;
- what overhead costs;
- what to charge;
- whether jobs perform as expected.

This does **not** authorize building a SaaS product.

Future calculator, content, affiliate, and paid-product ideas should be evaluated partly against this ICP, but the hypothesis must be revised if Search Console, GA4, affiliate, or future customer evidence contradicts it.

Do not add a fixed revenue range as part of the ICP yet.

## 30-Day Validation Scorecard — 2026-09-08

These are pre-committed decision thresholds set before seeing the 30-day results. They are internal strategy thresholds, not industry benchmarks.

### Acquisition / SEO

| Signal | Green | Yellow | Red |
| --- | --- | --- | --- |
| Important URLs indexed | >=90% | 60–89% | <60% |
| GSC impressions / 30 days | >=3,000 | 500–2,999 | <500 |
| Non-brand queries with impressions | >=30 | 10–29 | <10 |
| Pages receiving organic impressions | >=6 | 3–5 | 0–2 |
| Queries in Top 20 | >=5 | 1–4 | 0 |

### Engagement

| Signal | Green | Yellow | Red |
| --- | --- | --- | --- |
| Calculator starts | >=100 | 30–99 | <30 |
| Calculator completion rate | >=35% | 15–34% | <15% |
| Cross-calculator navigation rate | >=10% | 3–9% | <3% |

Important:

- completion and cross-navigation percentages should not be treated as strong evidence when sample size is very small;
- indexing alone is not considered validation;
- query breadth, ranking progress, and multiple CMT pages receiving visibility matter more than raw impressions alone.

### Affiliate / Monetization

By 2026-09-08:

- Green: at least one relevant affiliate partner approved;
- Yellow: applications pending or declined mainly because the site is newly launched / lacks traffic, with no structural CMT or LT-entity blocker;
- Red: core partner categories repeatedly reject CMT because of structural publisher, jurisdiction, or business-model incompatibility.

Affiliate revenue itself is not required for the first 30-day validation because monetized RecommendationSlots may not yet have been live long enough.

### Decision rules

- Mostly Green: Strategy may release HOLD and expand based on demonstrated search/product signals.
- Mostly Yellow: optimize pages already receiving Google signals; do not expand blindly.
- Acquisition Red with technically healthy indexing/site: do not solve the problem by simply adding more calculators. Reassess authority, distribution, positioning, and SEO opportunity.
- Acquisition Green + Engagement Red: improve product/UX/search-intent fit.
- Acquisition + Engagement Green + Monetization Red: evaluate higher-value lead generation and lightweight paid-utility experiments.

## 2. Production

| Item | Current fact/status |
| --- | --- |
| Domain | https://contractormoneytools.com |
| Hosting | Cloudflare Pages |
| Repository | https://github.com/Marijonas3000/contractor-money-tools |
| Production branch | `main` |
| Architecture | Astro + TypeScript + vanilla client-side JavaScript + Vitest |
| Output | Static HTML (`output: "static"`) |
| Deployment | GitHub `main` → automatic Cloudflare Pages deployment |
| Build command | `npm run build` |
| Build output | `dist/` |

## 3. LIVE Calculators

| Calculator | Production URL | Product job |
| --- | --- | --- |
| Labor Burden Calculator | https://contractormoneytools.com/calculators/labor-burden/ | Calculate true productive-hour employee labor cost. |
| True Employee Cost Calculator | https://contractormoneytools.com/calculators/true-employee-cost/ | Calculate total annual employer cost. |
| Contractor Hourly Rate Calculator | https://contractormoneytools.com/calculators/contractor-hourly-rate/ | Determine an owner/operator billing rate from compensation, overhead, billable capacity, and margin. |
| Contractor Markup Calculator | https://contractormoneytools.com/calculators/contractor-markup/ | Move from job cost through markup/margin to selling price. |
| Contractor Overhead Calculator | https://contractormoneytools.com/calculators/contractor-overhead/ | Express annual company overhead through multiple recovery views. |
| Contractor Job Profit & Costing Calculator | https://contractormoneytools.com/calculators/job-profit/ | Compare Estimated vs Actual job economics, profit, margin, and variances. |

## 4. LIVE Guides

| Guide | Production URL | Supported cluster |
| --- | --- | --- |
| Billable vs Non-Billable Hours for Contractors | https://contractormoneytools.com/guides/billable-vs-non-billable-hours-contractors/ | Contractor Hourly Rate / billable capacity |
| How to Use Labor Burden in Construction Estimates and Job Pricing | https://contractormoneytools.com/guides/labor-burden-construction-estimates/ | Labor Burden / estimating |
| Cost to Hire an Employee for Small Contractors | https://contractormoneytools.com/guides/cost-to-hire-an-employee/ | True Employee Cost / hiring cost |
| How to Allocate Overhead to Construction Jobs | https://contractormoneytools.com/guides/how-to-allocate-overhead-to-construction-jobs/ | Contractor Overhead / overhead allocation |
| Estimated vs Actual Job Costs: How Contractors Find Profit Leaks | https://contractormoneytools.com/guides/estimated-vs-actual-job-costs/ | Job Profit & Costing / variance diagnosis |

## 5. SEO Ownership / Cannibalization Decisions

### Labor Burden

- Calculator owns: labor burden calculator, labor burden formula/calculation, and fully burdened productive-hour cost.
- Estimating guide owns: applying burdened labor cost in estimates, bids, change orders, and job costing.

### Contractor Hourly Rate

- Calculator owns: contractor hourly rate calculation and owner/operator billable-rate economics.
- Billable-time guide owns: billable vs non-billable hours, contractor billable utilization, and what counts as billable time.

### Contractor Markup

- Calculator owns: contractor job markup, the markup/margin relationship, and selling price from job cost.
- There is **no separate near-term Markup vs Margin Calculator**.
- Markup ↔ margin conversion and education intentionally live inside Contractor Markup Calculator unless future Search Console evidence justifies a distinct micro-tool.

### Contractor Overhead

- Calculator owns: annual contractor overhead and overhead recovery views.
- Overhead-allocation guide owns: choosing and applying overhead allocation methods to jobs.

### Job Profit / Job Costing

- Job Profit and Job Costing are intentionally **one canonical calculator**: `/calculators/job-profit/`.
- Do not create separate `job-costing`, `job-profitability`, `construction-profit`, or `job-cost` calculator URLs.
- Calculator owns calculation and Estimated vs Actual comparison.
- Estimated-vs-Actual guide owns diagnostic/root-cause analysis.

## 6. Product Methodology Decisions

### Labor Burden

- Models employee productive-hour economics.
- Paid nonproductive time affects productive-hour cost; avoid PTO double counting.
- Employee-specific burden is distinct from company overhead.

### Contractor Hourly Rate

- Models owner/operator business pricing; billable hours ≠ total hours worked.
- Uses true margin math, not markup math.
- Does not calculate employee labor burden.

### Contractor Markup

- Markup uses the cost denominator; margin uses the selling-price denominator.
- Markup amount is not automatically final profit.
- Target-margin mode uses true margin math.
- Contractor job markup and margin education remain one tool.

### Contractor Overhead

- Core thesis: One annual overhead total → multiple recovery views.
- Views: % of revenue; per $1 direct labor; per $1 direct job cost; per productive field hour.
- No recovery basis is universally recommended.
- Overhead ≠ profit; this is a company-level calculator, not a job-profit calculator.

### Job Profit & Costing

- Direct Job Costs exclude Allocated Overhead.
- Contribution after direct costs is not Job Profit.
- Total Job Cost includes Allocated Overhead.
- Job Profit = revenue minus entered job costs and allocated overhead.
- Job Profit ≠ company Net Profit.
- Margin is N/A when revenue = 0.
- Variance = Actual − Estimated; margin change uses percentage points.

### Double counting

General CMT rule: do not recover the same cost twice across Labor Burden, direct job cost, allocated overhead, or the pricing model.

## 7. Shared Calculator Architecture

**Current fact**

- Page order: Intro / Calculator → Results → Methodology / explanation → RecommendationSlot → FAQ / Related Calculators.
- `CalculatorPageLayout` provides the shared structure.
- `RelatedCalculators` provides explicit internal related-tool links.
- `RecommendationSlot` is reusable and optional.
- Calculator engines remain pure TypeScript; calculator UI/scripts remain page-local where appropriate.
- Calculations run client-side; methodology is server-rendered and indexable.

**Current status — RecommendationSlot**

- Infrastructure exists.
- Affiliate/vendor content is **disabled and unconfigured**.
- An unconfigured slot renders no markup or spacing.
- Do not add affiliate links simply because the slot exists.
- Default monetization rule: one primary contextual recommendation per calculator result flow. Avoid affiliate comparison grids or multiple competing CTAs unless Strategy explicitly approves them.

## 8. Analytics / Privacy / Indexing

**Current fact**

- GA4 measurement ID: `G-PS80221W71`.
- Custom calculator events: `calculator_start`, `calculator_complete`, `calculator_navigation`.
- Custom event payloads intentionally contain calculator identifiers only—not financial inputs, results, margins, costs, revenue, profit, or variances.
- Google Consent Mode is implemented; analytics storage is denied by default.
- Users can Accept or Decline analytics; the choice persists in local browser storage.
- Ad storage, ad user data, and ad personalization remain denied.
- Privacy page: https://contractormoneytools.com/privacy/
- Robots permits crawling and declares the sitemap.
- Sitemap: https://contractormoneytools.com/sitemap-index.xml

**Current status — Search Console**

- Domain property `contractormoneytools.com` is verified.
- Sitemap was submitted successfully.
- Google discovered 7 URLs at the initial successful sitemap checkpoint; this is not the current indexed-page count.
- Do not manually resubmit the sitemap after every calculator or guide. Builds update it, and Google periodically reprocesses the submitted sitemap.

## 9. Affiliate Status

| Program | Current status |
| --- | --- |
| Jobber | Waiting for business-insurance clarification |
| Gusto | Auto-declined; manual reassessment requested and pending. |
| Patriot Software | Application submitted/under review |
| Impact | Account entity: UAB Metta; country: Lithuania |

No affiliate links or monetized RecommendationSlot content are currently live on CMT.

## 10. Current Development State

**Current status as verified 2026-08-09**

- Initial production infrastructure is live.
- Six calculators and five guides are live.
- Calculator #6 milestone is complete.
- Latest major content milestone: *Estimated vs Actual Job Costs: How Contractors Find Profit Leaks*.
- Tests: 201 passing across 7 test files.
- Astro check: 0 errors, 0 warnings, 0 hints.
- Static build: successful; 17 pages built; sitemap generated.
- Public production routes for the site shell, all calculators, all guides, privacy, robots, and sitemap returned HTTP 200.
- Git branch: `main`; upstream remote: `origin` at the repository URL above.
- Git working tree before this document was created: clean.
- Latest production commit: `9fe8685` — `feat: add estimated vs actual job costs guide`.

## 11. Roadmap Status

| Area | Current status |
| --- | --- |
| Initial build phase | **COMPLETE** |
| Calculator #7 | **HOLD** |
| Additional content production | **HOLD** |
| Development | **HOLD**, except bugs/technical issues |
| Affiliate responses | Event-driven |

HOLD does not mean cancelled. Do not invent Calculator #7 or start additional development from this document alone.

## 12. Checkpoints

### 2026-08-16

Short technical/indexation check:

- verify crawl/indexing health;
- detect technical problems;
- verify analytics and Search Console functioning.

Do not treat this as a full strategic pivot review unless a material technical issue appears.

### 2026-09-08

Full 30-day performance review. Base decisions on Google Search Console, GA4, affiliate/application outcomes, calculator usage, query/indexing evidence, and guide/content performance.

Future roadmap decisions should be evidence-driven. Do not resume Calculator #7 or broad content production simply because the build queue is empty.

---

## Final Operating Rule

Before starting future Development:

1. read `AGENTS.md`;
2. read `docs/PRODUCT.md`;
3. read `PROJECT_STATE.md`;
4. inspect current git status;
5. confirm Strategy has approved the next milestone.

`PROJECT_STATE.md` records current state. It does not itself authorize new roadmap work.
