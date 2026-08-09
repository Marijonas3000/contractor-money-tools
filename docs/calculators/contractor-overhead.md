# Contractor Overhead Calculator

## Product role

Primary question:

“How much indirect business cost do I need to recover, and what does that overhead look like using different recovery bases?”

Primary market:
United States.

Primary audience:
owner-operators, small trade/service contractors, specialty contractors, remodelers, and small general contractors.

Primary URL:
/calculators/contractor-overhead/

Primary H1:
Contractor Overhead Calculator

Primary SEO intent:
contractor overhead calculator

Core product thesis:

One annual overhead total
→ multiple recovery views

Do not reduce the product to one generic “overhead rate.”

## Scope guardrail

This calculator is company-level.

Do not implement:
- job profit;
- job-level actual profitability;
- target profit;
- final bid price;
- markup;
- employee labor burden;
- owner hourly-rate calculation.

Overhead is cost, not profit.

## Overhead entry modes

Support two mutually exclusive modes.

### Detailed mode — default

Annual dollar inputs:

1. Office / shop
2. Administrative payroll
3. Insurance / bonding
4. Vehicles / transportation overhead
5. Software / communications
6. Marketing / sales
7. Professional / compliance
8. Equipment / shop overhead
9. Other overhead

All category values:
- annual USD amounts;
- finite;
- >= 0.

Total Annual Overhead =
sum of all active categories.

Combined total must be > 0 for a valid calculation.

Do not add subcategory inputs in V1.

### Simple mode

Label concept:
Already know your annual overhead?

Input:
Total annual overhead

Must be:
- finite;
- > 0.

Detailed and simple representations are mutually exclusive.

The UI may preserve values in both modes, but only the active representation may be validated and calculated.

Never combine them.

## Primary outputs

Total Annual Overhead

Monthly Overhead =
Annual Overhead / 12

Weekly Overhead =
Annual Overhead / 52

Weekly convention should use exactly 52 weeks.

## Recovery inputs

All recovery denominators are optional and independent.

### Annual revenue

Optional.

If omitted / blank / null:
- no revenue recovery output.

If provided:
- finite;
- > 0.

Unlocks:

Overhead as % of Revenue =
Annual Overhead / Annual Revenue × 100

### Annual direct labor cost

Optional.

If omitted:
- suppress direct-labor recovery view.

If provided:
- finite;
- > 0.

Unlocks:

Overhead per Direct Labor Dollar =
Annual Overhead / Annual Direct Labor Cost

Equivalent % of Direct Labor Cost =
same ratio × 100

Primary display should be:
$X overhead per $1 of direct labor

Equivalent percentage is secondary.

### Annual direct job costs

Optional.

If omitted:
- suppress direct-cost recovery view.

If provided:
- finite;
- > 0.

Unlocks:

Overhead per Direct-Cost Dollar =
Annual Overhead / Annual Direct Job Costs

Equivalent % of Direct Job Cost =
same ratio × 100

Primary display:
$X overhead per $1 of direct job cost

Equivalent percentage is secondary.

### Annual productive field labor hours

Optional.

If omitted:
- suppress productive-hour recovery view.

If provided:
- finite;
- > 0.

Unlocks:

Overhead per Productive Field Hour =
Annual Overhead / Annual Productive Field Hours

## Optional-output behavior

Recovery outputs must be independent.

A user may supply:
- none;
- one;
- several;
- all four denominators.

Missing denominator:
- valid;
- corresponding recovery result = null / omitted.

Explicit zero or negative denominator:
- validation error.

One invalid provided denominator makes the calculation invalid and should return structured field-specific errors.

Recovery denominators never alter Total Annual Overhead.

## Successful result shape

The calculation result should support:

- overheadEntryMode
- totalAnnualOverhead
- monthlyOverhead
- weeklyOverhead

Optional nested results:

revenueRecovery:
- annualRevenue
- overheadAsPercentOfRevenue

directLaborRecovery:
- annualDirectLaborCost
- overheadPerDollar
- overheadAsPercentOfBase

directCostRecovery:
- annualDirectJobCosts
- overheadPerDollar
- overheadAsPercentOfBase

productiveHourRecovery:
- annualProductiveFieldHours
- overheadPerProductiveFieldHour

Missing recovery view should be null.

Preserve full precision in the engine.
UI owns display rounding.

## Recovery-view interpretation

Required concept:

“These rates recover the same annual overhead using different allocation bases. The best basis depends on how your business prices and tracks work.”

Do not label any one result simply:

“Your overhead rate”

Do not automatically recommend:
- revenue-based recovery;
- labor-based recovery;
- direct-cost recovery;
- hourly recovery.

## Required worked comparison

Explain:

$100,000 overhead / $500,000 revenue
= 20% of revenue

but:

$100,000 overhead / $400,000 direct job cost
= 25% of direct cost

These two ratios describe the same annual overhead using different denominators.

They are not interchangeable.

## Overhead vs Labor Burden boundary

Labor Burden owns employee-specific productive-hour cost concepts.

Contractor Overhead owns company-level indirect costs.

Required warning:

Do not include the same cost in both labor burden and business overhead if your pricing model would recover it twice.

### Administrative payroll helper

Administrative payroll means company-level administrative/office payroll selected for overhead recovery, such as office management, dispatching, bookkeeping/admin, or other indirect payroll.

Do not imply that direct field labor belongs here.

Do not include employee costs already classified in direct labor or Labor Burden if that would recover them twice.

### Insurance / bonding helper

Use company-level insurance and bonding overhead selected for overhead recovery.

Avoid double counting:
- workers’ compensation already included in Labor Burden;
- job-specific insurance directly charged to jobs;
- other insurance already classified elsewhere.

### Vehicles / transportation helper

Use indirect fleet/transportation costs treated as company overhead.

Exclude vehicle, mileage, travel, delivery, or transportation costs directly job-costed elsewhere.

## Overhead vs profit

Required methodology:

Overhead is a business cost.
Profit is not included in overhead.

Do not calculate:
- target profit;
- net profit;
- markup;
- final selling price;
- final job margin.

## Overhead vs Contractor Hourly Rate

Contractor Hourly Rate owns:

desired owner compensation
+ annual overhead
+ billable capacity
+ target margin
→ required hourly billing rate.

Contractor Overhead answers:

“What should I put in the annual overhead field?”

## Overhead vs Contractor Markup

Contractor Markup owns job-cost → selling-price logic.

Contractor Overhead may provide recovery views that help a contractor decide how overhead is allocated, but it must not calculate the final markup or bid price.

## Validation

Validate only active overhead representation.

Detailed mode:
- every category finite;
- every category >= 0;
- total > 0.

Simple mode:
- totalAnnualOverhead finite;
- > 0.

Optional recovery denominators:
- omitted / undefined / null valid;
- explicitly provided values must be finite and > 0.

Unsupported entry mode:
structured error.

All calculated outputs must be finite.

If an otherwise valid input produces Infinity or NaN:
return calculation_overflow.

UI should map field identifiers to human-readable labels.

Engine should remain strict even if UI uses a neutral pristine state before first interaction.

## Pristine UI behavior

Detailed fields may default to blank/zero rather than invented contractor benchmarks.

Before the user has interacted and all overhead values are zero:
- UI may show a neutral instructional state;
- avoid an aggressive validation error on first load.

The calculation engine itself should still consider total overhead = 0 invalid.

## UX hierarchy

Use existing CMT calculator architecture:

1. Intro / calculator
2. Results
3. Methodology / explanation
4. Optional Recommendation slot
5. FAQ / Related calculators

Calculator-specific flow:

1. Intro
2. Overhead-entry selector
3. Active overhead inputs
4. Total Annual Overhead result
5. Optional recovery-base inputs
6. Recovery-view cards
7. What these numbers mean
8. Methodology and boundaries
9. Recommendation slot
10. FAQ / Related calculators

Recovery-base inputs should come AFTER the total annual-overhead result.

This reinforces:
first determine overhead,
then choose how to view its recovery.

## Mobile / accessibility

- mobile-first;
- approximately 390×844;
- no horizontal page overflow;
- numeric inputs >=16px;
- accessible segmented selector;
- clear labels/helper text;
- recovery cards stack cleanly;
- optional denominator inputs should not overwhelm the first viewport;
- real-time calculations;
- no Calculate button if reliable;
- no signup/account;
- no UI framework;
- no third-party UI dependencies.

## Internal links into Contractor Overhead

### From Contractor Hourly Rate Calculator

Near Annual business overhead input:

Not sure what to enter for annual business overhead? Calculate your contractor overhead.

Link anchor:
calculate your contractor overhead

Destination:
/calculators/contractor-overhead/

Required.

### From Contractor Markup Calculator

Near Allocated overhead for this job:

Need help determining how much overhead your business must recover? Use the Contractor Overhead Calculator.

Anchor:
Contractor Overhead Calculator

Destination:
/calculators/contractor-overhead/

Required.

Do not change either calculator’s calculation logic.

## Internal links from Contractor Overhead

### Contractor Hourly Rate Calculator

Context:

If you're an owner-operator, use your annual overhead to calculate the hourly rate your business needs to charge.

Destination:
/calculators/contractor-hourly-rate/

### Labor Burden Calculator

Distinction context:

Calculating employee productive-hour cost instead?

Destination:
/calculators/labor-burden/

### Contractor Markup Calculator

Context:

Ready to apply costs and allocated overhead to a job price?

Destination:
/calculators/contractor-markup/

Do not add future Job Profit links.

## Related calculators

Include only live relevant calculators:
- Labor Burden Calculator
- Contractor Hourly Rate Calculator
- Contractor Markup Calculator
- True Employee Cost Calculator if useful without implying a direct required workflow

Do not include future calculators.

## Recommendation slot

Use existing RecommendationSlot unconfigured.

It must render nothing.

No affiliate content.
No vendors.
No ads.

## FAQ

Include concise FAQs around:

- What counts as contractor overhead?
- How do I calculate annual overhead?
- What is overhead as a percentage of revenue?
- How do I calculate overhead per direct labor dollar?
- How do I calculate overhead per productive labor hour?
- Which overhead recovery method should a contractor use?
- Is overhead the same as profit?
- How do I avoid double-counting labor burden and overhead?

Do not recommend universal benchmark overhead percentages.

## Methodology formulas

Publish server-rendered/crawlable formulas:

Total Annual Overhead =
sum of active overhead categories
OR user-entered total annual overhead

Monthly Overhead =
Annual Overhead / 12

Weekly Overhead =
Annual Overhead / 52

Overhead as % of Revenue =
Annual Overhead / Annual Revenue

Overhead per Direct Labor Dollar =
Annual Overhead / Annual Direct Labor Cost

Overhead per Direct-Cost Dollar =
Annual Overhead / Annual Direct Job Costs

Overhead per Productive Field Hour =
Annual Overhead / Annual Productive Field Hours

Explain denominators clearly.

## SEO

Primary:
contractor overhead calculator

Support naturally:
- construction overhead calculator
- contractor overhead rate calculator
- construction overhead rate calculator
- contractor overhead percentage calculator
- overhead recovery rate calculator
- overhead percentage of revenue
- overhead per labor hour
- overhead per direct labor dollar
- overhead per direct-cost dollar

Do not create separate keyword-variant pages.

Landing page itself should own:
- what contractor overhead is;
- what may count as overhead;
- annual overhead;
- revenue ratio;
- labor-dollar view;
- direct-cost view;
- productive-hour view;
- why bases differ;
- worked examples;
- FAQ.

Do not add benchmark percentage recommendations.

## Analytics

Recommended calculator ID:
contractor_overhead

Path:
/calculators/contractor-overhead/

Use existing safe events:
- calculator_start
- calculator_complete
- calculator_navigation

Never send:
- overhead values;
- denominator values;
- recovery ratios;
- financial results;
- selected category amounts.

## Homepage / calculators index

Eventually add as calculator #5.

Homepage question:
“What does it cost to keep my business running, and how can that overhead be recovered?”

Calculator-index description should focus on:
annual overhead + multiple recovery views.

Do not redesign homepage or index.

## Unit tests required

At minimum:

### Detailed overhead
1. baseline
2. every category contributes correctly
3. zero-valued categories valid
4. all categories zero invalid

### Simple overhead
5. baseline
6. zero invalid
7. negative invalid

### Representation handling
8. inactive detailed values ignored
9. inactive simple total ignored
10. no double counting

### Annual/monthly/weekly
11. annual total
12. monthly = annual / 12
13. weekly = annual / 52

### Revenue recovery
14. baseline
15. 120000 / 600000 = 20%
16. omitted suppresses view
17. zero invalid
18. negative invalid

### Direct labor recovery
19. 120000 / 240000 = 0.50 per $1
20. equivalent 50%
21. omitted suppresses
22. zero invalid
23. negative invalid

### Direct cost recovery
24. 120000 / 400000 = 0.30 per $1
25. equivalent 30%
26. omitted suppresses
27. zero invalid
28. negative invalid

### Productive-hour recovery
29. 120000 / 4000 = 30/hour
30. omitted suppresses
31. zero invalid
32. negative invalid

### Multiple recovery views
33. all denominators provided
34. same annual overhead drives all views
35. denominator values do not modify annual overhead

### Precision/safety
36. decimal values
37. large finite values
38. non-finite/overflow protection
39. unsupported entry mode
40. only active representation validated

Add more tests where useful.

## Future integration

Future Job Profit Calculator may accept allocated overhead as a job-level input.

Do not implement connected state or automatic transfer now.

## Scope exclusions

Do not implement:
- Job Profit;
- final job price;
- markup;
- target profit;
- employee burden;
- owner compensation;
- overhead benchmark recommendations;
- affiliate content.
