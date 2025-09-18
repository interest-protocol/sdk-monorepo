import { getEnv } from '../utils.script';
import { Pool } from '@interest-protocol/vortex-sdk';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { vortexSdk } = await getEnv();

  const root = await vortexSdk.root(Pool.shrimp);

  logSuccess('Root', root);
})();
