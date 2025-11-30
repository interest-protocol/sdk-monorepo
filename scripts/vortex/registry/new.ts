import { getEnv } from '../utils.script';
import { logSuccess, logError } from '@interest-protocol/logger';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

(async () => {
  try {
    const { vortexSdk, suiClient, keypair } = await getEnv();

    const { tx } = await vortexSdk.newPoolAndShare({
      coinType: SUI_TYPE_ARG,
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
