import { logSuccess } from '@interest-protocol/logger';
import { TideSdk } from '@interest-protocol/tide-amm';

import { SUI_USDC_POOL } from '../utils.script';

// === Interfaces ===

const sdk = new TideSdk();

// Configuration
const DESIRED_SUI_AMOUNT = 5n * 10n ** 9n; // 100 SUI in smallest units
const REBALANCE_THRESHOLD_BASIS_POINTS = 2_000n; // 30% threshold in basis points

(async () => {
  const { amount, action } = await sdk.shouldRebalance({
    pool: SUI_USDC_POOL,
    desiredAmount: DESIRED_SUI_AMOUNT,
    thresholdBasisPoints: REBALANCE_THRESHOLD_BASIS_POINTS,
  });

  logSuccess('Rebalance Action', { amount, action });
})();
