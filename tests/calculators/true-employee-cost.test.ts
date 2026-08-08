import { describe, expect, it } from 'vitest';

import {
  calculateTrueEmployeeCost,
  type HourlyTrueEmployeeCostInput,
  type SalariedTrueEmployeeCostInput,
  type TrueEmployeeCostInput,
} from '../../src/lib/calculators/true-employee-cost';

const commonCosts = {
  payrollTaxRatePercent: 7.65,
  workersCompRatePercent: 3,
  healthInsurance: 6_000,
  retirementContribution: 1_800,
  bonusesAndCommissions: 5_000,
  otherBenefits: 500,
  recruitingHiringCost: 2_000,
  trainingCost: 1_000,
  toolsUniforms: 1_200,
  phoneDeviceCost: 600,
  vehicleCost: 6_000,
  softwareLicenses: 1_200,
  workspaceAllocation: 2_400,
  otherAnnualEmployeeCosts: 800,
};

const hourlyInput: HourlyTrueEmployeeCostInput = {
  mode: 'hourly',
  hourlyWage: 30,
  hoursPerWeek: 40,
  weeksPerYear: 52,
  ...commonCosts,
};

const salaryInput: SalariedTrueEmployeeCostInput = {
  mode: 'salary',
  annualSalary: 70_000,
  ...commonCosts,
};

function expectSuccess(input: TrueEmployeeCostInput) {
  const calculation = calculateTrueEmployeeCost(input);
  expect(calculation.success).toBe(true);

  if (!calculation.success) {
    throw new Error('Expected a successful true employee cost calculation.');
  }

  return calculation.result;
}

describe('calculateTrueEmployeeCost', () => {
  it('calculates an hourly baseline scenario', () => {
    const result = expectSuccess(hourlyInput);

    expect(result.mode).toBe('hourly');
    expect(result.annualBaseCompensation).toBe(62_400);
    expect(result.payrollTaxes).toBe(4_773.6);
    expect(result.workersComp).toBe(1_872);
    expect(result.additionalCashCompensation).toBe(5_000);
    expect(result.benefitsCost).toBe(8_300);
    expect(result.operatingSupportCost).toBe(15_200);
    expect(result.totalAnnualEmployeeCost).toBe(97_545.6);
    expect(result.additionalEmployerCost).toBeCloseTo(35_145.6, 10);
    expect(result.additionalEmployerCostPercent).toBeCloseTo(56.3230769, 7);
    expect(result.monthlyEmployerCost).toBe(8_128.8);
    expect(result.weeklyEmployerCost).toBeCloseTo(1_875.876923, 6);
    expect(result.annualPaidHours).toBe(2_080);
    expect(result.paidHourEmployerCost).toBeCloseTo(46.896923, 6);
  });

  it('calculates a salaried baseline scenario', () => {
    const result = expectSuccess(salaryInput);

    expect(result.mode).toBe('salary');
    expect(result.annualBaseCompensation).toBe(70_000);
    expect(result.payrollTaxes).toBe(5_355);
    expect(result.workersComp).toBe(2_100);
    expect(result.totalAnnualEmployeeCost).toBe(105_955);
    expect(result.annualPaidHours).toBeNull();
    expect(result.paidHourEmployerCost).toBeNull();
  });

  it('supports zero for all optional annual costs', () => {
    const result = expectSuccess({
      ...hourlyInput,
      healthInsurance: 0,
      retirementContribution: 0,
      bonusesAndCommissions: 0,
      otherBenefits: 0,
      recruitingHiringCost: 0,
      trainingCost: 0,
      toolsUniforms: 0,
      phoneDeviceCost: 0,
      vehicleCost: 0,
      softwareLicenses: 0,
      workspaceAllocation: 0,
      otherAnnualEmployeeCosts: 0,
    });

    expect(result.additionalCashCompensation).toBe(0);
    expect(result.benefitsCost).toBe(0);
    expect(result.operatingSupportCost).toBe(0);
    expect(result.totalAnnualEmployeeCost).toBe(69_045.6);
  });

  it('supports zero payroll tax and workers compensation rates', () => {
    const result = expectSuccess({
      ...hourlyInput,
      payrollTaxRatePercent: 0,
      workersCompRatePercent: 0,
    });

    expect(result.payrollTaxes).toBe(0);
    expect(result.workersComp).toBe(0);
    expect(result.totalAnnualEmployeeCost).toBe(90_900);
  });

  it('supports a decimal hourly wage without rounding', () => {
    const result = expectSuccess({
      ...hourlyInput,
      hourlyWage: 30.75,
    });

    expect(result.annualBaseCompensation).toBe(63_960);
    expect(result.totalAnnualEmployeeCost).toBe(99_271.74);
  });

  it('calculates large but valid values', () => {
    const result = expectSuccess({
      ...hourlyInput,
      hourlyWage: 10_000,
      hoursPerWeek: 100,
      weeksPerYear: 100,
      payrollTaxRatePercent: 250,
      workersCompRatePercent: 125,
      healthInsurance: 10_000_000,
      retirementContribution: 10_000_000,
      bonusesAndCommissions: 10_000_000,
      otherBenefits: 10_000_000,
      recruitingHiringCost: 10_000_000,
      trainingCost: 10_000_000,
      toolsUniforms: 10_000_000,
      phoneDeviceCost: 10_000_000,
      vehicleCost: 10_000_000,
      softwareLicenses: 10_000_000,
      workspaceAllocation: 10_000_000,
      otherAnnualEmployeeCosts: 10_000_000,
    });

    expect(result.annualBaseCompensation).toBe(100_000_000);
    expect(result.benefitsCost).toBe(30_000_000);
    expect(result.operatingSupportCost).toBe(80_000_000);
    expect(result.totalAnnualEmployeeCost).toBe(595_000_000);
  });

  it.each([
    ['hourlyWage', 0],
    ['hoursPerWeek', 0],
    ['weeksPerYear', 0],
  ] as const)('rejects invalid hourly compensation field %s', (field, value) => {
    const calculation = calculateTrueEmployeeCost({
      ...hourlyInput,
      [field]: value,
    });

    expect(calculation.success).toBe(false);
    if (!calculation.success) {
      expect(calculation.errors).toContainEqual(
        expect.objectContaining({ field, code: 'must_be_positive' }),
      );
    }
  });

  it('rejects invalid salary compensation', () => {
    const calculation = calculateTrueEmployeeCost({
      ...salaryInput,
      annualSalary: 0,
    });

    expect(calculation.success).toBe(false);
    if (!calculation.success) {
      expect(calculation.errors).toContainEqual(
        expect.objectContaining({
          field: 'annualSalary',
          code: 'must_be_positive',
        }),
      );
    }
  });

  it('calculates the cost multiplier from total cost and base compensation', () => {
    const result = expectSuccess(hourlyInput);

    expect(result.costMultiplier).toBeCloseTo(1.563230769, 9);
    expect(result.costMultiplier).toBe(
      result.totalAnnualEmployeeCost / result.annualBaseCompensation,
    );
  });

  it('calculates the optional revenue scenario', () => {
    const result = expectSuccess({
      ...hourlyInput,
      expectedAnnualRevenue: 250_000,
    });

    expect(result.revenueScenario).toEqual({
      expectedAnnualRevenue: 250_000,
      revenueToCostRatio: 250_000 / 97_545.6,
      contributionBeforeSharedOverhead: 152_454.4,
    });
  });

  it.each([
    ['omitted', undefined],
    ['blank', null],
    ['zero', 0],
  ] as const)('safely omits the revenue scenario when revenue is %s', (_label, value) => {
    const result = expectSuccess({
      ...hourlyInput,
      expectedAnnualRevenue: value,
    });

    expect(result.revenueScenario).toBeNull();
  });

  it('does not double-count base pay, bonuses, or benefits', () => {
    const withoutExtras = expectSuccess({
      ...hourlyInput,
      bonusesAndCommissions: 0,
      healthInsurance: 0,
      retirementContribution: 0,
      otherBenefits: 0,
    });
    const withExtras = expectSuccess(hourlyInput);

    expect(withExtras.annualBaseCompensation).toBe(
      withoutExtras.annualBaseCompensation,
    );
    expect(
      withExtras.totalAnnualEmployeeCost -
        withoutExtras.totalAnnualEmployeeCost,
    ).toBe(13_300);
  });

  it.each([
    ['payrollTaxRatePercent', -1],
    ['workersCompRatePercent', -1],
    ['healthInsurance', -1],
    ['bonusesAndCommissions', -1],
    ['vehicleCost', -1],
  ] as const)('returns a field-specific error for negative %s', (field, value) => {
    const calculation = calculateTrueEmployeeCost({
      ...hourlyInput,
      [field]: value,
    });

    expect(calculation.success).toBe(false);
    if (!calculation.success) {
      expect(calculation.errors).toContainEqual(
        expect.objectContaining({ field, code: 'must_be_nonnegative' }),
      );
    }
  });

  it('rejects negative expected revenue', () => {
    const calculation = calculateTrueEmployeeCost({
      ...hourlyInput,
      expectedAnnualRevenue: -1,
    });

    expect(calculation.success).toBe(false);
    if (!calculation.success) {
      expect(calculation.errors).toContainEqual(
        expect.objectContaining({
          field: 'expectedAnnualRevenue',
          code: 'must_be_nonnegative',
        }),
      );
    }
  });

  it('rejects non-finite input values', () => {
    const calculation = calculateTrueEmployeeCost({
      ...salaryInput,
      annualSalary: Number.NaN,
    });

    expect(calculation.success).toBe(false);
    if (!calculation.success) {
      expect(calculation.errors).toContainEqual(
        expect.objectContaining({
          field: 'annualSalary',
          code: 'not_finite',
        }),
      );
    }
  });
});
