import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const pool = await pumpSdk.getPumpPool(
    '0x0c89f1a98dfe0db1b983310d09310fc4159b547ef3f440be65a15870e8534271'
  );

  logSuccess(pool);
})();
