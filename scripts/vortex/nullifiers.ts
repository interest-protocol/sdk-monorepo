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

    const unspentUtxos = await getUnspentUtxos({
      vortexSdk,
      vortexKeypair: senderVortexKeypair,
      commitmentEvents,
      vortexPool: suiVortexPoolObjectId,
    });

    const areNullifiersSpent = await vortexSdk.areNullifiersSpent({
      nullifiers: unspentUtxos.map((utxo) => utxo.nullifier()),
      vortexPool: suiVortexPoolObjectId,
    });

    logSuccess('nullifiers', areNullifiersSpent);
  } catch (error) {
    logError('nullifiers', error);
  }
})();
