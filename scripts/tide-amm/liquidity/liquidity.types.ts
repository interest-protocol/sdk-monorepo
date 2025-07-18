export interface USDCSuiPoolLiquidity {
  liquidity: string;
  tickSpacing: number;
  fee: number;
  currentTick: string;
  currentSqrtPrice: string;
  suiLiquidity: string;
  usdcLiquidity: string;
  price: string;
}

export interface GetAmountsForLiquidityParams {
  sqrtPriceX64: string;
  sqrtPriceAX64: string;
  sqrtPriceBX64: string;
  liquidity: string;
}
