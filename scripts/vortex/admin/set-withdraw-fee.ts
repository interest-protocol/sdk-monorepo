import { getEnv } from '../utils.script';
import { Pool } from '@interest-protocol/vortex-sdk';

(async () => {
  const { adminSdk, executeTx, pools } = await getEnv();

  const tx = adminSdk.setWithdrawFee({
    pool: pools[Pool.shrimp].objectId,
    fee: 50,
  });

  await executeTx(tx);
})();
