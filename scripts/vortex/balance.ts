import { getEnv } from './utils.script';
import { getUnspentUtxos } from '@interest-protocol/vortex-sdk';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';

(async () => {
  try {
    const {
      vortexSdk,
      suiClient,
      keypair,
      suiVortexPoolObjectId,
      testUSDCType,
    } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    const commitmentEvents = await suiClient.queryEvents({
      query: {
        MoveEventType: vortexSdk.getNewCommitmentEvent(testUSDCType),
      },
      order: 'ascending',
    });

    const unspentUtxos = await getUnspentUtxos({
      vortexSdk,
      vortexKeypair: senderVortexKeypair,
      commitmentEvents,
      vortexPool: suiVortexPoolObjectId,
    });

    logSuccess(
      'balance',
      unspentUtxos.reduce((acc, utxo) => acc + utxo.amount, 0n)
    );
  } catch (error) {
    logError('balance', error);
  }
})();
