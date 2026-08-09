# Labor Burden Calculator

## Purpose

Answer this question:

“If I pay an employee $30/hour, what does that employee actually cost me per productive hour?”

This is a business planning calculator for U.S. contractors and home-service businesses.

## Core principles

- Do not double-count PTO, holidays, or training.
- Paid nonproductive time is already included in annual paid wages.
- Its effect should reduce productive hours, not add wages again.
- User-entered tax and workers’ compensation rates are assumptions, not universal official rates.
- All calculation logic must later live in a pure TypeScript function with no DOM access.
- Invalid inputs must return structured validation errors instead of producing nonsensical values.

## Inputs

### Quick inputs

1. Hourly wage
   - USD/hour
   - default: 30

2. Hours paid per week
   - hours
   - default: 40

3. Weeks paid per year
   - weeks
   - default: 52

4. Payroll taxes
   - percent of annual base wage
   - editable user assumption
   - do not present as a universal U.S. rate

5. Workers’ compensation
   - percent of annual base wage
   - editable user assumption
   - do not present as a universal rate

6. PTO days
   - days/year
   - default: 10

7. Paid holidays
   - days/year
   - default: 8

### Advanced inputs

8. Health insurance
   - USD/year
   - default: 0

9. Retirement contribution
   - USD/year
   - default: 0

10. Training days
    - days/year
    - default: 0

11. Other benefits
    - USD/year
    - default: 0

12. Tools and uniforms
    - USD/year
    - default: 0

13. Other annual employee costs
    - USD/year
    - default: 0

14. Hours per workday
    - hours/day
    - default: 8

## Calculations

Annual Paid Hours =
hoursPerWeek × weeksPerYear

Annual Base Wage =
hourlyWage × annualPaidHours

Payroll Taxes =
annualBaseWage × payrollTaxRate

Workers Comp =
annualBaseWage × workersCompRate

Fixed Annual Employment Costs =
healthInsurance
+ retirementContribution
+ otherBenefits
+ toolsUniforms
+ otherAnnualCosts

Total Annual Employment Cost =
annualBaseWage
+ payrollTaxes
+ workersComp
+ fixedAnnualEmploymentCosts

Nonproductive Paid Hours =
(PTO days + paid holidays + training days) × hoursPerWorkday

Productive Hours =
annualPaidHours - nonproductivePaidHours

Labor Burden Amount =
totalAnnualEmploymentCost - annualBaseWage

Labor Burden Percent =
laborBurdenAmount / annualBaseWage × 100

Paid Hour Cost =
totalAnnualEmploymentCost / annualPaidHours

True Productive Hour Cost =
totalAnnualEmploymentCost / productiveHours

## Important interpretation

PTO, holidays, and training do NOT increase Total Annual Employment Cost by themselves because the employee is already paid for those hours through Annual Base Wage.

They increase True Productive Hour Cost because fewer paid hours are available for productive work.

## Primary result

The most prominent result should read:

“Your $30/hour employee actually costs $XX.XX per productive hour.”

## Result breakdown

Show:

- Base hourly wage
- Annual base wage
- Payroll taxes
- Workers’ compensation
- Benefits and other annual costs
- Total annual employment cost
- Labor burden amount
- Labor burden %
- Annual paid hours
- Nonproductive paid hours
- Productive hours/year
- Paid hour cost
- True productive-hour cost

## Validation

Reject or flag:

- hourly wage < 0
- hours/week <= 0
- weeks/year <= 0
- hours/day <= 0
- negative tax rates
- negative workers’ comp rates
- negative annual costs
- negative PTO/holiday/training days
- productive hours <= 0
- annual base wage <= 0 where a percentage calculation would divide by zero

Validation should be structured and field-specific where practical.

## Sensitivity scenario

Include a scenario showing the effect of improving productive utilization.

Do not present this as a recommendation or guaranteed saving.

Suggested logic:

- determine current productive-hours percentage of annual paid hours;
- increase that percentage by 5 percentage points;
- cap at 100%;
- recalculate true productive-hour cost using the same annual employment cost;
- show the difference in cost/hour.

Label clearly as a hypothetical scenario.

## UX

Default flow:

1. Quick inputs
2. Primary result
3. Improve accuracy / Advanced inputs
4. Cost breakdown
5. Productive-time impact
6. Sensitivity scenario
7. Methodology
8. FAQ

The calculator should update in real time once implemented.

No Calculate button is required if real-time calculation is reliable.

The advanced inputs should be collapsed by default.

## Methodology copy requirements

Explain clearly:

- what labor burden means;
- why productive-hour cost can be much higher than wage;
- why PTO is not added twice;
- why payroll tax and workers’ compensation values are editable assumptions;
- that actual employer costs vary by state, insurance, classification, benefits, and business circumstances;
- that this calculator provides planning and educational information, not tax, legal, accounting, insurance, or financial advice.

## Unit tests required later

At minimum:

1. normal baseline scenario;
2. all optional annual costs = 0;
3. PTO/holidays reduce productive hours without double-counting wages;
4. productive hours <= 0;
5. payroll tax = 0 and workers comp = 0;
6. decimal hourly wage;
7. large but valid values;
8. sensitivity scenario capped correctly at 100% productive utilization.

## Future integration

The result `trueProductiveHourCost` must later be reusable by the Contractor Hourly Rate Calculator.

Do not implement this integration yet.
