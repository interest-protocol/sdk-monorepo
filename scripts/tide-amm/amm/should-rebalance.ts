import { logSuccess } from '@interest-protocol/logger';
import { TideSdk } from '@interest-protocol/tide-amm';

import { MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

// === Interfaces ===

const sdk = new TideSdk();

// Configuration
const DESIRED_SUI_AMOUNT = 150n * 1_000_000_000n; // 100 SUI in smallest units
const REBALANCE_THRESHOLD_BASIS_POINTS = 3_000n; // 30% threshold in basis points

(async () => {
  const { amount, action } = await sdk.shouldRebalance({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    desiredAmount: DESIRED_SUI_AMOUNT,
    thresholdBasisPoints: REBALANCE_THRESHOLD_BASIS_POINTS,
  });

  logSuccess('Rebalance Action', { amount, action });
})();
