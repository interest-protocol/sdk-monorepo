import { getEnv } from '../utils.script';
import { Pool } from '@interest-protocol/vortex-sdk';

(async () => {
  const { adminSdk, executeTx } = await getEnv();

  const { vortex, tx } = adminSdk.newPool({ pool: Pool.shrimp });

  const tx2 = adminSdk.sharePool({
    tx,
    pool: vortex,
  });

  await executeTx(tx2);
})();
