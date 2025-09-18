import { getEnv } from '../utils.script';
import { Pool } from '@interest-protocol/vortex-sdk';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { vortexSdk, executeTx } = await getEnv();

  const commitment = vortexSdk.generateRandomNote();

  const tx = await vortexSdk.deposit({
    commitment: commitment.commitment,
    pool: Pool.shrimp,
  });

  await executeTx(tx);

  logSuccess('commitment', commitment);
})();
