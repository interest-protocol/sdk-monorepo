import { PriceEncoder } from '@/math';

import { Q64 } from '../constants';

describe(PriceEncoder.encodeSqrtPriceX64.name, () => {
  it('should encode the sqrt price x64', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({
        amount0: 1n,
        amount1: 1n,
        decimals0: 1,
        decimals1: 1,
      })
    ).toEqual(BigInt(Q64.toString()));
  });

  it('100/1', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({
        amount0: 1n,
        amount1: 100n,
        decimals0: 1,
        decimals1: 1,
      })
    ).toEqual(184467440737095516160n);
  });

  it('1/100', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({
        amount0: 100n,
        amount1: 1n,
        decimals0: 1,
        decimals1: 1,
      })
    ).toEqual(1844674407370955161n);
  });

  it('111/333', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({
        amount0: 111n,
        amount1: 333n,
        decimals0: 1,
        decimals1: 1,
      })
    ).toEqual(31950697969885030203n);
  });

  it('333/111', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({
        amount0: 333n,
        amount1: 111n,
        decimals0: 1,
        decimals1: 1,
      })
    ).toEqual(10650232656628343401n);
  });

  it('should decode the sqrt price x64 to price', () => {
    expect(
      PriceEncoder.decodeSqrtPriceX64ToPrice(
        PriceEncoder.encodeSqrtPriceX64({
          amount0: 100_000_000n,
          amount1: 2_500_000_000n,
          decimals0: 8,
          decimals1: 6,
        })
      ).toNumber()
    ).toEqual(2_500);
  });
});
