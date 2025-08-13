import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const pool = await pumpSdk.getPumpPool(
    '0xf973a5e4df120288e617f6607bee130732d7690677184413a44f91f560578a25'
  );

  logSuccess(pool);
})();
