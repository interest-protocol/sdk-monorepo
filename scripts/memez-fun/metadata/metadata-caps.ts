import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, keypair } = await getEnv();

  const caps = await pumpSdk.getMetadataCaps({
    owner: keypair.toSuiAddress(),
  });

  logSuccess(caps);
})();
