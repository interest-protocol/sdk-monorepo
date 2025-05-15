import { logSuccess } from '@interest-protocol/sui-utils';

import { getEnv } from '../utils.script';

(async () => {
  const { configSdk, configKeys } = await getEnv();

  const fees = await configSdk.getFees({
    configurationKey: configKeys.MEMEZ,
  });

  logSuccess(fees);
})();
