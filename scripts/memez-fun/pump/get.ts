import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const pool = await pumpSdk.getPumpPool(
    '0xeb21f5b738faf4948e7f0b9b2b760ce0147cf39f4a18b41fe40537cc1d36e373'
  );

  logSuccess(pool);
})();
