import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const pool = await pumpSdk.getPumpPool(
    '0x5b16d4ab321c41ed841c8f14fa166021770ba0920766b448e1f534b623ccb6a6'
  );

  logSuccess({
    pool,
  });
})();
