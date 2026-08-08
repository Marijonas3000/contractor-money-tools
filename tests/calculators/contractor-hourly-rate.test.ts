import { describe, expect, it } from 'vitest';

import {
  calculateContractorHourlyRate,
  type ContractorHourlyRateInput,
} from '../../src/lib/calculators/contractor-hourly-rate';

const baselineInput: ContractorHourlyRateInput = {
  desiredAnnualOwnerCompensation: 80_000,
  annualBusinessOverhead: 40_000,
  billableHoursPerWeek: 25,
  workingWeeksPerYear: 48,
  targetProfitMarginPercent: 20,
};

function expectSuccess(input: ContractorHourlyRateInput) {
  const calculation = calculateContractorHourlyRate(input);
  expect(calculation.success).toBe(true);

  if (!calculation.success) {
    throw new Error('Expected a successful contractor hourly rate calculation.');
  }

  return calculation.result;
}

function expectFieldError(
  input: ContractorHourlyRateInput,
  field: string,
  code?: string,
) {
  const calculation = calculateContractorHourlyRate(input);
  expect(calculation.success).toBe(false);

  if (calculation.success) {
    throw new Error('Expected a contractor hourly rate validation error.');
  }

  expect(calculation.errors).toContainEqual(
    expect.objectContaining({ field, ...(code ? { code } : {}) }),
  );
}

describe('calculateContractorHourlyRate', () => {
  it('calculates the normal baseline scenario', () => {
    const result = expectSuccess(baselineInput);

    expect(result.annualBillableHours).toBe(1_200);
    expect(result.annualCosts).toBe(120_000);
    expect(result.breakEvenHourlyRate).toBe(100);
    expect(result.requiredAnnualRevenue).toBe(150_000);
    expect(result.recommendedHourlyBillingRate).toBe(125);
    expect(result.annualTargetProfit).toBe(30_000);
    expect(result.optionalDayRate).toBeNull();
  });

  it('allows a zero percent target margin', () => {
    const result = expectSuccess({
      ...baselineInput,
      targetProfitMarginPercent: 0,
    });

    expect(result.requiredAnnualRevenue).toBe(result.annualCosts);
    expect(result.recommendedHourlyBillingRate).toBe(
      result.breakEvenHourlyRate,
    );
    expect(result.annualTargetProfit).toBe(0);
  });

  it('uses true 20 percent margin math', () => {
    const result = expectSuccess(baselineInput);

    expect(result.requiredAnnualRevenue).toBe(120_000 / 0.8);
    expect(result.recommendedHourlyBillingRate).toBe(100 / 0.8);
  });

  it('does not treat a 20 percent margin as a 20 percent markup', () => {
    const result = expectSuccess(baselineInput);
    const markupBasedRate = result.breakEvenHourlyRate * 1.2;

    expect(markupBasedRate).toBe(120);
    expect(result.recommendedHourlyBillingRate).toBe(125);
    expect(result.recommendedHourlyBillingRate).not.toBe(markupBasedRate);
  });

  it('allows zero owner compensation when overhead is positive', () => {
    const result = expectSuccess({
      ...baselineInput,
      desiredAnnualOwnerCompensation: 0,
    });

    expect(result.annualCosts).toBe(40_000);
  });

  it('allows zero overhead when owner compensation is positive', () => {
    const result = expectSuccess({
      ...baselineInput,
      annualBusinessOverhead: 0,
    });

    expect(result.annualCosts).toBe(80_000);
  });

  it('rejects owner compensation and overhead when both are zero', () => {
    expectFieldError(
      {
        ...baselineInput,
        desiredAnnualOwnerCompensation: 0,
        annualBusinessOverhead: 0,
      },
      'annualCosts',
      'annual_costs_nonpositive',
    );
  });

  it('rejects zero billable hours per week', () => {
    expectFieldError(
      { ...baselineInput, billableHoursPerWeek: 0 },
      'billableHoursPerWeek',
      'must_be_positive',
    );
  });

  it('rejects negative billable hours per week', () => {
    expectFieldError(
      { ...baselineInput, billableHoursPerWeek: -1 },
      'billableHoursPerWeek',
      'must_be_positive',
    );
  });

  it('rejects a target margin equal to 100 percent', () => {
    expectFieldError(
      { ...baselineInput, targetProfitMarginPercent: 100 },
      'targetProfitMarginPercent',
      'target_margin_out_of_range',
    );
  });

  it('rejects a target margin greater than 100 percent', () => {
    expectFieldError(
      { ...baselineInput, targetProfitMarginPercent: 125 },
      'targetProfitMarginPercent',
      'target_margin_out_of_range',
    );
  });

  it('rejects a negative target margin', () => {
    expectFieldError(
      { ...baselineInput, targetProfitMarginPercent: -0.01 },
      'targetProfitMarginPercent',
      'target_margin_out_of_range',
    );
  });

  it('preserves precision for decimal inputs', () => {
    const input = {
      desiredAnnualOwnerCompensation: 80_000.55,
      annualBusinessOverhead: 40_000.25,
      billableHoursPerWeek: 24.75,
      workingWeeksPerYear: 47.5,
      targetProfitMarginPercent: 17.25,
    } satisfies ContractorHourlyRateInput;
    const result = expectSuccess(input);
    const expectedHours = 24.75 * 47.5;
    const expectedCosts = 80_000.55 + 40_000.25;
    const expectedRevenue = expectedCosts / (1 - 17.25 / 100);

    expect(result.annualBillableHours).toBe(expectedHours);
    expect(result.annualCosts).toBe(expectedCosts);
    expect(result.requiredAnnualRevenue).toBe(expectedRevenue);
    expect(result.recommendedHourlyBillingRate).toBe(
      expectedRevenue / expectedHours,
    );
  });

  it('calculates large but valid values', () => {
    const result = expectSuccess({
      desiredAnnualOwnerCompensation: 1_000_000_000,
      annualBusinessOverhead: 2_000_000_000,
      billableHoursPerWeek: 10_000,
      workingWeeksPerYear: 1_000,
      targetProfitMarginPercent: 75,
    });

    expect(result.annualCosts).toBe(3_000_000_000);
    expect(result.annualBillableHours).toBe(10_000_000);
    expect(result.breakEvenHourlyRate).toBe(300);
    expect(result.requiredAnnualRevenue).toBe(12_000_000_000);
    expect(result.recommendedHourlyBillingRate).toBe(1_200);
  });

  it('calculates an optional day rate when day hours are provided', () => {
    const result = expectSuccess({
      ...baselineInput,
      billableHoursPerDay: 6.5,
    });

    expect(result.optionalDayRate).toBe(812.5);
  });

  it.each([
    ['omitted', undefined],
    ['blank', null],
  ] as const)('omits the optional day rate when day hours are %s', (_label, value) => {
    const result = expectSuccess({
      ...baselineInput,
      billableHoursPerDay: value,
    });

    expect(result.optionalDayRate).toBeNull();
  });

  it('rejects explicitly provided zero day hours', () => {
    expectFieldError(
      { ...baselineInput, billableHoursPerDay: 0 },
      'billableHoursPerDay',
      'must_be_positive',
    );
  });

  it('rejects negative day hours', () => {
    expectFieldError(
      { ...baselineInput, billableHoursPerDay: -1 },
      'billableHoursPerDay',
      'must_be_positive',
    );
  });

  it('rejects non-finite required and optional inputs', () => {
    const calculation = calculateContractorHourlyRate({
      ...baselineInput,
      desiredAnnualOwnerCompensation: Number.NaN,
      billableHoursPerDay: Number.POSITIVE_INFINITY,
    });

    expect(calculation.success).toBe(false);
    if (!calculation.success) {
      expect(calculation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'desiredAnnualOwnerCompensation',
            code: 'not_finite',
          }),
          expect.objectContaining({
            field: 'billableHoursPerDay',
            code: 'not_finite',
          }),
        ]),
      );
    }
  });

  it('rejects calculation overflow', () => {
    expectFieldError(
      {
        ...baselineInput,
        desiredAnnualOwnerCompensation: Number.MAX_VALUE,
        annualBusinessOverhead: Number.MAX_VALUE,
      },
      'calculation',
      'calculation_overflow',
    );
  });
});
