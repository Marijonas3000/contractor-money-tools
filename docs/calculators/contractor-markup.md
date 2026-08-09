# Contractor Markup Calculator

## Product role

Primary question:

“I know what this job costs me. What selling price do I get when I apply my markup?”

Primary market:
United States.

Primary audience:
owner-operators, small trade/service contractors, remodelers, specialty contractors, and small general contractors.

Primary URL:
/calculators/contractor-markup/

Primary H1:
Contractor Markup Calculator

Primary SEO intent:
contractor markup calculator

The page must remain focused on job cost → markup/margin → selling price.

Do not expand scope into:
- employee labor burden calculation;
- annual business overhead calculation;
- owner hourly-rate calculation;
- full quantity-based estimating;
- actual job profitability tracking.

## Calculation modes

Three modes:

1. Add markup
   - default
   - cost + markup → selling price

2. Target margin
   - cost + target margin → selling price + required markup

3. Check a price
   - cost + selling price → actual markup + actual margin

## Cost entry modes

Support two mutually exclusive methods.

### Cost breakdown — default

Inputs:

- Labor
- Materials
- Subcontractors
- Equipment / other direct job costs
- Allocated overhead for this job

Total entered job cost =
labor
+ materials
+ subcontractors
+ equipment/other
+ allocated overhead

Zero in an individual category is valid.
Negative category values are invalid.
Combined entered job cost must be > 0.

### Enter total cost — secondary

Input:

- Total job cost

Must be > 0.

Cost breakdown values and total-cost values may be preserved in the UI when switching, but only the active representation may be sent into the calculation engine.

Never add the total-cost field to category costs.

## Core formulas

Percentage inputs use percentage points:
25 means 25%.

### Add markup

Markup Amount =
Entered Job Cost × Markup %

Selling Price =
Entered Job Cost × (1 + Markup %)

Equivalent Margin =
Markup Amount ÷ Selling Price

Equivalent formula:
Markup / (1 + Markup)

Cost Multiplier =
Selling Price ÷ Entered Job Cost

### Target margin

Selling Price =
Entered Job Cost ÷ (1 - Target Margin)

Markup Amount =
Selling Price - Entered Job Cost

Required Markup % =
Markup Amount ÷ Entered Job Cost

Margin % =
Target Margin

Cost Multiplier =
Selling Price ÷ Entered Job Cost

### Check a price

Markup Amount =
Selling Price - Entered Job Cost

Markup % =
(Selling Price - Entered Job Cost) ÷ Entered Job Cost

Margin % =
(Selling Price - Entered Job Cost) ÷ Selling Price

Cost Multiplier =
Selling Price ÷ Entered Job Cost

## Below-cost behavior

In Check a price mode, selling price below entered job cost is VALID.

Return:
- negative markup amount;
- negative markup percentage;
- negative margin percentage;
- isBelowCost = true.

Do not reject it.

The UI must clearly communicate that the selling price is below the entered cost basis.

Do not describe the negative result as profit or “markup earned.”

## Terminology

Preferred output labels:

- Selling / bid price
- Entered job cost
- Markup amount
- Markup
- Equivalent margin / Target margin / Actual margin depending on mode
- Cost multiplier

Do not automatically call markup amount “profit”.

Include this concept in methodology:

“This is the margin relative to the costs entered here. It is not necessarily your final net profit margin if additional overhead or business costs still need to be recovered.”

## Inputs by mode

Shared:
- cost entry mode
- active cost input representation

Add markup:
- Markup %

Default markup may be a simple editable planning assumption, but do not imply a recommended contractor benchmark unless explicitly provided later.

Target margin:
- Target margin %

Check a price:
- Selling / bid price

## Validation

All active numeric inputs must be finite.

Cost breakdown:
- individual cost categories >= 0
- combined cost > 0

Total cost:
- totalJobCost > 0

Add markup:
- markupPercent >= 0
- 0% valid

Target margin:
- targetMarginPercent >= 0
- targetMarginPercent < 100
- 0% valid

Check price:
- sellingPrice > 0
- price below cost valid

Inactive fields are not validated.

If a mathematically valid input produces a non-finite result, return a structured calculation overflow/error rather than Infinity or NaN.

Validation errors should be structured and field-specific where practical.

## Successful result shape

The calculation engine should return enough information to support:

- mode
- costEntryMode
- enteredJobCost
- markupAmount
- markupPercent
- marginPercent
- sellingPrice
- costMultiplier
- isBelowCost

Preserve full precision in the engine.
UI owns display rounding.

Normalize visible negative zero in UI if necessary; do not mutate legitimate engine precision merely for display.

## Primary result

Selling / bid price is always the dominant result.

Examples:

Add markup:
“Your $10,000 job becomes a $12,500 quote at 25% markup.”

Target margin:
“To achieve a 25% margin on the entered cost basis, the selling price is about $13,333.33.”

Check price:
“At a $12,500 selling price, this job carries a 25% markup and 20% margin on the entered cost basis.”

If below cost:
visually warn that the proposed selling price is below the entered job cost.

## Result breakdown

Show mode-appropriate values including:

- Entered job cost
- Selling / bid price
- Markup amount
- Markup %
- Margin %
- Cost multiplier

For cost-breakdown mode, also show the active cost categories clearly.

## Markup vs margin education

This section is REQUIRED and belongs on this page.

Use the concept:

$10,000 cost
+ 25% markup
= $12,500 selling price

Markup amount:
$2,500

Equivalent margin:
20%

Then explain:

If the target is 25% margin instead:

Selling price:
$13,333.33

Required markup:
approximately 33.33%

Explain clearly:

- markup uses cost as its denominator;
- margin uses selling price as its denominator;
- the percentages are therefore not interchangeable.

Do not create or imply a separate near-term Markup vs Margin calculator.

## Overhead treatment

Input label:

Allocated overhead for this job

Use a dollar value in V1.

Do not calculate overhead automatically.

Methodology must state:

Enter the job costs and allocated overhead you want this markup applied to. Do not include the same cost both here and elsewhere in your pricing model.

Do not claim there is one universal contractor overhead-allocation convention.

## Internal links

### Labor input

Context:
Using employees? Start with their true productive-hour labor cost.

Anchor:
Labor Burden Calculator

Destination:
/calculators/labor-burden/

### Owner-time pricing distinction

Context:
Pricing your own billable time rather than marking up a complete job cost?

Anchor:
Contractor Hourly Rate Calculator

Destination:
/calculators/contractor-hourly-rate/

### Methodology guide

Context:
Before marking up employee labor, make sure the estimate starts from fully burdened labor cost rather than base wages.

Anchor:
use labor burden correctly in estimates

Destination:
/guides/labor-burden-construction-estimates/

Avoid unnecessary duplicate internal links.

## Shared page architecture

Use existing CMT calculator architecture:

1. Intro / calculator
2. Results
3. Methodology / explanation
4. Optional Recommendation slot
5. FAQ / Related calculators

Recommendation slot must remain unconfigured and render nothing.

## UX

- Real-time calculations
- No Calculate button
- Mobile-first
- Existing CMT visual system
- No client UI framework
- No third-party UI dependencies
- No signup/account requirement
- No horizontal overflow around 390×844
- Input font size at least 16px on mobile
- Clear accessible mode selector
- Clear accessible cost-entry selector
- Dominant selling-price result
- Below-cost state visually distinct but not alarmist
- Inactive cost fields hidden and disabled

Default UX:
- calculation mode: Add markup
- cost entry mode: Cost breakdown

On switching cost-entry mode:
- preserve values in both modes;
- recalculate immediately from active representation only;
- no double counting.

## Methodology

Server-rendered/indexable methodology should publish these formulas:

Selling Price = Cost × (1 + Markup)

Markup % = (Selling Price − Cost) ÷ Cost

Margin % = (Selling Price − Cost) ÷ Selling Price

Price from Target Margin = Cost ÷ (1 − Margin)

Also explain:
- markup amount is not automatically net profit;
- entered cost basis matters;
- allocated overhead is user-entered;
- employee labor should use an appropriate internal labor-cost basis;
- this calculator is business planning/educational information, not tax, accounting, legal, or financial advice.

## FAQ

Include concise useful FAQs around:
- What is contractor markup?
- What is the difference between markup and margin?
- What margin does 25% markup produce?
- What markup gives a 25% margin?
- Should contractors mark up labor and materials?
- Should overhead be included before markup?
- What if my selling price is below my job cost?

Do not invent universal recommended markup percentages.

## SEO

Primary:
contractor markup calculator

Support naturally:
- construction markup calculator
- general contractor markup calculator
- contractor job markup
- construction job markup
- contractor pricing
- job cost plus markup
- markup on labor and materials
- target margin
- reverse markup calculation

Do not create separate pages for these variants.

Page title/meta should remain contractor job-pricing focused, with margin education subordinate to markup intent.

No separate Markup vs Margin calculator in near-term roadmap.

## Analytics

Future implementation must register calculator ID/path consistently with existing analytics infrastructure.

Recommended calculator ID:
contractor_markup

Path:
/calculators/contractor-markup/

Do not send:
- cost inputs
- markup inputs
- margin inputs
- selling prices
- calculated financial values

Only use existing safe calculator event semantics.

## Unit tests required

At minimum cover:

### Add markup
1. baseline
2. 0% markup
3. 25% markup → 20% margin
4. decimal values
5. large finite values
6. overflow handling

### Target margin
7. baseline
8. 0% margin
9. 20% margin
10. 25% margin → approximately 33.333...% markup
11. margin = 100 invalid
12. margin > 100 invalid
13. negative margin invalid

### Check price
14. normal profitable price
15. price equal to cost
16. price below cost returns negative values and isBelowCost
17. selling price = 0 invalid
18. negative selling price invalid
19. decimal values

### Cost breakdown
20. every cost category contributes correctly
21. allocated overhead included once
22. zero-valued categories valid
23. all categories zero invalid

### Total cost mode
24. total-cost-only baseline
25. zero total cost invalid
26. negative total cost invalid
27. inactive cost representation ignored
28. no double counting between total and category modes

### Cross-mode
29. equivalent Add Markup and Check Price inputs produce consistent results
30. equivalent Target Margin and Check Price inputs produce consistent results

Add more tests where useful.

## Future integration

Future Job Profit / Job Costing Calculator may consume:
- enteredJobCost
- sellingPrice
- markupPercent
- marginPercent

Do not implement that integration now.

## Scope guardrail

Do not implement:
- Contractor Overhead Calculator logic
- Job Profit logic
- full estimate builder
- cost quantity estimating
- recommended industry markup benchmarks
- affiliate content

