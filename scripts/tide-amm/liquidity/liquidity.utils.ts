import {
  getCoinAFromLiquidity,
  getCoinBFromLiquidity,
} from '@cetusprotocol/cetus-sui-clmm-sdk';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import { normalizeStructTag } from '@mysten/sui/utils';
import BN from 'bn.js';
import invariant from 'tiny-invariant';

import { GetAmountsForLiquidityParams } from './liquidity.types';

function orderSqrtPrice(sqrtPrice0X64: BN, sqrtPrice1X64: BN): [BN, BN] {
  if (sqrtPrice0X64.lt(sqrtPrice1X64)) {
    return [sqrtPrice0X64, sqrtPrice1X64];
  }
  return [sqrtPrice1X64, sqrtPrice0X64];
}

export const getAmountsForLiquidity = ({
  sqrtPriceX64,
  sqrtPriceAX64,
  sqrtPriceBX64,
  liquidity,
}: GetAmountsForLiquidityParams) => {
  const sqrtPriceX64BN = new BN(sqrtPriceX64);
  let sqrtPriceAX64BN = new BN(sqrtPriceAX64);
  let sqrtPriceBX64BN = new BN(sqrtPriceBX64);
  const liquidityBN = new BN(liquidity);

  [sqrtPriceAX64BN, sqrtPriceBX64BN] = orderSqrtPrice(
    sqrtPriceAX64BN,
    sqrtPriceBX64BN
  );

  return {
    amountA: getCoinAFromLiquidity(
      liquidityBN,
      sqrtPriceX64BN,
      sqrtPriceBX64BN,
      true
    ).toString(),
    amountB: getCoinBFromLiquidity(
      liquidityBN,
      sqrtPriceAX64BN,
      sqrtPriceX64BN,
      true
    ).toString(),
  };
};

export function parsePoolString(poolString: string) {
  const regex = /Pool<([^,]+),\s*([^>]+)>/;
  const match = poolString.match(regex);

  if (match?.length) {
    return {
      x: match[1]?.trim(),
      y: match[2]?.trim(),
    };
  }

  throw new Error('Invalid pool string format');
}

export const isSuiXCoin = (poolString: string) => {
  const { x, y } = parsePoolString(poolString);

  invariant(x && y, 'Invalid pool string format');

  return normalizeStructTag(x) === normalizeStructTag(SUI_TYPE_ARG);
};
