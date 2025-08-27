import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const pool = await pumpSdk.getPumpPool(
    '0x7bb6af7618693ae6eef994eb76a595abdc7d0c156370ecebf65960d8a950d416'
  );

  logSuccess({
    pool,
  });
})();
