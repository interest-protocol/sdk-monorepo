import { Tick } from '@/entities';
import { TickMath } from '@/math';

describe(Tick.name, () => {
  describe(Tick.nearestUsableTick.name, () => {
    it('throws if tickSpacing is 0', () => {
      expect(() => Tick.nearestUsableTick({ tick: 1, tickSpacing: 0 })).toThrow(
        'nearestUsableTick: TICK_SPACING'
      );
    });

    it('throws if tickSpacing is negative', () => {
      expect(() =>
        Tick.nearestUsableTick({ tick: 1, tickSpacing: -5 })
      ).toThrow('nearestUsableTick: TICK_SPACING');
    });

    it('throws if either is non-integer', () => {
      expect(() =>
        Tick.nearestUsableTick({ tick: 1.5, tickSpacing: 1 })
      ).toThrow('nearestUsableTick: INTEGERS');
      expect(() =>
        Tick.nearestUsableTick({ tick: 1, tickSpacing: 1.5 })
      ).toThrow('nearestUsableTick: INTEGERS');
    });

    it('throws if tick is greater than TickMath.MAX_TICK', () => {
      expect(() =>
        Tick.nearestUsableTick({ tick: TickMath.MAX_TICK + 1, tickSpacing: 1 })
      ).toThrow(
        'nearestUsableTick: tick must be between MIN_TICK and MAX_TICK'
      );
      expect(() =>
        Tick.nearestUsableTick({ tick: TickMath.MIN_TICK - 1, tickSpacing: 1 })
      ).toThrow(
        'nearestUsableTick: tick must be between MIN_TICK and MAX_TICK'
      );
    });

    it('rounds at positive half', () => {
      expect(Tick.nearestUsableTick({ tick: 5, tickSpacing: 10 })).toEqual(10);
    });

    it('rounds down below positive half', () => {
      expect(Tick.nearestUsableTick({ tick: 4, tickSpacing: 10 })).toEqual(0);
    });

    it('rounds up for negative half', () => {
      expect(Tick.nearestUsableTick({ tick: -5, tickSpacing: 10 })).toEqual(-0);
    });

    it('rounds up for negative half', () => {
      expect(Tick.nearestUsableTick({ tick: -6, tickSpacing: 10 })).toEqual(
        -10
      );
    });

    it('cannot round past MIN_TICK', () => {
      expect(
        Tick.nearestUsableTick({
          tick: TickMath.MIN_TICK,
          tickSpacing: TickMath.MAX_TICK / 2 + 100,
        })
      ).toEqual(-(TickMath.MAX_TICK / 2 + 100));
    });

    it('cannot round past MAX_TICK', () => {
      expect(
        Tick.nearestUsableTick({
          tick: TickMath.MAX_TICK,
          tickSpacing: TickMath.MAX_TICK / 2 + 100,
        })
      ).toEqual(TickMath.MAX_TICK / 2 + 100);
    });
  });
});
