import { Price, Token } from '@/entities';
import { TickMath } from '@/math';

const token0 = new Token({
  address: '0x0',
  decimals: 18,
  symbol: 'ETH',
  name: 'Ethereum',
});

const token1 = new Token({
  address: '0x1',
  decimals: 18,
  symbol: 'USDC',
  name: 'USDC',
});

const token2 = new Token({
  address: '0x2',
  decimals: 6,
  symbol: 'BTC',
  name: 'Bitcoin',
});

describe(Price.fromTick.name, () => {
  it('should throw if tick is out of bounds', () => {
    expect(() =>
      Price.fromTick({
        tick: TickMath.MIN_TICK - 1,
        baseToken: token0,
        quoteToken: token1,
      })
    ).toThrow('TickMath: Invalid tick');

    expect(() =>
      Price.fromTick({
        tick: TickMath.MAX_TICK + 1,
        baseToken: token0,
        quoteToken: token1,
      })
    ).toThrow('TickMath: Invalid tick');
  });

  it('1800 t0/1 t1', () => {
    expect(
      Price.fromTick({
        tick: -74959,
        baseToken: token1,
        quoteToken: token0,
      }).toSignificant(5)
    ).toEqual('1800');
  });

  it('1 t1/1800 t0', () => {
    expect(
      Price.fromTick({
        tick: -74959,
        baseToken: token0,
        quoteToken: token1,
      }).toSignificant(5)
    ).toEqual('0.00055556');
  });

  it('1800 t1/1 t0', () => {
    expect(
      Price.fromTick({
        tick: 74959,
        baseToken: token0,
        quoteToken: token1,
      }).toSignificant(5)
    ).toEqual('1800');
  });

  it('1 t0/1800 t1', () => {
    expect(
      Price.fromTick({
        tick: 74959,
        baseToken: token1,
        quoteToken: token0,
      }).toSignificant(5)
    ).toEqual('0.00055556');
  });

  describe('12 decimal difference', () => {
    it('1.01 t2/1 t0', () => {
      expect(
        Price.fromTick({
          tick: -276225,
          baseToken: token0,
          quoteToken: token2,
        }).toSignificant(5)
      ).toEqual('1.01');
    });

    it('1 t0/1.01 t2', () => {
      expect(
        Price.fromTick({
          tick: -276225,
          baseToken: token2,
          quoteToken: token0,
        }).toSignificant(5)
      ).toEqual('0.99015');
    });

    it('1 t2/1.01 t0', () => {
      expect(
        Price.fromTick({
          tick: -276423,
          baseToken: token0,
          quoteToken: token2,
        }).toSignificant(5)
      ).toEqual('0.99015');
    });

    it('1.01 t0/1 t2', () => {
      expect(
        Price.fromTick({
          tick: -276423,
          baseToken: token2,
          quoteToken: token0,
        }).toSignificant(5)
      ).toEqual('1.0099');
    });

    it('1.01 t2/1 t0', () => {
      expect(
        Price.fromTick({
          tick: -276225,
          baseToken: token0,
          quoteToken: token2,
        }).toSignificant(5)
      ).toEqual('1.01');
    });

    it('1 t0/1.01 t2', () => {
      expect(
        Price.fromTick({
          tick: -276225,
          baseToken: token2,
          quoteToken: token0,
        }).toSignificant(5)
      ).toEqual('0.99015');
    });
  });
});

describe('toClosestTick', () => {
  it('1800 t0/1 t1', () => {
    expect(new Price(token1, token0, 1n, 1800n).toClosestTick()).toEqual(
      -74960
    );
  });

  it('1 t1/1800 t0', () => {
    expect(new Price(token0, token1, 1800n, 1n).toClosestTick()).toEqual(
      -74960
    );
  });

  it('1.01 t2/1 t0', () => {
    expect(
      new Price(
        token0,
        token2,
        100n * 10n ** 18n,
        101n * 10n ** 6n
      ).toClosestTick()
    ).toEqual(-276225);
  });

  it('1 t0/1.01 t2', () => {
    expect(
      new Price(
        token2,
        token0,
        101n * 10n ** 6n,
        100n * 10n ** 18n
      ).toClosestTick()
    ).toEqual(-276225);
  });

  describe('reciprocal with tickToPrice', () => {
    it('1800 t0/1 t1', () => {
      expect(
        Price.fromTick({
          tick: -74960,
          baseToken: token1,
          quoteToken: token0,
        }).toClosestTick()
      ).toEqual(-74960);
    });

    it('1 t0/1800 t1', () => {
      expect(
        Price.fromTick({
          tick: 74960,
          baseToken: token1,
          quoteToken: token0,
        }).toClosestTick()
      ).toEqual(74960);
    });

    it('1 t1/1800 t0', () => {
      expect(
        Price.fromTick({
          tick: -74960,
          baseToken: token0,
          quoteToken: token1,
        }).toClosestTick()
      ).toEqual(-74960);
    });

    it('1800 t1/1 t0', () => {
      expect(
        Price.fromTick({
          tick: 74960,
          baseToken: token0,
          quoteToken: token1,
        }).toClosestTick()
      ).toEqual(74960);
    });

    it('1.01 t2/1 t0', () => {
      expect(
        Price.fromTick({
          tick: -276225,
          baseToken: token0,
          quoteToken: token2,
        }).toClosestTick()
      ).toEqual(-276225);
    });

    it('1 t0/1.01 t2', () => {
      expect(
        Price.fromTick({
          tick: -276225,
          baseToken: token2,
          quoteToken: token0,
        }).toClosestTick()
      ).toEqual(-276225);
    });
  });
});
