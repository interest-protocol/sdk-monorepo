import { getEnv } from '../utils.script';
import { withdraw } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';

import { getUnspentUtxosAndMerkleTree } from '../events';

(async () => {
  try {
    const { keypair, suiClient, vortex } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    // @dev Should come from the indexer
    const { unspentUtxos, merkleTree } = await getUnspentUtxosAndMerkleTree({
      suiClient,
      vortex,
      senderVortexKeypair,
    });

    const transaction = await withdraw({
      amount: 500n,
      vortex,
      vortexKeypair: senderVortexKeypair,
      merkleTree,
      recipient: keypair.toSuiAddress(),
      relayer: '0x0',
      relayerFee: 0n,
      unspentUtxos,
    });

    transaction.setSender(keypair.toSuiAddress());

    const result = await keypair.signAndExecuteTransaction({
      transaction,
      client: suiClient,
    });

    logSuccess('withdraw', result);
  } catch (error) {
    logError('withdraw', error);
  }
})();
