export interface JobEconomicsInput {
  revenue?: number | null;
  laborCost?: number | null;
  materialsCost?: number | null;
  subcontractorsCost?: number | null;
  equipmentCost?: number | null;
  otherDirectCosts?: number | null;
  allocatedOverhead?: number | null;
}

export interface ContractorJobProfitInput {
  estimated?: JobEconomicsInput | null;
  actual?: JobEconomicsInput | null;
}

export type JobProfitInputSide = 'estimated' | 'actual';
export type JobEconomicsInputField = keyof JobEconomicsInput;
export type ContractorJobProfitValidationField =
  | `${JobProfitInputSide}.${JobEconomicsInputField}`
  | 'calculation';

export type ContractorJobProfitValidationCode =
  | 'not_finite'
  | 'must_be_nonnegative'
  | 'calculation_overflow';

export interface ContractorJobProfitValidationError {
  field: ContractorJobProfitValidationField;
  code: ContractorJobProfitValidationCode;
  message: string;
}

export interface JobEconomicsResult {
  revenue: number | null;
  laborCost: number;
  materialsCost: number;
  subcontractorsCost: number;
  equipmentCost: number;
  otherDirectCosts: number;
  directJobCosts: number;
  contributionAfterDirectCosts: number | null;
  allocatedOverhead: number;
  totalJobCost: number;
  jobProfit: number | null;
  jobMarginPercent: number | null;
  markupOnEnteredJobCostPercent: number | null;
}

export interface JobProfitVariances {
  revenueVariance: number | null;
  laborVariance: number;
  materialsVariance: number;
  subcontractorsVariance: number;
  equipmentVariance: number;
  otherDirectCostsVariance: number;
  allocatedOverheadVariance: number;
  directJobCostVariance: number;
  contributionChange: number | null;
  totalJobCostVariance: number;
  jobProfitVariance: number | null;
  marginChangePercentagePoints: number | null;
}

export interface ContractorJobProfitResult {
  estimated: JobEconomicsResult | null;
  actual: JobEconomicsResult | null;
  variances: JobProfitVariances | null;
}

export type ContractorJobProfitCalculation =
  | { success: true; result: ContractorJobProfitResult }
  | { success: false; errors: ContractorJobProfitValidationError[] };

const PERCENTAGE_POINTS_PER_WHOLE = 100;
const inputFields = [
  'revenue',
  'laborCost',
  'materialsCost',
  'subcontractorsCost',
  'equipmentCost',
  'otherDirectCosts',
  'allocatedOverhead',
] as const satisfies readonly JobEconomicsInputField[];

function isSupplied(value: number | null | undefined): value is number {
  return value !== undefined && value !== null;
}

function isMeaningful(input: JobEconomicsInput | null | undefined): input is JobEconomicsInput {
  return input !== undefined && input !== null && inputFields.some((field) => isSupplied(input[field]));
}

function calculationOverflow(): ContractorJobProfitCalculation {
  return {
    success: false,
    errors: [{
      field: 'calculation',
      code: 'calculation_overflow',
      message: 'The supplied values are too large to calculate safely.',
    }],
  };
}

function validateSide(
  side: JobProfitInputSide,
  input: JobEconomicsInput | null | undefined,
): ContractorJobProfitValidationError[] {
  if (input === undefined || input === null) return [];

  const errors: ContractorJobProfitValidationError[] = [];
  for (const field of inputFields) {
    const value = input[field];
    if (!isSupplied(value)) continue;

    const validationField = `${side}.${field}` as const;
    if (!Number.isFinite(value)) {
      errors.push({
        field: validationField,
        code: 'not_finite',
        message: `${validationField} must be a finite number.`,
      });
    } else if (value < 0) {
      errors.push({
        field: validationField,
        code: 'must_be_nonnegative',
        message: field === 'revenue'
          ? `${validationField} cannot be negative in this calculator.`
          : `${validationField} must be zero or greater. Enter the net cost assigned to this job.`,
      });
    }
  }
  return errors;
}

function calculateSide(input: JobEconomicsInput): JobEconomicsResult | null {
  if (!isMeaningful(input)) return null;

  const revenue = isSupplied(input.revenue) ? input.revenue : null;
  const laborCost = input.laborCost ?? 0;
  const materialsCost = input.materialsCost ?? 0;
  const subcontractorsCost = input.subcontractorsCost ?? 0;
  const equipmentCost = input.equipmentCost ?? 0;
  const otherDirectCosts = input.otherDirectCosts ?? 0;
  const allocatedOverhead = input.allocatedOverhead ?? 0;
  const directJobCosts =
    laborCost +
    materialsCost +
    subcontractorsCost +
    equipmentCost +
    otherDirectCosts;
  const totalJobCost = directJobCosts + allocatedOverhead;
  const contributionAfterDirectCosts = revenue === null ? null : revenue - directJobCosts;
  const jobProfit = revenue === null ? null : revenue - totalJobCost;
  const jobMarginPercent =
    revenue !== null && revenue > 0 && jobProfit !== null
      ? (jobProfit / revenue) * PERCENTAGE_POINTS_PER_WHOLE
      : null;
  const markupOnEnteredJobCostPercent =
    jobProfit !== null && totalJobCost > 0
      ? (jobProfit / totalJobCost) * PERCENTAGE_POINTS_PER_WHOLE
      : null;

  return {
    revenue,
    laborCost,
    materialsCost,
    subcontractorsCost,
    equipmentCost,
    otherDirectCosts,
    directJobCosts,
    contributionAfterDirectCosts,
    allocatedOverhead,
    totalJobCost,
    jobProfit,
    jobMarginPercent,
    markupOnEnteredJobCostPercent,
  };
}

function calculateVariances(
  estimated: JobEconomicsResult | null,
  actual: JobEconomicsResult | null,
): JobProfitVariances | null {
  if (estimated === null || actual === null) return null;

  return {
    revenueVariance:
      estimated.revenue === null || actual.revenue === null
        ? null
        : actual.revenue - estimated.revenue,
    laborVariance: actual.laborCost - estimated.laborCost,
    materialsVariance: actual.materialsCost - estimated.materialsCost,
    subcontractorsVariance: actual.subcontractorsCost - estimated.subcontractorsCost,
    equipmentVariance: actual.equipmentCost - estimated.equipmentCost,
    otherDirectCostsVariance: actual.otherDirectCosts - estimated.otherDirectCosts,
    allocatedOverheadVariance: actual.allocatedOverhead - estimated.allocatedOverhead,
    directJobCostVariance: actual.directJobCosts - estimated.directJobCosts,
    contributionChange:
      estimated.contributionAfterDirectCosts === null || actual.contributionAfterDirectCosts === null
        ? null
        : actual.contributionAfterDirectCosts - estimated.contributionAfterDirectCosts,
    totalJobCostVariance: actual.totalJobCost - estimated.totalJobCost,
    jobProfitVariance:
      estimated.jobProfit === null || actual.jobProfit === null
        ? null
        : actual.jobProfit - estimated.jobProfit,
    marginChangePercentagePoints:
      estimated.jobMarginPercent === null || actual.jobMarginPercent === null
        ? null
        : actual.jobMarginPercent - estimated.jobMarginPercent,
  };
}

function finiteResultValues(result: ContractorJobProfitResult): boolean {
  const sides = [result.estimated, result.actual].filter(
    (side): side is JobEconomicsResult => side !== null,
  );
  const sideValues = sides.flatMap((side) => Object.values(side).filter((value) => value !== null));
  const varianceValues = result.variances === null
    ? []
    : Object.values(result.variances).filter((value) => value !== null);
  return [...sideValues, ...varianceValues].every(Number.isFinite);
}

/**
 * Compares estimated and actual job economics using supplied job-level values.
 * Omitted costs normalize to zero only for a side that otherwise contains data.
 * Percentage outputs use percentage points and no display rounding is applied.
 */
export function calculateContractorJobProfit(
  input: ContractorJobProfitInput,
): ContractorJobProfitCalculation {
  const errors = [
    ...validateSide('estimated', input.estimated),
    ...validateSide('actual', input.actual),
  ];
  if (errors.length > 0) return { success: false, errors };

  const estimated = isMeaningful(input.estimated) ? calculateSide(input.estimated) : null;
  const actual = isMeaningful(input.actual) ? calculateSide(input.actual) : null;
  const result: ContractorJobProfitResult = {
    estimated,
    actual,
    variances: calculateVariances(estimated, actual),
  };

  return finiteResultValues(result)
    ? { success: true, result }
    : calculationOverflow();
}
