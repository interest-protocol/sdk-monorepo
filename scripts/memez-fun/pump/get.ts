import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const pool = await pumpSdk.getPumpPool(
    '0x1e9e715a5db087372ebba09914ec353be2feab1b73593396a80778b0b1548c0e'
  );

  logSuccess(pool);
})();
