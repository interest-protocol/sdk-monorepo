import { getEnv } from './utils.script';
import { getUnspentUtxos } from '@interest-protocol/vortex-sdk';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

(async () => {
  try {
    const { vortexSdk, suiClient, keypair, suiVortexPoolObjectId } =
      await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    const commitmentEvents = await suiClient.queryEvents({
      query: {
        MoveEventType: vortexSdk.getNewCommitmentEvent(SUI_TYPE_ARG),
      },
      order: 'ascending',
    });

    commitmentEvents.data.forEach((event) => {
      console.log('event', event.parsedJson);
      console.log(typeof (event.parsedJson as any).encrypted_output);
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
