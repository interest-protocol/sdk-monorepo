import { PositionStatus, Q64 } from '@/constants';

import { PositionLibrary } from '../position-library';

describe(PositionLibrary.name, () => {
  describe(PositionLibrary.getTokensOwed.name, () => {
    it('0', () => {
      const [tokensOwed0, tokensOwed1] = PositionLibrary.getTokensOwed({
        liquidity: 0,
        feeGrowthInside0X64: 0,
        feeGrowthInside1X64: 0,
        feeGrowthInside0LastX64: 0,
        feeGrowthInside1LastX64: 0,
      });

      expect(tokensOwed0).toEqual(0n);
      expect(tokensOwed1).toEqual(0n);
    });

    it('non-0', () => {
      const [tokensOwed0, tokensOwed1] = PositionLibrary.getTokensOwed({
        liquidity: 1,
        feeGrowthInside0X64: Q64,
        feeGrowthInside1X64: Q64,
        feeGrowthInside0LastX64: 0,
        feeGrowthInside1LastX64: 0,
      });
      expect(tokensOwed0).toEqual(1n);
      expect(tokensOwed1).toEqual(1n);
    });
  });

  describe(PositionLibrary.getStatus.name, () => {
    it('below range', () => {
      const status = PositionLibrary.getStatus({
        lowerTick: -2,
        upperTick: -1,
        tick: 0,
      });

      expect(status).toEqual(PositionStatus.AboveRange);
    });

    it('active', () => {
      const status = PositionLibrary.getStatus({
        lowerTick: 1,
        upperTick: 2,
        tick: 1.5,
      });

      expect(status).toEqual(PositionStatus.Active);
    });

    it('above range', () => {
      const status = PositionLibrary.getStatus({
        lowerTick: 1,
        upperTick: 2,
        tick: 0,
      });

      expect(status).toEqual(PositionStatus.BelowRange);
    });
  });
});
