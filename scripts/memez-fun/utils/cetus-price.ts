import { TickMath } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { logSuccess } from '@interest-protocol/logger';
import Decimal from 'decimal.js';

Decimal.config({
  precision: 64,
  rounding: Decimal.ROUND_DOWN,
  toExpNeg: -64,
  toExpPos: 64,
});

const TARGET_USD_MARKET_CAP = new Decimal(60_000);

const SUI_PRICE_USD = new Decimal(5);

const TOTAL_MEME_SUPPLY = new Decimal(1_000_000_000);

const memePriceInUsd = TARGET_USD_MARKET_CAP.div(TOTAL_MEME_SUPPLY);

const memePriceInSui = memePriceInUsd.div(SUI_PRICE_USD);

/*
  memePriceInUsd: 0.00006,
  memePriceInSui: 0.000012,
  priceInSqrtX64: 63901395939770060.40629260795585418174313090711434782392775384127
*/

logSuccess([
  'meme-price-in-usd',
  memePriceInUsd.toString(),
  'meme-price-in-sui',
  memePriceInSui.toString(),
  'price-in-sqrt-x64',
  TickMath.priceToSqrtPriceX64(memePriceInSui, 9, 9).toString(),
]);
