import { Q64 } from '@/constants';

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
});
