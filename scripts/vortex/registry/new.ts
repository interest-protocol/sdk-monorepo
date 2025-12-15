import { getEnv } from '../utils.script';
import { logSuccess, logError } from '@interest-protocol/logger';

(async () => {
  try {
    const { vortexSdk, suiClient, keypair, testUSDCType } = await getEnv();

    const { tx } = await vortexSdk.newPoolAndShare({
      coinType: testUSDCType,
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
