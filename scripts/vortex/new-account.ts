import { getEnv } from './utils.script';
import { logSuccess, logError } from '@interest-protocol/logger';
import { poseidon1 } from '@interest-protocol/vortex-sdk';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

(async () => {
  try {
    const { vortexSdk, suiClient, keypair } = await getEnv();

    const secret = 12345n;
    const hashedSecret = poseidon1(secret);

    const { tx, account } = await vortexSdk.newAccount({
      hashedSecret,
    });

    tx.setSender(keypair.toSuiAddress());

    tx.moveCall({
      package: vortexSdk.packageId,
      module: 'vortex_account',
      function: 'share',
      arguments: [account],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
      options: {
        showEvents: true,
      },
    });

    logSuccess('new-account', result);
  } catch (error) {
    logError('new-account', error);
  }
})();
