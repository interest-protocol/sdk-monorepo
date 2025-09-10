import { getSuiAmountIn } from '@interest-protocol/memez-fun-sdk';
import { logSuccess } from '@interest-protocol/logger';

// Current Blast settings

const POW_9 = 10n ** 9n;

// 13.5%
const LIQUIDITY_PROVISION_BPS = 1_350;

// 500 Sui
const VIRTUAL_LIQUIDITY = 500n * POW_9;

// 1 billion
const TOTAL_SUPPLY = 1_000_000_000n * POW_9;

const MEME_SWAP_FEE_BPS = 0;

const QUOTE_SWAP_FEE_BPS = 100;

const ALLOCATION_BPS = 300;

const MEME_REFERER_FEE_BPS = 0;

const QUOTE_REFERER_FEE_BPS = 10;

(async () => {
  // Amount of Sui needed to have 70% of the meme coin supply
  logSuccess(
    getSuiAmountIn({
      amountOut: (TOTAL_SUPPLY * 70n) / 100n,
      virtualLiquidity: VIRTUAL_LIQUIDITY,
      liquidityProvisionBps: LIQUIDITY_PROVISION_BPS,
      totalSupply: TOTAL_SUPPLY,
      memeSwapFeeBps: MEME_SWAP_FEE_BPS,
      quoteSwapFeeBps: QUOTE_SWAP_FEE_BPS,
      allocationBps: ALLOCATION_BPS,
      memeReferrerFeeBps: MEME_REFERER_FEE_BPS,
      quoteReferrerFeeBps: QUOTE_REFERER_FEE_BPS,
    })
  );
})();
