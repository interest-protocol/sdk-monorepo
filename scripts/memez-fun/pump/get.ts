import { logSuccess } from '@interest-protocol/utils';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const r = await pumpSdk.getPumpPool(testnetPoolId);

  logSuccess(r);
})();
