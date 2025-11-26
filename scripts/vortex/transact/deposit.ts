import { getEnv } from '../utils.script';
import { deposit, emptyMerkleTree } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';

(async () => {
  try {
    const { keypair, vortex, suiClient, VortexKeypair } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    const transaction = await deposit({
      amount: 1_000n,
      vortex,
      vortexKeypair: senderVortexKeypair,
      merkleTree: emptyMerkleTree,
    });

    transaction.setSender(keypair.toSuiAddress());

    const result = await keypair.signAndExecuteTransaction({
      transaction,
      client: suiClient,
    });

    logSuccess('deposit', result);
  } catch (error) {
    logError('deposit', error);
  }
})();
