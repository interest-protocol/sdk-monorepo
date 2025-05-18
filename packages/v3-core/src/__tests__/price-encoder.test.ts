import { PriceEncoder } from '@/math';

import { Q64 } from '../constants';

describe(PriceEncoder.encodeSqrtPriceX64.name, () => {
  it('should encode the sqrt price x64', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({ amount0: 1n, amount1: 1n })
    ).toEqual(BigInt(Q64.toString()));
  });

  it('100/1', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({ amount0: 1n, amount1: 100n })
    ).toEqual(184467440737095516160n);
  });

  it('1/100', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({ amount0: 100n, amount1: 1n })
    ).toEqual(1844674407370955161n);
  });

  it('111/333', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({ amount0: 111n, amount1: 333n })
    ).toEqual(31950697969885030203n);
  });

  it('333/111', () => {
    expect(
      PriceEncoder.encodeSqrtPriceX64({ amount0: 333n, amount1: 111n })
    ).toEqual(10650232656628343401n);
  });
});
