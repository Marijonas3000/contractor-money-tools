import { describe, expect, it } from 'vitest';

import {
  calculateContractorOverhead,
  type ContractorOverheadInput,
  type ContractorOverheadResult,
  type DetailedContractorOverheadInput,
  type TotalContractorOverheadInput,
} from '../../src/lib/calculators/contractor-overhead';

const detailedBaseline: DetailedContractorOverheadInput = {
  overheadEntryMode: 'detailed',
  officeShop: 12000,
  administrativePayroll: 36000,
  insuranceBonding: 12000,
  vehiclesTransportationOverhead: 18000,
  softwareCommunications: 6000,
  marketingSales: 12000,
  professionalCompliance: 6000,
  equipmentShopOverhead: 12000,
  otherOverhead: 6000,
};

const totalBaseline: TotalContractorOverheadInput = {
  overheadEntryMode: 'total',
  totalAnnualOverhead: 120000,
};

function expectSuccess(input: ContractorOverheadInput): ContractorOverheadResult {
  const calculation = calculateContractorOverhead(input);
  expect(calculation.success).toBe(true);
  if (!calculation.success) throw new Error('Expected a successful calculation.');
  return calculation.result;
}

function expectError(
  input: ContractorOverheadInput,
  field: string,
  code?: string,
) {
  const calculation = calculateContractorOverhead(input);
  expect(calculation.success).toBe(false);
  if (calculation.success) throw new Error('Expected a validation error.');
  expect(calculation.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ field, ...(code ? { code } : {}) }),
    ]),
  );
}

describe('calculateContractorOverhead', () => {
  describe('detailed overhead', () => {
    it('calculates a detailed baseline', () => {
      const result = expectSuccess(detailedBaseline);
      expect(result.overheadEntryMode).toBe('detailed');
      expect(result.totalAnnualOverhead).toBe(120000);
    });

    it('includes every detailed category', () => {
      const result = expectSuccess({
        overheadEntryMode: 'detailed',
        officeShop: 1,
        administrativePayroll: 2,
        insuranceBonding: 4,
        vehiclesTransportationOverhead: 8,
        softwareCommunications: 16,
        marketingSales: 32,
        professionalCompliance: 64,
        equipmentShopOverhead: 128,
        otherOverhead: 256,
      });
      expect(result.totalAnnualOverhead).toBe(511);
    });

    it('allows zero-valued individual categories', () => {
      const result = expectSuccess({
        ...detailedBaseline,
        officeShop: 0,
        insuranceBonding: 0,
        otherOverhead: 0,
      });
      expect(result.totalAnnualOverhead).toBe(90000);
    });

    it('rejects all detailed categories equal to zero', () => {
      expectError(
        {
          overheadEntryMode: 'detailed',
          officeShop: 0,
          administrativePayroll: 0,
          insuranceBonding: 0,
          vehiclesTransportationOverhead: 0,
          softwareCommunications: 0,
          marketingSales: 0,
          professionalCompliance: 0,
          equipmentShopOverhead: 0,
          otherOverhead: 0,
        },
        'totalAnnualOverhead',
        'annual_overhead_nonpositive',
      );
    });

    it('rejects a negative active category', () => {
      expectError(
        { ...detailedBaseline, administrativePayroll: -1 },
        'administrativePayroll',
        'must_be_nonnegative',
      );
    });

    it('rejects a non-finite active category', () => {
      expectError(
        { ...detailedBaseline, insuranceBonding: Number.NaN },
        'insuranceBonding',
        'not_finite',
      );
    });
  });

  describe('simple overhead', () => {
    it('calculates a total-mode baseline', () => {
      const result = expectSuccess(totalBaseline);
      expect(result.overheadEntryMode).toBe('total');
      expect(result.totalAnnualOverhead).toBe(120000);
    });

    it('rejects zero total overhead', () => {
      expectError(
        { ...totalBaseline, totalAnnualOverhead: 0 },
        'totalAnnualOverhead',
        'must_be_positive',
      );
    });

    it('rejects negative total overhead', () => {
      expectError(
        { ...totalBaseline, totalAnnualOverhead: -1 },
        'totalAnnualOverhead',
        'must_be_positive',
      );
    });

    it('rejects non-finite total overhead', () => {
      expectError(
        { ...totalBaseline, totalAnnualOverhead: Number.POSITIVE_INFINITY },
        'totalAnnualOverhead',
        'not_finite',
      );
    });
  });

  describe('representation handling', () => {
    it('ignores inactive detailed values in total mode', () => {
      const input = {
        ...totalBaseline,
        officeShop: -1000,
        administrativePayroll: Number.NaN,
      } as unknown as ContractorOverheadInput;
      expect(expectSuccess(input).totalAnnualOverhead).toBe(120000);
    });

    it('ignores an inactive total value in detailed mode', () => {
      const input = {
        ...detailedBaseline,
        totalAnnualOverhead: -500000,
      } as unknown as ContractorOverheadInput;
      expect(expectSuccess(input).totalAnnualOverhead).toBe(120000);
    });

    it('never double-counts detailed and total representations', () => {
      const detailedInput = {
        ...detailedBaseline,
        totalAnnualOverhead: 500000,
      } as unknown as ContractorOverheadInput;
      const totalInput = {
        ...totalBaseline,
        officeShop: 500000,
      } as unknown as ContractorOverheadInput;
      expect(expectSuccess(detailedInput).totalAnnualOverhead).toBe(120000);
      expect(expectSuccess(totalInput).totalAnnualOverhead).toBe(120000);
    });

    it('validates only the active overhead representation', () => {
      const input = {
        ...totalBaseline,
        officeShop: Number.NaN,
        otherOverhead: -1,
      } as unknown as ContractorOverheadInput;
      expect(expectSuccess(input).totalAnnualOverhead).toBe(120000);
    });
  });

  describe('annual, monthly, and weekly outputs', () => {
    it('returns the annual overhead total', () => {
      expect(expectSuccess(totalBaseline).totalAnnualOverhead).toBe(120000);
    });

    it('calculates monthly overhead using exactly 12 months', () => {
      expect(expectSuccess(totalBaseline).monthlyOverhead).toBe(10000);
    });

    it('calculates weekly overhead using exactly 52 weeks', () => {
      expect(expectSuccess(totalBaseline).weeklyOverhead).toBe(
        120000 / 52,
      );
    });
  });

  describe('revenue recovery', () => {
    it('calculates a revenue recovery baseline', () => {
      const recovery = expectSuccess({
        ...totalBaseline,
        annualRevenue: 480000,
      }).revenueRecovery;
      expect(recovery).toEqual({
        annualRevenue: 480000,
        overheadAsPercentOfRevenue: 25,
      });
    });

    it('calculates 120000 divided by 600000 as 20 percent', () => {
      expect(
        expectSuccess({ ...totalBaseline, annualRevenue: 600000 })
          .revenueRecovery?.overheadAsPercentOfRevenue,
      ).toBe(20);
    });

    it('suppresses revenue recovery when omitted', () => {
      expect(expectSuccess(totalBaseline).revenueRecovery).toBeNull();
    });

    it('suppresses revenue recovery when null', () => {
      expect(
        expectSuccess({ ...totalBaseline, annualRevenue: null })
          .revenueRecovery,
      ).toBeNull();
    });

    it('rejects explicit zero revenue', () => {
      expectError(
        { ...totalBaseline, annualRevenue: 0 },
        'annualRevenue',
        'must_be_positive',
      );
    });

    it('rejects negative revenue', () => {
      expectError(
        { ...totalBaseline, annualRevenue: -1 },
        'annualRevenue',
        'must_be_positive',
      );
    });

    it('rejects non-finite revenue', () => {
      expectError(
        { ...totalBaseline, annualRevenue: Number.NaN },
        'annualRevenue',
        'not_finite',
      );
    });
  });

  describe('direct labor recovery', () => {
    it('calculates 0.50 overhead per direct labor dollar', () => {
      expect(
        expectSuccess({ ...totalBaseline, annualDirectLaborCost: 240000 })
          .directLaborRecovery?.overheadPerDollar,
      ).toBe(0.5);
    });

    it('calculates the equivalent 50 percent of direct labor cost', () => {
      expect(
        expectSuccess({ ...totalBaseline, annualDirectLaborCost: 240000 })
          .directLaborRecovery?.overheadAsPercentOfBase,
      ).toBe(50);
    });

    it('suppresses direct labor recovery when omitted', () => {
      expect(expectSuccess(totalBaseline).directLaborRecovery).toBeNull();
    });

    it('rejects explicit zero direct labor cost', () => {
      expectError(
        { ...totalBaseline, annualDirectLaborCost: 0 },
        'annualDirectLaborCost',
        'must_be_positive',
      );
    });

    it('rejects negative direct labor cost', () => {
      expectError(
        { ...totalBaseline, annualDirectLaborCost: -1 },
        'annualDirectLaborCost',
        'must_be_positive',
      );
    });
  });

  describe('direct cost recovery', () => {
    it('calculates 0.30 overhead per direct-cost dollar', () => {
      expect(
        expectSuccess({ ...totalBaseline, annualDirectJobCosts: 400000 })
          .directCostRecovery?.overheadPerDollar,
      ).toBe(0.3);
    });

    it('calculates the equivalent 30 percent of direct job cost', () => {
      expect(
        expectSuccess({ ...totalBaseline, annualDirectJobCosts: 400000 })
          .directCostRecovery?.overheadAsPercentOfBase,
      ).toBe(30);
    });

    it('suppresses direct-cost recovery when omitted', () => {
      expect(expectSuccess(totalBaseline).directCostRecovery).toBeNull();
    });

    it('rejects explicit zero direct job costs', () => {
      expectError(
        { ...totalBaseline, annualDirectJobCosts: 0 },
        'annualDirectJobCosts',
        'must_be_positive',
      );
    });

    it('rejects negative direct job costs', () => {
      expectError(
        { ...totalBaseline, annualDirectJobCosts: -1 },
        'annualDirectJobCosts',
        'must_be_positive',
      );
    });
  });

  describe('productive-hour recovery', () => {
    it('calculates 30 dollars per productive field hour', () => {
      expect(
        expectSuccess({
          ...totalBaseline,
          annualProductiveFieldHours: 4000,
        }).productiveHourRecovery?.overheadPerProductiveFieldHour,
      ).toBe(30);
    });

    it('suppresses productive-hour recovery when omitted', () => {
      expect(expectSuccess(totalBaseline).productiveHourRecovery).toBeNull();
    });

    it('rejects explicit zero productive field hours', () => {
      expectError(
        { ...totalBaseline, annualProductiveFieldHours: 0 },
        'annualProductiveFieldHours',
        'must_be_positive',
      );
    });

    it('rejects negative productive field hours', () => {
      expectError(
        { ...totalBaseline, annualProductiveFieldHours: -1 },
        'annualProductiveFieldHours',
        'must_be_positive',
      );
    });
  });

  describe('multiple recovery views', () => {
    const allViewsInput: TotalContractorOverheadInput = {
      ...totalBaseline,
      annualRevenue: 600000,
      annualDirectLaborCost: 240000,
      annualDirectJobCosts: 400000,
      annualProductiveFieldHours: 4000,
    };

    it('returns all recovery views when all denominators are provided', () => {
      const result = expectSuccess(allViewsInput);
      expect(result.revenueRecovery).not.toBeNull();
      expect(result.directLaborRecovery).not.toBeNull();
      expect(result.directCostRecovery).not.toBeNull();
      expect(result.productiveHourRecovery).not.toBeNull();
    });

    it('uses the same annual overhead across all recovery views', () => {
      const result = expectSuccess(allViewsInput);
      expect(result.revenueRecovery?.overheadAsPercentOfRevenue).toBe(20);
      expect(result.directLaborRecovery?.overheadPerDollar).toBe(0.5);
      expect(result.directCostRecovery?.overheadPerDollar).toBe(0.3);
      expect(
        result.productiveHourRecovery?.overheadPerProductiveFieldHour,
      ).toBe(30);
    });

    it('does not let denominator values change annual overhead', () => {
      expect(expectSuccess(allViewsInput).totalAnnualOverhead).toBe(
        expectSuccess(totalBaseline).totalAnnualOverhead,
      );
    });

    it('keeps recovery views independent', () => {
      const result = expectSuccess({
        ...totalBaseline,
        annualDirectJobCosts: 400000,
      });
      expect(result.revenueRecovery).toBeNull();
      expect(result.directLaborRecovery).toBeNull();
      expect(result.directCostRecovery).not.toBeNull();
      expect(result.productiveHourRecovery).toBeNull();
    });
  });

  describe('precision and safety', () => {
    it('preserves decimal precision', () => {
      const result = expectSuccess({
        ...totalBaseline,
        totalAnnualOverhead: 123456.78,
        annualRevenue: 654321.09,
      });
      expect(result.monthlyOverhead).toBe(123456.78 / 12);
      expect(result.weeklyOverhead).toBe(123456.78 / 52);
      expect(result.revenueRecovery?.overheadAsPercentOfRevenue).toBe(
        (123456.78 / 654321.09) * 100,
      );
    });

    it('supports large finite values', () => {
      const result = expectSuccess({
        ...totalBaseline,
        totalAnnualOverhead: 1e250,
        annualRevenue: 2e250,
      });
      expect(result.totalAnnualOverhead).toBe(1e250);
      expect(result.revenueRecovery?.overheadAsPercentOfRevenue).toBe(50);
    });

    it('returns an overflow error when detailed summation overflows', () => {
      expectError(
        {
          overheadEntryMode: 'detailed',
          officeShop: Number.MAX_VALUE,
          administrativePayroll: Number.MAX_VALUE,
          insuranceBonding: 0,
          vehiclesTransportationOverhead: 0,
          softwareCommunications: 0,
          marketingSales: 0,
          professionalCompliance: 0,
          equipmentShopOverhead: 0,
          otherOverhead: 0,
        },
        'calculation',
        'calculation_overflow',
      );
    });

    it('returns an overflow error when a recovery result overflows', () => {
      expectError(
        {
          ...totalBaseline,
          totalAnnualOverhead: Number.MAX_VALUE,
          annualProductiveFieldHours: Number.MIN_VALUE,
        },
        'calculation',
        'calculation_overflow',
      );
    });

    it('returns a structured error for an unsupported entry mode', () => {
      expectError(
        {
          ...totalBaseline,
          overheadEntryMode: 'unsupported',
        } as unknown as ContractorOverheadInput,
        'overheadEntryMode',
        'unsupported_entry_mode',
      );
    });
  });
});
