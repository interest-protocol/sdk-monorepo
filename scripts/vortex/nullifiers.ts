import { getEnv } from './utils.script';
import { getUnspentUtxos } from '@interest-protocol/vortex-sdk';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';

(async () => {
  try {
    const { vortex, suiClient, keypair } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    const commitmentEvents = await suiClient.queryEvents({
      query: {
        MoveEventType: vortex.newCommitmentEventType,
      },
      order: 'ascending',
    });

    const unspentUtxos = await getUnspentUtxos({
      vortex,
      vortexKeypair: senderVortexKeypair,
      commitmentEvents,
    });

    const areNullifiersSpent = await vortex.areNullifiersSpent([
      ...unspentUtxos.map((utxo) => utxo.nullifier()),
      1n,
    ]);

    logSuccess('nullifiers', areNullifiersSpent);
  } catch (error) {
    logError('nullifiers', error);
  }
})();
