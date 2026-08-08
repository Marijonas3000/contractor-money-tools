export interface TrueEmployeeCostCommonInput {
  payrollTaxRatePercent: number;
  workersCompRatePercent: number;
  healthInsurance: number;
  retirementContribution: number;
  bonusesAndCommissions: number;
  otherBenefits: number;
  recruitingHiringCost: number;
  trainingCost: number;
  toolsUniforms: number;
  phoneDeviceCost: number;
  vehicleCost: number;
  softwareLicenses: number;
  workspaceAllocation: number;
  otherAnnualEmployeeCosts: number;
  expectedAnnualRevenue?: number | null;
}

export interface HourlyTrueEmployeeCostInput
  extends TrueEmployeeCostCommonInput {
  mode: 'hourly';
  hourlyWage: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  annualSalary?: never;
}

export interface SalariedTrueEmployeeCostInput
  extends TrueEmployeeCostCommonInput {
  mode: 'salary';
  annualSalary: number;
  hourlyWage?: never;
  hoursPerWeek?: never;
  weeksPerYear?: never;
}

export type TrueEmployeeCostInput =
  | HourlyTrueEmployeeCostInput
  | SalariedTrueEmployeeCostInput;

export type TrueEmployeeCostValidationField =
  | keyof TrueEmployeeCostCommonInput
  | 'mode'
  | 'hourlyWage'
  | 'hoursPerWeek'
  | 'weeksPerYear'
  | 'annualSalary'
  | 'annualBaseCompensation'
  | 'calculation';

export type TrueEmployeeCostValidationCode =
  | 'not_finite'
  | 'must_be_nonnegative'
  | 'must_be_positive'
  | 'unsupported_mode'
  | 'annual_base_compensation_nonpositive'
  | 'calculation_overflow';

export interface TrueEmployeeCostValidationError {
  field: TrueEmployeeCostValidationField;
  code: TrueEmployeeCostValidationCode;
  message: string;
}

export interface TrueEmployeeCostRevenueScenario {
  expectedAnnualRevenue: number;
  revenueToCostRatio: number;
  contributionBeforeSharedOverhead: number;
}

interface TrueEmployeeCostResultBase {
  annualBaseCompensation: number;
  payrollTaxes: number;
  workersComp: number;
  additionalCashCompensation: number;
  benefitsCost: number;
  operatingSupportCost: number;
  totalAnnualEmployeeCost: number;
  costMultiplier: number;
  additionalEmployerCost: number;
  additionalEmployerCostPercent: number;
  monthlyEmployerCost: number;
  weeklyEmployerCost: number;
  revenueScenario: TrueEmployeeCostRevenueScenario | null;
}

export interface HourlyTrueEmployeeCostResult
  extends TrueEmployeeCostResultBase {
  mode: 'hourly';
  annualPaidHours: number;
  paidHourEmployerCost: number;
}

export interface SalariedTrueEmployeeCostResult
  extends TrueEmployeeCostResultBase {
  mode: 'salary';
  annualPaidHours: null;
  paidHourEmployerCost: null;
}

export type TrueEmployeeCostResult =
  | HourlyTrueEmployeeCostResult
  | SalariedTrueEmployeeCostResult;

export type TrueEmployeeCostCalculation =
  | { success: true; result: TrueEmployeeCostResult }
  | { success: false; errors: TrueEmployeeCostValidationError[] };

const PERCENTAGE_POINTS_PER_WHOLE = 100;
const MONTHS_PER_YEAR = 12;
const WEEKS_PER_YEAR = 52;

const nonnegativeCommonFields = [
  'payrollTaxRatePercent',
  'workersCompRatePercent',
  'healthInsurance',
  'retirementContribution',
  'bonusesAndCommissions',
  'otherBenefits',
  'recruitingHiringCost',
  'trainingCost',
  'toolsUniforms',
  'phoneDeviceCost',
  'vehicleCost',
  'softwareLicenses',
  'workspaceAllocation',
  'otherAnnualEmployeeCosts',
] as const satisfies readonly (keyof TrueEmployeeCostCommonInput)[];

function finiteError(
  field: TrueEmployeeCostValidationField,
): TrueEmployeeCostValidationError {
  return {
    field,
    code: 'not_finite',
    message: `${field} must be a finite number.`,
  };
}

/**
 * Calculates an employee's total annual employer cost.
 *
 * Percentage inputs and percentage outputs use percentage points: `7.65`
 * means 7.65%, not the decimal ratio `0.0765`. Monetary results are not
 * rounded. A missing, null, or zero expected revenue omits the revenue scenario.
 */
export function calculateTrueEmployeeCost(
  input: TrueEmployeeCostInput,
): TrueEmployeeCostCalculation {
  const errors: TrueEmployeeCostValidationError[] = [];

  if (input.mode !== 'hourly' && input.mode !== 'salary') {
    return {
      success: false,
      errors: [
        {
          field: 'mode',
          code: 'unsupported_mode',
          message: 'Mode must be either hourly or salary.',
        },
      ],
    };
  }

  for (const field of nonnegativeCommonFields) {
    const value = input[field];
    if (!Number.isFinite(value)) {
      errors.push(finiteError(field));
    } else if (value < 0) {
      errors.push({
        field,
        code: 'must_be_nonnegative',
        message: `${field} must be zero or greater.`,
      });
    }
  }

  if (
    input.expectedAnnualRevenue !== undefined &&
    input.expectedAnnualRevenue !== null
  ) {
    if (!Number.isFinite(input.expectedAnnualRevenue)) {
      errors.push(finiteError('expectedAnnualRevenue'));
    } else if (input.expectedAnnualRevenue < 0) {
      errors.push({
        field: 'expectedAnnualRevenue',
        code: 'must_be_nonnegative',
        message: 'expectedAnnualRevenue must be zero or greater.',
      });
    }
  }

  let annualPaidHours: number | null = null;
  let annualBaseCompensation: number;

  if (input.mode === 'hourly') {
    const hourlyFields = [
      'hourlyWage',
      'hoursPerWeek',
      'weeksPerYear',
    ] as const;

    for (const field of hourlyFields) {
      if (!Number.isFinite(input[field])) {
        errors.push(finiteError(field));
      } else if (input[field] <= 0) {
        errors.push({
          field,
          code: 'must_be_positive',
          message: `${field} must be greater than zero.`,
        });
      }
    }

    annualPaidHours = input.hoursPerWeek * input.weeksPerYear;
    annualBaseCompensation = input.hourlyWage * annualPaidHours;
  } else {
    if (!Number.isFinite(input.annualSalary)) {
      errors.push(finiteError('annualSalary'));
    } else if (input.annualSalary <= 0) {
      errors.push({
        field: 'annualSalary',
        code: 'must_be_positive',
        message: 'annualSalary must be greater than zero.',
      });
    }

    annualBaseCompensation = input.annualSalary;
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  if (annualBaseCompensation <= 0) {
    return {
      success: false,
      errors: [
        {
          field: 'annualBaseCompensation',
          code: 'annual_base_compensation_nonpositive',
          message:
            'Annual base compensation must be greater than zero to calculate cost ratios.',
        },
      ],
    };
  }

  const payrollTaxRate =
    input.payrollTaxRatePercent / PERCENTAGE_POINTS_PER_WHOLE;
  const workersCompRate =
    input.workersCompRatePercent / PERCENTAGE_POINTS_PER_WHOLE;
  const payrollTaxes = annualBaseCompensation * payrollTaxRate;
  const workersComp = annualBaseCompensation * workersCompRate;
  const additionalCashCompensation = input.bonusesAndCommissions;
  const benefitsCost =
    input.healthInsurance +
    input.retirementContribution +
    input.otherBenefits;
  const operatingSupportCost =
    input.recruitingHiringCost +
    input.trainingCost +
    input.toolsUniforms +
    input.phoneDeviceCost +
    input.vehicleCost +
    input.softwareLicenses +
    input.workspaceAllocation +
    input.otherAnnualEmployeeCosts;
  const totalAnnualEmployeeCost =
    annualBaseCompensation +
    payrollTaxes +
    workersComp +
    additionalCashCompensation +
    benefitsCost +
    operatingSupportCost;
  const costMultiplier =
    totalAnnualEmployeeCost / annualBaseCompensation;
  const additionalEmployerCost =
    totalAnnualEmployeeCost - annualBaseCompensation;
  const additionalEmployerCostPercent =
    (additionalEmployerCost / annualBaseCompensation) *
    PERCENTAGE_POINTS_PER_WHOLE;
  const monthlyEmployerCost = totalAnnualEmployeeCost / MONTHS_PER_YEAR;
  const weeklyEmployerCost = totalAnnualEmployeeCost / WEEKS_PER_YEAR;
  const paidHourEmployerCost =
    annualPaidHours === null
      ? null
      : totalAnnualEmployeeCost / annualPaidHours;

  const expectedAnnualRevenue = input.expectedAnnualRevenue;
  const revenueScenario =
    expectedAnnualRevenue !== undefined &&
    expectedAnnualRevenue !== null &&
    expectedAnnualRevenue > 0
      ? {
          expectedAnnualRevenue,
          revenueToCostRatio:
            expectedAnnualRevenue / totalAnnualEmployeeCost,
          contributionBeforeSharedOverhead:
            expectedAnnualRevenue - totalAnnualEmployeeCost,
        }
      : null;

  const numericResults = [
    annualBaseCompensation,
    payrollTaxes,
    workersComp,
    additionalCashCompensation,
    benefitsCost,
    operatingSupportCost,
    totalAnnualEmployeeCost,
    costMultiplier,
    additionalEmployerCost,
    additionalEmployerCostPercent,
    monthlyEmployerCost,
    weeklyEmployerCost,
    ...(annualPaidHours === null ? [] : [annualPaidHours]),
    ...(paidHourEmployerCost === null ? [] : [paidHourEmployerCost]),
    ...(revenueScenario === null
      ? []
      : [
          revenueScenario.revenueToCostRatio,
          revenueScenario.contributionBeforeSharedOverhead,
        ]),
  ];

  if (!numericResults.every(Number.isFinite)) {
    return {
      success: false,
      errors: [
        {
          field: 'calculation',
          code: 'calculation_overflow',
          message: 'The supplied values are too large to calculate safely.',
        },
      ],
    };
  }

  const commonResult: TrueEmployeeCostResultBase = {
    annualBaseCompensation,
    payrollTaxes,
    workersComp,
    additionalCashCompensation,
    benefitsCost,
    operatingSupportCost,
    totalAnnualEmployeeCost,
    costMultiplier,
    additionalEmployerCost,
    additionalEmployerCostPercent,
    monthlyEmployerCost,
    weeklyEmployerCost,
    revenueScenario,
  };

  if (input.mode === 'hourly') {
    return {
      success: true,
      result: {
        ...commonResult,
        mode: 'hourly',
        annualPaidHours: annualPaidHours as number,
        paidHourEmployerCost: paidHourEmployerCost as number,
      },
    };
  }

  return {
    success: true,
    result: {
      ...commonResult,
      mode: 'salary',
      annualPaidHours: null,
      paidHourEmployerCost: null,
    },
  };
}
