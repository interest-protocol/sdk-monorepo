import {
  PACKAGES,
  VolatilePool,
  WHITELISTED_CURVE_LP_COINS,
} from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const pool = await curveMainnetSDK.getPool(
    WHITELISTED_CURVE_LP_COINS.USDCe_MOVE_VOLATILE.toString()
  );

  const volatileData = pool.data as VolatilePool;

  const data = {
    function: `${PACKAGES.mainnet.address.toString()}::volatile_pool::commit_parameters`,
    functionArguments: [
      pool.address.toString(),
      20000000n,
      25000000n,
      BigInt(volatileData.fees.adminFee),
      BigInt(volatileData.fees.gammaFee),
      BigInt(volatileData.rebalancingParams.extraProfit),
      BigInt(volatileData.rebalancingParams.adjustmentStep),
      BigInt(volatileData.rebalancingParams.maHalfTime),
    ],
  } as any;

  const transactionResponse = await executeTx({ data });

  logSuccess('commit-volatile-fee', transactionResponse.hash);
})();
