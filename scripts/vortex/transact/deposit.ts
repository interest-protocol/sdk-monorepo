import { getEnv } from '../utils.script';
import { deposit } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { getUnspentUtxosAndMerkleTree } from '../events';
import { getMerklePath } from '@interest-protocol/vortex-sdk';
import { Utxo } from '@interest-protocol/vortex-sdk';

(async () => {
  try {
    const {
      keypair,
      vortexSdk,
      suiClient,
      VortexKeypair,
      suiVortexPoolObjectId,
    } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    // @dev Should come from the indexer
    const { unspentUtxos, merkleTree } = await getUnspentUtxosAndMerkleTree({
      suiClient,
      vortexSdk,
      suiVortexPoolObjectId,
      senderVortexKeypair,
    });

    const root = await merkleTree.root;
    const getMerklePathFn = async (utxo: Utxo | null) => ({
      path: getMerklePath(merkleTree, utxo),
      root: BigInt(root),
    });

    const { tx: transaction, coin } = await deposit({
      amount: 2_000_000_000n,
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      getMerklePathFn,
      unspentUtxos,
    });

    transaction.transferObjects(
      [coin],
      transaction.pure.address(keypair.toSuiAddress())
    );

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
