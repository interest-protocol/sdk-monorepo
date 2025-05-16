import { Numberish } from '@/types';

export interface EncodeAmountsSqrtPriceX64Args {
  amount0: string;
  amount1: string;
}

export interface PriceFromAmountsArgs {
  amount0: Numberish;
  amount1: Numberish;
}

export interface GetLiquidityForAmount0Args {
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  amount0: Numberish;
}

export interface GetLiquidityForAmount1Args {
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  amount1: Numberish;
}

export interface GetLiquidityForAmountsArgs {
  sqrtPriceX64: Numberish;
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  amount0: Numberish;
  amount1: Numberish;
}

export interface GetAmount0ForLiquidityArgs {
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  liquidity: Numberish;
}

export interface GetAmount1ForLiquidityArgs {
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  liquidity: Numberish;
}

export interface GetAmountsForLiquidityArgs {
  sqrtPriceX64: Numberish;
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  liquidity: Numberish;
}
