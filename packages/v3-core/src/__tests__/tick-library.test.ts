import { MaxUint128 } from '@/constants';

import { TickLibrary } from '../tick';

describe(TickLibrary.name, () => {
  describe(TickLibrary.getFeeGrowthInside.name, () => {
    it('returns all for two uninitialized ticks if the tick is inside', () => {
      const [feeGrowthInside0X64, feeGrowthInside1X64] =
        TickLibrary.getFeeGrowthInside({
          tickLower: {
            value: -2,
            feeGrowthOutside0X64: 0n,
            feeGrowthOutside1X64: 0n,
          },
          tickUpper: {
            value: 2,
            feeGrowthOutside0X64: 0n,
            feeGrowthOutside1X64: 0n,
          },
          tickCurrent: 0,
          feeGrowthGlobal0X64: 15n,
          feeGrowthGlobal1X64: 15n,
        });

      expect(feeGrowthInside0X64).toEqual(15n);
      expect(feeGrowthInside1X64).toEqual(15n);
    });

    it('returns 0 for two uninitialized ticks if the tick is above', () => {
      const [feeGrowthInside0X64, feeGrowthInside1X64] =
        TickLibrary.getFeeGrowthInside({
          tickLower: {
            value: -2,
            feeGrowthOutside0X64: 0n,
            feeGrowthOutside1X64: 0n,
          },
          tickUpper: {
            value: 2,
            feeGrowthOutside0X64: 0n,
            feeGrowthOutside1X64: 0n,
          },
          tickCurrent: 4,
          feeGrowthGlobal0X64: 15n,
          feeGrowthGlobal1X64: 15n,
        });

      expect(feeGrowthInside0X64).toEqual(0n);
      expect(feeGrowthInside1X64).toEqual(0n);
    });

    it('returns 0 for two uninitialized ticks if the tick is below', () => {
      const [feeGrowthInside0X64, feeGrowthInside1X64] =
        TickLibrary.getFeeGrowthInside({
          tickLower: {
            value: -2,
            feeGrowthOutside0X64: 0n,
            feeGrowthOutside1X64: 0n,
          },
          tickUpper: {
            value: 2,
            feeGrowthOutside0X64: 0n,
            feeGrowthOutside1X64: 0n,
          },
          tickCurrent: -4,
          feeGrowthGlobal0X64: 15n,
          feeGrowthGlobal1X64: 15n,
        });

      expect(feeGrowthInside0X64).toEqual(0n);
      expect(feeGrowthInside1X64).toEqual(0n);
    });

    it('subtracts lower tick if below, with ticker upper growth', () => {
      const [feeGrowthInside0X64, feeGrowthInside1X64] =
        TickLibrary.getFeeGrowthInside({
          tickLower: {
            value: -2,
            feeGrowthOutside0X64: 0n,
            feeGrowthOutside1X64: 0n,
          },
          tickUpper: {
            value: 2,
            feeGrowthOutside0X64: 2n,
            feeGrowthOutside1X64: 3n,
          },
          tickCurrent: 0,
          feeGrowthGlobal0X64: 15n,
          feeGrowthGlobal1X64: 15n,
        });

      expect(feeGrowthInside0X64).toEqual(13n);
      expect(feeGrowthInside1X64).toEqual(12n);
    });

    it('subtracts lower tick is below, with ticker lower growth', () => {
      const [feeGrowthInside0X64, feeGrowthInside1X64] =
        TickLibrary.getFeeGrowthInside({
          tickLower: {
            value: -2,
            feeGrowthOutside0X64: 2n,
            feeGrowthOutside1X64: 3n,
          },
          tickUpper: {
            value: 2,
            feeGrowthOutside0X64: 0n,
            feeGrowthOutside1X64: 0n,
          },
          tickCurrent: 0,
          feeGrowthGlobal0X64: 15n,
          feeGrowthGlobal1X64: 15n,
        });

      expect(feeGrowthInside0X64).toEqual(13n);
      expect(feeGrowthInside1X64).toEqual(12n);
    });

    it('subtracts both ticks', () => {
      const [feeGrowthInside0X64, feeGrowthInside1X64] =
        TickLibrary.getFeeGrowthInside({
          tickLower: {
            value: -2,
            feeGrowthOutside0X64: 2n,
            feeGrowthOutside1X64: 3n,
          },
          tickUpper: {
            value: 2,
            feeGrowthOutside0X64: 4n,
            feeGrowthOutside1X64: 1n,
          },
          tickCurrent: 0,
          feeGrowthGlobal0X64: 15n,
          feeGrowthGlobal1X64: 15n,
        });

      expect(feeGrowthInside0X64).toEqual(9n);
      expect(feeGrowthInside1X64).toEqual(11n);
    });

    it('works correctly with overflow on inside tick', () => {
      const [feeGrowthInside0X64, feeGrowthInside1X64] =
        TickLibrary.getFeeGrowthInside({
          tickLower: {
            value: -2,
            feeGrowthOutside0X64: MaxUint128.minus(3n),
            feeGrowthOutside1X64: MaxUint128.minus(2n),
          },
          tickUpper: {
            value: 2,
            feeGrowthOutside0X64: 3n,
            feeGrowthOutside1X64: 5n,
          },
          tickCurrent: 0,
          feeGrowthGlobal0X64: 15n,
          feeGrowthGlobal1X64: 15n,
        });

      expect(feeGrowthInside0X64).toEqual(16n);
      expect(feeGrowthInside1X64).toEqual(13n);
    });
  });
});
