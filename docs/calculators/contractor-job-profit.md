# Contractor Job Profit & Costing Calculator

## Product role

Primary question:

“Did this job perform as expected, and where did the difference come from?”

Primary market:
United States.

Primary audience:
small trade/service contractors, specialty contractors, remodelers, and small general contractors.

Canonical route:
/calculators/job-profit/

H1:
Contractor Job Profit & Costing Calculator

Primary SEO intent:
contractor job profit calculator

Secondary calculator intent on the SAME URL:
- job costing calculator
- construction job costing calculator
- estimated vs actual job costs
- contractor job profitability calculator
- job cost variance calculator

Do not create separate calculator URLs for:
- /calculators/job-costing/
- /calculators/job-profitability/
- /calculators/construction-profit/
- /calculators/job-cost/

## Core product model

Detailed-only V1.

Do not implement Quick mode in V1.

The calculator compares:

Estimated
vs
Actual

for:
- Job Revenue
- Labor
- Materials
- Subcontractors
- Equipment
- Other Direct Costs
- Allocated Overhead

The core diagnostic question is:

“Where did the job change?”

## Input groups

### Revenue

Estimated / Quoted Job Revenue

Actual Job Revenue

Revenue values:
- finite
- >= 0
- blank means unknown/not supplied
- explicit 0 is valid

### Direct Job Costs

Estimated and Actual for each:

- Labor
- Materials
- Subcontractors
- Equipment / Job-Specific Equipment
- Other Direct Costs

Cost values:
- finite
- >= 0
- blank may behave as zero for arithmetic
- blank must still remain distinguishable from explicit zero for UI state logic

### Allocated Overhead

Estimated Allocated Overhead

Actual Allocated Overhead

Use dollar amounts only.

Do not calculate overhead percentage or annual company overhead here.

## Core formulas

For each side:

Direct Job Costs =
Labor
+ Materials
+ Subcontractors
+ Equipment
+ Other Direct Costs

Contribution after direct costs =
Revenue - Direct Job Costs

Total Job Cost =
Direct Job Costs + Allocated Overhead

Job Profit =
Revenue - Total Job Cost

Job Margin =
Job Profit / Revenue × 100
only when Revenue > 0

Markup on Entered Job Cost =
Job Profit / Total Job Cost × 100
only when Total Job Cost > 0

Markup is secondary.

Contractor Markup Calculator continues to own pricing/markup intent.

## Terminology guardrail

Never label Job Profit as:
- Net Profit
- Net Income
- Company Profit
- Business Net Profit

Required visible helper:

“Job Profit reflects revenue minus the job costs and allocated overhead entered here. It is not necessarily company net profit.”

Prefer:
- Contribution after direct costs
- Job Profit after allocated overhead

Do not use Gross Profit as a primary headline metric.

## Profit / loss / break-even semantics

If Job Profit > 0:
UI label:
Job Profit

If Job Profit < 0:
UI label:
Job Loss

Display absolute dollar loss amount while preserving signed engine value.

If Job Profit = 0:
UI interpretation:
Break-even on entered job costs

Do not call negative Job Profit company net loss.

## Zero revenue

Revenue = 0 is valid.

Still calculate:
- Direct Job Costs
- Total Job Cost
- Job Profit / Loss

But:

Job Margin = null / N/A

Required helper:

“Margin cannot be calculated when job revenue is zero.”

Do not produce:
- NaN
- Infinity
- -Infinity
- invented 100% or -100% margins

## Negative revenue / costs

Negative revenue:
invalid.

Message concept:
“Job revenue cannot be negative in this calculator.”

Negative individual costs:
invalid.

Message concept:
“Enter the net cost assigned to this job. Cost fields cannot be negative.”

Costs greater than revenue are valid.

Negative Job Profit is valid.

## Blank vs zero

Engine:
- undefined/null means unknown/not supplied
- explicit 0 means supplied as zero
- blank cost categories normalize to zero for arithmetic
- blank presence must be retained enough to determine whether a side is meaningful

An entirely blank estimated side returns no estimated performance result.

An entirely blank actual side returns no actual performance result.

UI:
- untouched blanks must not become meaningful zeros
- pristine all-zero/blank page shows neutral state
- do not show $0 Job Profit / N/A hero on first load

## Partial-side behavior

Estimated-only:
- show Estimated Contribution
- Estimated Total Job Cost
- Estimated Job Profit / Loss
- Estimated Job Margin
- hide actual comparison and variance blocks

Actual-only:
- show Actual Direct Job Costs
- Actual Total Job Cost
- Actual Job Profit / Loss
- Actual Job Margin
- hide estimated comparison and variances

If a side contains costs but no revenue:
- cost subtotals may be shown
- do not claim Job Profit or Job Margin for that side until revenue is supplied

Both sides:
- show full comparison and variance diagnosis

## Actual Revenue copy behavior

Implement in UI only:

When Estimated Revenue is first entered:
- if Actual Revenue is untouched and blank,
  copy Estimated Revenue into Actual Revenue

Once user manually edits Actual Revenue:
- never synchronize again

If manually edited Actual Revenue is later cleared:
- keep it independent
- do not resume auto-sync

Do not auto-copy cost categories.

The calculation engine must remain stateless and know nothing about this behavior.

## Variances

All variance formulas:

Actual - Estimated

Required:

Revenue Variance

Labor Variance

Materials Variance

Subcontractors Variance

Equipment Variance

Other Direct Costs Variance

Allocated Overhead Variance

Direct Job Cost Variance

Contribution Change

Total Job Cost Variance

Job Profit Variance

Margin Change

Margin Change =
Actual Job Margin - Estimated Job Margin

Display in percentage points.

If either margin is undefined:
Margin Change = null.

## Variance interpretation

Revenue / profit:

Positive:
above estimate / higher than estimate

Negative:
below estimate / lower than estimate

Costs:

Positive:
over estimate / unfavorable

Negative:
under estimate / favorable

Zero:
matched estimate

Do not rely only on color.

Always show textual interpretation.

## Contribution

Contribution after direct costs =
Revenue - Direct Job Costs

Helper:

“Revenue remaining after directly assigned job costs, before allocated overhead.”

Do not call Contribution profit.

## Markup

Secondary metric:

Markup on Entered Job Cost =
Job Profit / Total Job Cost × 100

Only when Total Job Cost > 0.

If Total Job Cost = 0:
markup = null.

Keep markup secondary.

Do not turn this page into a selling-price calculator.

## Rule-based insights

Include V1 deterministic insights only.

Approved insight patterns:

1. Revenue increased but Job Profit fell

“Revenue increased, but higher costs more than offset the gain.”

2. Revenue unchanged and Job Profit fell

“The job missed its expected profit because actual costs were higher than estimated.”

3. Job Profit improved

“The job performed above the expected profit under the costs entered.”

4. Contribution positive but Job Profit negative

“The job covered its direct costs but did not fully cover the allocated overhead entered.”

Do not implement AI diagnosis.

Do not implement “largest unfavorable variance” in V1.

## Result hierarchy

When Actual performance exists:

Primary hero:
Actual Job Profit
or Job Loss

Companion:
Actual Job Margin

Interpretation:

Positive:
“The job produced $X after the actual job costs and allocated overhead entered here.”

Negative:
“The job lost $X after the actual job costs and allocated overhead entered here.”

Show the Job Profit ≠ company net profit helper nearby.

When only Estimated exists:
use Estimated Job Profit / Loss as primary.

## Estimated vs Actual summary

When both sides are meaningful, show:

- Revenue
- Direct Job Costs
- Contribution
- Allocated Overhead
- Total Job Cost
- Job Profit
- Job Margin

Values:
Estimated
Actual
Change

Desktop:
may use table/grid.

Mobile:
must not require horizontal scrolling.

Use stacked/adaptive rows.

## Cost variance breakdown

Show:

- Labor
- Materials
- Subcontractors
- Equipment
- Other Direct Costs
- Allocated Overhead

Each:
- Estimated
- Actual
- Variance
- textual interpretation

Do not implement sorting or largest-variance insight in V1.

## Internal links

### Labor

Near Labor helper:

“Need to determine the true productive-hour cost of employee labor first? Use the Labor Burden Calculator.”

Destination:
/calculators/labor-burden/

### Allocated Overhead

Near Allocated Overhead:

“Need to determine how much company overhead your jobs need to recover? Start with the Contractor Overhead Calculator.”

Destination:
/calculators/contractor-overhead/

Optional methodology link if useful:
https://contractormoneytools.com/guides/how-to-allocate-overhead-to-construction-jobs/

Do not over-link.

### Contractor Markup

Post-result / next-job context:

“Reviewing why this job missed its target? Use the Contractor Markup Calculator when setting the selling price for the next job.”

Destination:
/calculators/contractor-markup/

Do not imply Markup is mandatory.

## Required reciprocal link

Update later during implementation:

Contractor Markup Calculator

Add:

“Once the job is complete, compare estimated and actual job profitability.”

Destination:
/calculators/job-profit/

This is the priority reciprocal link.

Do not force Labor Burden or Contractor Overhead reciprocal Job Profit links in V1.

## Approved worked example

Use EXACTLY these values.

Do not change them.

### Estimated

Revenue:
$20,000

Labor:
$5,000

Materials:
$4,000

Subcontractors:
$2,000

Equipment:
$500

Other Direct Costs:
$500

Allocated Overhead:
$2,000

Derived:

Direct Job Costs:
$12,000

Contribution after direct costs:
$8,000

Total Job Cost:
$14,000

Job Profit:
$6,000

Job Margin:
30.0%

### Actual

Revenue:
$21,000

Labor:
$6,000

Materials:
$4,500

Subcontractors:
$2,000

Equipment:
$700

Other Direct Costs:
$500

Allocated Overhead:
$2,200

Derived:

Direct Job Costs:
$13,700

Contribution after direct costs:
$7,300

Total Job Cost:
$15,900

Job Profit:
$5,100

Job Margin:
approximately 24.3%

### Variance interpretation

Revenue:
+$1,000

Direct Job Costs:
+$1,700

Allocated Overhead:
+$200

Total Job Cost:
+$1,900

Job Profit:
-$900

Job Margin Change:
approximately -5.7 percentage points

Approved interpretation:

Revenue increased by $1,000, but total job cost increased by $1,900, so actual Job Profit finished $900 below estimate and Job Margin fell from 30.0% to approximately 24.3%.

Do not change these numbers or wording during Development implementation.

## Methodology sections

Landing page should publish crawlable content for:

- How to use the Job Profit & Costing Calculator
- Estimated vs actual job costing
- What counts as Direct Job Costs?
- Contribution after direct costs
- How allocated overhead affects job profitability
- How Job Profit is calculated
- Job Margin vs Markup
- Worked example
- Common reasons a job misses expected profit
- How to improve the next estimate
- FAQ

Do not make this generic accounting software content.

## Methodology formulas

Publish:

Direct Job Costs =
Labor + Materials + Subcontractors + Equipment + Other Direct Costs

Contribution after direct costs =
Revenue - Direct Job Costs

Total Job Cost =
Direct Job Costs + Allocated Overhead

Job Profit =
Revenue - Total Job Cost

Job Margin =
Job Profit / Revenue

when Revenue > 0

Markup on Entered Job Cost =
Job Profit / Total Job Cost

when Total Job Cost > 0

Revenue Variance =
Actual Revenue - Estimated Revenue

Category Cost Variance =
Actual Cost - Estimated Cost

Direct Job Cost Variance =
Actual Direct Job Costs - Estimated Direct Job Costs

Contribution Change =
Actual Contribution - Estimated Contribution

Total Job Cost Variance =
Actual Total Job Cost - Estimated Total Job Cost

Job Profit Variance =
Actual Job Profit - Estimated Job Profit

Margin Change =
Actual Job Margin - Estimated Job Margin

in percentage points

## Job Margin vs Markup

Keep concise.

Margin:
Profit / Revenue

Markup:
Profit / Cost

Explain denominator difference.

Link to Contractor Markup Calculator.

Do not reproduce full markup-calculator methodology.

## Common reasons a job misses expected profit

Keep brief and aligned to approved brief:

- labor hours/cost above estimate
- material cost changes
- missed subcontractor scope
- change orders not fully priced
- unallocated job costs
- overhead recovery mismatch
- estimating assumptions outdated

Do not drift into broad management advice.

## Improve the next estimate

Use concise workflow:

1. Identify the largest meaningful variance.
2. Determine whether it came from price, quantity, productivity, or scope.
3. Update estimating assumptions.
4. Confirm labor and overhead cost basis.
5. Reprice future work consistently.

This is editorial workflow only.

Do NOT implement the deferred automatic “largest unfavorable variance” calculator insight.

## RecommendationSlot

Use existing RecommendationSlot.

Position under current shared calculator architecture.

Keep unconfigured.

No affiliate content.
No brands.
No behavioral recommendation logic.
No placeholder CTA.

## FAQ

Include:

- What is job profit?
- How do you calculate profit on a construction job?
- What is job margin?
- What is the difference between job margin and markup?
- What costs should be included in job costing?
- Why compare estimated and actual job costs?
- Is Job Profit the same as company net profit?
- What if a job loses money?

The company-net-profit answer must clearly be:
No.

Do not use FAQPage schema in V1 unless the shared calculator schema policy changes later.

## Structured data

Follow current CMT calculator policy.

Existing calculators currently use only sitewide Organization schema.

Do not add WebApplication/SoftwareApplication/Breadcrumb schema only to this calculator.

Structured-data consistency across calculators should be handled separately if Strategy later approves it.

## Analytics

Calculator ID:
job_profit

Path:
/calculators/job-profit/

Use existing safe events:
- calculator_start
- calculator_complete
- calculator_navigation

Completion should require a valid visible Estimated or Actual performance result.

Never send:
- revenue
- costs
- overhead
- contribution
- profit
- margin
- markup
- variances
- any financial input/result

## SEO

Canonical:
/calculators/job-profit/

H1:
Contractor Job Profit & Costing Calculator

SEO title:
Contractor Job Profit Calculator & Job Costing Tool | CMT

Meta description:
Compare estimated and actual job revenue, labor, materials, subcontractors, overhead, profit, and margin to see where a contractor job gained or lost profitability.

Primary:
contractor job profit calculator

Secondary on same URL:
- job costing calculator
- construction job costing calculator
- estimated vs actual job costs
- contractor job profitability calculator
- job cost variance calculator

Do not create duplicate close-intent calculator URLs.

## Homepage / calculator index

Eventually add Calculator #6.

Homepage question:

“Did this job perform as expected, and where did the difference come from?”

Calculator index description should emphasize:
Estimated vs Actual revenue, direct costs, allocated overhead, Job Profit, Job Margin, and variances.

Do not redesign either page.

## Roadmap docs

During implementation:
- add Contractor Job Profit & Costing Calculator as Calculator #6 to AGENTS.md
- add it as #6 to docs/PRODUCT.md

Do not clean the old “Billable Hour Rate Calculator” naming in this task.

## Validation / engine requirements

All supplied numeric values:
- finite
- >= 0

Blank:
unknown/not supplied

Blank costs:
zero for arithmetic when side is meaningful

Revenue:
0 valid
negative invalid

Cost:
0 valid
negative invalid

If any calculated numeric output becomes non-finite:
return structured calculation_overflow.

Engine must remain pure and stateless.

## Required tests

At minimum cover:

- estimated baseline
- actual baseline
- all direct-cost categories
- contribution
- total job cost
- job profit
- job margin
- markup-on-cost
- revenue 0 with costs 0
- revenue 0 with costs > 0
- null margin on zero revenue
- no NaN/Infinity
- positive Job Profit
- Job Loss
- break-even
- negative margin with positive revenue
- positive revenue + zero costs = 100% margin
- negative revenue invalid
- every negative cost field invalid
- blank cost normalization
- explicit zero behavior
- decimal values
- large finite values
- overflow protection
- estimated-only
- actual-only
- both sides
- every required variance
- positive/negative variance directions
- margin change in percentage points
- direct costs exclude overhead
- total cost includes overhead exactly once
- contribution - overhead = Job Profit
- entirely blank input produces no meaningful result

Add more where useful.

## Mobile UX

Do not use horizontally scrolling Estimated-vs-Actual input tables.

Recommended category layout:

Category

Estimated
[input]

Actual
[input]

At desktop/tablet:
category + Estimated + Actual columns are acceptable.

At mobile:
stack intelligently.

Results summary must also avoid horizontal scrolling.

Do not add sticky result overlay.

## V1 exclusions

Do not implement:
- Quick mode
- WIP
- revenue recognition
- committed costs
- purchase orders
- invoices/collections
- cash flow
- taxes
- annual company profitability
- automatic overhead allocation
- Labor Burden calculation
- recommended selling price
- detailed cost codes/phases
- database
- project accounts
- multi-job tracking
- schedules
- earned value
- AI diagnosis
- automatic largest-unfavorable-variance insight

## Future integration

No persistent project storage.

No automatic state transfer required.

Future Strategy may connect:
Labor Burden
→ Overhead
→ Markup
→ Job Profit

but V1 remains a static one-job calculator.
