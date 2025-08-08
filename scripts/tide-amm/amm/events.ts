import { logSuccess } from '@interest-protocol/logger';
import { suiClient } from '@interest-protocol/sui-utils';
import { TideSdk, TIDE_AMM_PACKAGE } from '@interest-protocol/tide-amm';

import { SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const events = await suiClient.queryEvents({
    query: {
      MoveModule: {
        module: 'tide_amm',
        package: TIDE_AMM_PACKAGE,
      },
    },
  });

  logSuccess('Events', events);
})();
