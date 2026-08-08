import { describe, expect, it } from 'vitest';

import {
  calculateLaborBurden,
  type LaborBurdenInput,
} from '../../src/lib/calculators/labor-burden';

const baselineInput: LaborBurdenInput = {
  hourlyWage: 30,
  hoursPerWeek: 40,
  weeksPerYear: 52,
  payrollTaxRatePercent: 10,
  workersCompRatePercent: 5,
  ptoDays: 10,
  paidHolidays: 8,
  healthInsurance: 6_000,
  retirementContribution: 3_000,
  trainingDays: 2,
  otherBenefits: 1_200,
  toolsUniforms: 800,
  otherAnnualCosts: 500,
  hoursPerWorkday: 8,
};

function expectSuccess(input: LaborBurdenInput) {
  const calculation = calculateLaborBurden(input);
  expect(calculation.success).toBe(true);

  if (!calculation.success) {
    throw new Error('Expected a successful labor burden calculation.');
  }

  return calculation.result;
}

describe('calculateLaborBurden', () => {
  it('calculates the normal baseline scenario', () => {
    const result = expectSuccess(baselineInput);

    expect(result.annualPaidHours).toBe(2_080);
    expect(result.annualBaseWage).toBe(62_400);
    expect(result.payrollTaxes).toBe(6_240);
    expect(result.workersComp).toBe(3_120);
    expect(result.fixedAnnualEmploymentCosts).toBe(11_500);
    expect(result.totalAnnualEmploymentCost).toBe(83_260);
    expect(result.nonproductivePaidHours).toBe(160);
    expect(result.productiveHours).toBe(1_920);
    expect(result.laborBurdenAmount).toBe(20_860);
    expect(result.laborBurdenPercent).toBeCloseTo(33.429487, 6);
    expect(result.paidHourCost).toBeCloseTo(40.028846, 6);
    expect(result.trueProductiveHourCost).toBeCloseTo(43.364583, 6);
  });

  it('supports zero for every optional annual cost', () => {
    const result = expectSuccess({
      ...baselineInput,
      healthInsurance: 0,
      retirementContribution: 0,
      otherBenefits: 0,
      toolsUniforms: 0,
      otherAnnualCosts: 0,
    });

    expect(result.fixedAnnualEmploymentCosts).toBe(0);
    expect(result.totalAnnualEmploymentCost).toBe(71_760);
  });

  it('reduces productive hours for PTO and holidays without adding wages', () => {
    const withNonproductiveTime = expectSuccess(baselineInput);
    const withoutNonproductiveTime = expectSuccess({
      ...baselineInput,
      ptoDays: 0,
      paidHolidays: 0,
      trainingDays: 0,
    });

    expect(withNonproductiveTime.annualBaseWage).toBe(
      withoutNonproductiveTime.annualBaseWage,
    );
    expect(withNonproductiveTime.totalAnnualEmploymentCost).toBe(
      withoutNonproductiveTime.totalAnnualEmploymentCost,
    );
    expect(withNonproductiveTime.productiveHours).toBe(1_920);
    expect(withNonproductiveTime.trueProductiveHourCost).toBeGreaterThan(
      withoutNonproductiveTime.trueProductiveHourCost,
    );
  });

  it('rejects productive hours equal to zero', () => {
    const calculation = calculateLaborBurden({
      ...baselineInput,
      ptoDays: 260,
      paidHolidays: 0,
      trainingDays: 0,
    });

    expect(calculation).toEqual({
      success: false,
      errors: [
        expect.objectContaining({
          field: 'productiveHours',
          code: 'productive_hours_nonpositive',
        }),
      ],
    });
  });

  it('rejects productive hours below zero', () => {
    const calculation = calculateLaborBurden({
      ...baselineInput,
      ptoDays: 261,
      paidHolidays: 0,
      trainingDays: 0,
    });

    expect(calculation.success).toBe(false);
    if (!calculation.success) {
      expect(calculation.errors[0]?.code).toBe(
        'productive_hours_nonpositive',
      );
    }
  });

  it('supports zero payroll tax and workers compensation rates', () => {
    const result = expectSuccess({
      ...baselineInput,
      payrollTaxRatePercent: 0,
      workersCompRatePercent: 0,
    });

    expect(result.payrollTaxes).toBe(0);
    expect(result.workersComp).toBe(0);
    expect(result.laborBurdenAmount).toBe(11_500);
  });

  it('supports a decimal hourly wage without rounding intermediate values', () => {
    const result = expectSuccess({
      ...baselineInput,
      hourlyWage: 30.75,
    });

    expect(result.annualBaseWage).toBe(63_960);
    expect(result.trueProductiveHourCost).toBeCloseTo(44.298958, 6);
  });

  it('calculates large but valid values', () => {
    const result = expectSuccess({
      ...baselineInput,
      hourlyWage: 10_000,
      hoursPerWeek: 100,
      weeksPerYear: 100,
      payrollTaxRatePercent: 250,
      workersCompRatePercent: 125,
      healthInsurance: 10_000_000,
      retirementContribution: 10_000_000,
      otherBenefits: 10_000_000,
      toolsUniforms: 10_000_000,
      otherAnnualCosts: 10_000_000,
      ptoDays: 0,
      paidHolidays: 0,
      trainingDays: 0,
    });

    expect(result.annualBaseWage).toBe(100_000_000);
    expect(result.totalAnnualEmploymentCost).toBe(525_000_000);
    expect(result.trueProductiveHourCost).toBe(52_500);
  });

  it('adds five percentage points in the sensitivity scenario', () => {
    const result = expectSuccess(baselineInput);
    const scenario = result.sensitivityScenario;

    expect(scenario.currentProductiveUtilizationPercent).toBeCloseTo(
      92.307692,
      6,
    );
    expect(scenario.hypotheticalProductiveUtilizationPercent).toBeCloseTo(
      97.307692,
      6,
    );
    expect(scenario.hypotheticalProductiveHours).toBeCloseTo(2_024, 10);
    expect(scenario.hypotheticalTrueProductiveHourCost).toBeCloseTo(
      41.136364,
      6,
    );
    expect(scenario.costPerHourDifference).toBeCloseTo(2.22822, 5);
  });

  it('caps sensitivity utilization at 100 percent', () => {
    const result = expectSuccess({
      ...baselineInput,
      ptoDays: 0,
      paidHolidays: 0,
      trainingDays: 0,
    });
    const scenario = result.sensitivityScenario;

    expect(scenario.currentProductiveUtilizationPercent).toBe(100);
    expect(scenario.hypotheticalProductiveUtilizationPercent).toBe(100);
    expect(scenario.hypotheticalProductiveHours).toBe(2_080);
    expect(scenario.costPerHourDifference).toBe(0);
  });

  it.each([
    ['hourlyWage', -1],
    ['hoursPerWeek', 0],
    ['weeksPerYear', 0],
    ['hoursPerWorkday', 0],
    ['payrollTaxRatePercent', -1],
    ['workersCompRatePercent', -1],
    ['healthInsurance', -1],
    ['retirementContribution', -1],
    ['otherBenefits', -1],
    ['toolsUniforms', -1],
    ['otherAnnualCosts', -1],
    ['ptoDays', -1],
    ['paidHolidays', -1],
    ['trainingDays', -1],
  ] as const)('returns a field-specific error for invalid %s', (field, value) => {
    const calculation = calculateLaborBurden({
      ...baselineInput,
      [field]: value,
    });

    expect(calculation.success).toBe(false);
    if (!calculation.success) {
      expect(calculation.errors).toContainEqual(
        expect.objectContaining({ field }),
      );
    }
  });

  it('rejects a zero annual base wage before percentage division', () => {
    const calculation = calculateLaborBurden({
      ...baselineInput,
      hourlyWage: 0,
    });

    expect(calculation).toEqual({
      success: false,
      errors: [
        expect.objectContaining({
          field: 'annualBaseWage',
          code: 'annual_base_wage_nonpositive',
        }),
      ],
    });
  });

  it('rejects non-finite input values', () => {
    const calculation = calculateLaborBurden({
      ...baselineInput,
      hourlyWage: Number.NaN,
    });

    expect(calculation.success).toBe(false);
    if (!calculation.success) {
      expect(calculation.errors).toContainEqual(
        expect.objectContaining({
          field: 'hourlyWage',
          code: 'not_finite',
        }),
      );
    }
  });
});
