import { getEnv } from '../utils.script';
import { logSuccess, logError } from '@interest-protocol/logger';

import { TEST_SUI_TYPE, TEST_USDC_TYPE } from '../test-coins/constants';

(async () => {
  try {
    const { vortexSdk, suiClient, keypair } = await getEnv();

    const { tx } = await vortexSdk.newPoolAndShare({
      coinType: TEST_SUI_TYPE,
    });

    tx.setSender(keypair.toSuiAddress());

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
      options: {
        showEvents: true,
      },
    });

    logSuccess('new', result);
  } catch (error) {
    logError('new', error);
  }
})();
