import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { configSdk, configKeys } = await getEnv();

  const fees = await configSdk.getFees({
    configurationKey: configKeys.XPUMP,
  });

  logSuccess('get-fees', fees);
})();
