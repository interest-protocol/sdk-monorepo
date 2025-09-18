import { getEnv } from '../utils.script';
import { Pool } from '@interest-protocol/vortex-sdk';

(async () => {
  const { adminSdk, executeTx } = await getEnv();

  const { vortex, tx } = adminSdk.newPool({ pool: Pool.shrimp });

  const { tx: tx2, vortex: vortex2 } = adminSdk.newPool({
    tx,
    pool: Pool.whale,
  });

  const { tx: tx3, vortex: vortex3 } = adminSdk.newPool({
    tx: tx2,
    pool: Pool.dolphin,
  });

  const tx4 = adminSdk.sharePool({
    tx: tx3,
    pool: vortex,
  });

  const tx5 = adminSdk.sharePool({
    tx: tx4,
    pool: vortex2,
  });

  const tx6 = adminSdk.sharePool({
    tx: tx5,
    pool: vortex3,
  });

  await executeTx(tx6);
})();
