import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const pool = await pumpSdk.getPumpPool(
    '0x0b1107ddfc938e2fcd420ee2aa8a01784fab8c3b4d29e49329884d8f097f52ce'
  );

  logSuccess({
    pool,
  });
})();
