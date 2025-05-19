import { TickMath } from '@/math';

describe(TickMath.name, () => {
  describe(TickMath.getSqrtRatioAtTick.name, () => {
    it('throws if the tick is too low', () => {
      expect(() =>
        TickMath.getSqrtRatioAtTick(TickMath.MIN_TICK - 1)
      ).toThrow();
    });

    it('throws if the tick is too high', () => {
      expect(() =>
        TickMath.getSqrtRatioAtTick(TickMath.MAX_TICK + 1)
      ).toThrow();
    });

    it('returns the max sqrt ratio at the max tick', () => {
      expect(TickMath.getSqrtRatioAtTick(TickMath.MAX_TICK)).toBe(
        TickMath.MAX_SQRT_RATIO
      );
    });

    it('returns the min sqrt ratio at the min tick', () => {
      expect(TickMath.getSqrtRatioAtTick(TickMath.MIN_TICK)).toBe(
        TickMath.MIN_SQRT_RATIO
      );
    });

    it.each([
      [-50, 0xff5c5f6fd9875942n],
      [50, 0x100a4096906976f10n],
      [-100, 0xfeb927758f54316bn],
      [100, 0x101487bee1c17ddb4n],
      [-250, 0xfcd1f06e35bcde2bn],
      [250, 0x103384cc810558cdfn],
      [-500, 0xf9adfd836f8e67fcn],
      [500, 0x1067af7be7f9ba686n],
      [-1000, 0xf383ed6a4db4dabdn],
      [1000, 0x10d1fee2afe856135n],
      [-2500, 0xe1ebadaf4348cf03n],
      [2500, 0x122158d8bd5e8608cn],
      [-3000, 0xdc57c7edc0953c8an],
      [3000, 0x1296d65dd39b9cdb1n],
      [-4000, 0xd198e00abfc929b2n],
      [4000, 0x138ad0cfe73ce1e71n],
      [-5000, 0xc760204669e1dc7cn],
      [5000, 0x148b4d68157d6e8e3n],
      [-150000, 0x2442b231afa401n],
      [150000, 0x70f5d5483c9bc7ecacan],
      [-250000, 0x3e8fdc0fc406n],
      [250000, 0x41789a3a867a82754af6en],
    ])('for tick %i returns %s price', (tick, expected) => {
      expect(TickMath.getSqrtRatioAtTick(tick)).toBe(expected);
    });
  });

  describe(TickMath.getTickAtSqrtRatio.name, () => {
    it('throws if the sqrt ratio is too low', () => {
      expect(() =>
        TickMath.getTickAtSqrtRatio(TickMath.MIN_SQRT_RATIO - 1n)
      ).toThrow();
    });

    it('throws if the sqrt ratio is too high', () => {
      expect(() =>
        TickMath.getTickAtSqrtRatio(TickMath.MAX_SQRT_RATIO + 1n)
      ).toThrow();
    });

    it.each([
      [-28861, -28861, 0n],
      [-28861, -28861, 1n],
      [-28861, -28860, -1n],
      [-28862, -28861, -1n],
      [28861, 28861, 0n],
      [28861, 28861, 1n],
      [28861, 28862, -1n],
      [28860, 28861, -1n],
    ])(
      'tick %i with expectedTick %i and offset %i rounds as expected',
      (tick, expectedTick, priceOffset) => {
        expect(tick).toBe(
          TickMath.getTickAtSqrtRatio(
            TickMath.getSqrtRatioAtTick(expectedTick) + priceOffset
          )
        );
      }
    );

    it.each([
      [TickMath.MIN_SQRT_RATIO, TickMath.MIN_TICK],
      [TickMath.MAX_SQRT_RATIO - 1n, TickMath.MAX_TICK - 1],
      [18446744073709551616000000n, 276324],
      [18446744073709551616000n, 138162],
      [2305843009213693952n, -41591],
      [6521908912666391106n, -20796],
      [13043817825332782212n, -6932],
      [18446744073709551616n, 0],
      [26087635650665564424n, 6931],
      [52175271301331128849n, 20795],
      [147573952589676412928n, 41590],
      [18446744073709551n, -138163],
      [18446744073709n, -276325],
      [79226673515401279992447579060n, 443635],
    ])('price %i equals to tick %i', (price, expectedTick) => {
      expect(TickMath.getTickAtSqrtRatio(price)).toBe(expectedTick);
    });
  });
});
