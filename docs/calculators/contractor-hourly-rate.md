# Contractor Hourly Rate Calculator

## Purpose

Answer this question:

“How much do I need to charge per billable hour for my contracting business to cover costs and hit my target profit margin?”

Primary audience:
U.S. owner-operators and small home-service contractors.

This calculator is for business pricing, not personal tax planning.

## Core principles

- Clearly separate break-even rate from profitable/recommended billing rate.
- Use true margin math, not markup math.
- Emphasize that hours worked are not the same as hours billed.
- Annual overhead remains one aggregate input in V1.
- Do not model personal income taxes, self-employment taxes, or owner payroll structure in V1.
- Inputs are planning assumptions.
- Calculation logic must later live in a pure TypeScript function with no DOM access.
- Invalid inputs must return structured validation errors.

## Inputs

### Required inputs

1. Desired annual owner compensation
   - USD/year
   - default: 80000
   - represents the amount the owner wants the business to support before personal tax modelling

2. Annual business overhead
   - USD/year
   - default: 40000
   - one aggregate input in V1

3. Billable hours per week
   - hours/week
   - default: 25

4. Working weeks per year
   - weeks/year
   - default: 48

5. Target profit margin
   - percent
   - default: 20
   - percentage points, e.g. 20 means 20%

### Optional input

6. Billable hours per day
   - hours/day
   - default: blank
   - if blank, do not show day-rate output
   - do not assume 8 hours automatically

## Calculations

Annual Billable Hours =
billableHoursPerWeek × workingWeeksPerYear

Annual Costs =
desiredAnnualOwnerCompensation + annualBusinessOverhead

Break-even Hourly Rate =
annualCosts / annualBillableHours

Required Annual Revenue =
annualCosts / (1 - targetProfitMargin)

Recommended Hourly Billing Rate =
requiredAnnualRevenue / annualBillableHours

Annual Target Profit =
requiredAnnualRevenue - annualCosts

If billableHoursPerDay is provided and > 0:

Optional Day Rate =
recommendedHourlyBillingRate × billableHoursPerDay

## Important interpretation

Break-even rate answers:

“What is the minimum hourly rate needed to cover owner compensation and business overhead?”

Recommended hourly billing rate answers:

“What hourly rate is needed to cover those costs and still leave the selected target profit margin?”

These two numbers must never be visually or conceptually merged.

Example:

If:
- annual costs = $120,000
- annual billable hours = 1,200
- target margin = 20%

Then:

Break-even rate =
$120,000 / 1,200
= $100/hour

Required revenue =
$120,000 / 0.80
= $150,000

Recommended hourly billing rate =
$150,000 / 1,200
= $125/hour

Annual target profit =
$30,000

Do not incorrectly calculate the profitable rate as:

$100 × 1.20 = $120

because that is markup math, not 20% margin math.

## Primary results

Visually separate two major results:

### Break-even rate

Example:

“Break-even rate: $100/hour”

Supporting text:

“At this rate, the business covers the selected owner compensation and overhead but does not produce the target profit margin.”

### Recommended hourly billing rate

Example:

“To target a 20% profit margin, charge about $125/hour.”

This should be the dominant result.

## Result breakdown

Show:

- Desired annual owner compensation
- Annual business overhead
- Annual costs
- Billable hours per week
- Working weeks per year
- Annual billable hours
- Break-even hourly rate
- Target profit margin
- Required annual revenue
- Annual target profit
- Recommended hourly billing rate
- Optional day rate, if configured

## Billable-hours explanation

The calculator must explicitly explain:

Hours worked ≠ hours billed.

Contractors may spend time on:
- estimates
- travel
- scheduling
- callbacks
- purchasing
- admin
- invoicing
- marketing
- training

Only billable hours generate the hourly revenue used in this calculator.

Do not model those categories separately in V1.

## Validation

Reject or flag:

- desired annual owner compensation < 0
- annual business overhead < 0
- both owner compensation and overhead equal 0
- billable hours per week <= 0
- working weeks per year <= 0
- target profit margin < 0
- target profit margin >= 100
- billable hours per day <= 0 if provided
- annual billable hours <= 0
- invalid division scenarios

Validation should be structured and field-specific where practical.

## Margin behavior

Target margin = 0% must be valid.

At 0% margin:

Required Annual Revenue =
Annual Costs

Recommended Hourly Billing Rate =
Break-even Hourly Rate

Do not reject 0%.

## UX

Use the shared CMT calculator page architecture:

1. Intro / Calculator
2. Results
3. Methodology / explanation
4. Optional Recommendation slot
5. FAQ / Related calculators

Calculator-specific flow:

1. Intro
2. Inputs
3. Break-even result
4. Recommended profitable rate
5. Result breakdown
6. Optional day-rate result
7. Billable-hours explanation
8. Methodology
9. Unconfigured Recommendation slot
10. FAQ / Related calculators

Requirements:
- real-time calculation
- no Calculate button if reliable
- mobile-first
- match existing CMT visual system
- primary profitable rate visually dominant
- break-even rate clearly secondary but prominent
- target margin input must make the margin-vs-markup distinction understandable
- optional day-rate input should be visually secondary
- invalid inputs must not show misleading results

## Methodology copy requirements

Explain clearly:

- owner compensation and business profit are different concepts;
- overhead is treated as one annual aggregate in V1;
- billable hours are the key denominator;
- true margin math divides by (1 - margin);
- higher target margin increases required revenue nonlinearly;
- calculator does not model personal taxes or owner payroll structure;
- actual pricing may also depend on materials, subcontractors, market demand, job risk, warranties, minimum charges, and other business-specific factors;
- this calculator provides business planning and educational information, not tax, accounting, legal, or financial advice.

## FAQ topics

At minimum:

1. What hourly rate should a contractor charge?
2. What is the difference between break-even rate and billing rate?
3. Why are billable hours lower than hours worked?
4. Is a 20% margin the same as a 20% markup?
5. Does this calculator include taxes?
6. Should materials be included in this hourly rate?
7. How many billable hours per week should I use?

Do not invent universal benchmark answers where business-specific assumptions are required.

## Unit tests required later

At minimum:

1. normal baseline scenario;
2. 0% target margin;
3. correct 20% margin math;
4. demonstrate that 20% margin is not 20% markup;
5. zero owner compensation with positive overhead;
6. zero overhead with positive owner compensation;
7. both costs zero invalid;
8. zero billable hours invalid;
9. negative billable hours invalid;
10. target margin >= 100 invalid;
11. negative target margin invalid;
12. decimal values;
13. large valid values;
14. optional day rate present;
15. optional day rate omitted;
16. optional day rate invalid when <= 0.

## Future integration

Future calculators may reuse:

- recommendedHourlyBillingRate
- breakEvenHourlyRate
- annualBillableHours
- requiredAnnualRevenue

A future connected CMT system may accept labor-cost or overhead inputs from other calculators, but do not implement those integrations in V1.

## Naming

Public product name:
Contractor Hourly Rate Calculator

Preferred URL:
`/calculators/contractor-hourly-rate`

This replaces the earlier generic working label “Billable Hour Rate Calculator” for this calculator.

Do not rename or modify existing product files yet. Naming reconciliation can happen in a separate controlled step.
