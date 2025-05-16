import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';
(async () => {
  const { pumpSdk } = await getEnv();

  const env = pumpSdk.env();

  logSuccess('env', env);
})();
