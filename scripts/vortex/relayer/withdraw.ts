import { getEnv } from '../utils.script';
import { withdraw } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { getMerklePath } from '@interest-protocol/vortex-sdk';
import { Utxo } from '@interest-protocol/vortex-sdk';
import { getUnspentUtxosAndMerkleTree } from '../events';
import { Transaction } from '@mysten/sui/transactions';

(async () => {
  try {
    const {
      keypair,
      suiClient,
      vortexSdk,
      suiVortexPoolObjectId,
      relayerKeypair,
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
    const getMerklePathFn = async (utxo: Utxo | null) =>
      getMerklePath(merkleTree, utxo);

    const { tx: transaction, coin } = await withdraw({
      amount: 500000000n,
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      root: BigInt(root),
      getMerklePathFn,
      relayer: relayerKeypair.toSuiAddress(),
      relayerFee: 100000000n,
      unspentUtxos,
    });

    transaction.transferObjects(
      [coin],
      transaction.pure.address(keypair.toSuiAddress())
    );

    transaction.setSender(relayerKeypair.toSuiAddress());

    const txBytes = await transaction.build({
      client: suiClient,
    });

    // Rebuild in the server
    const rebuiltTransaction = await Transaction.from(txBytes);

    rebuiltTransaction.setSender(relayerKeypair.toSuiAddress());

    const result = await relayerKeypair.signAndExecuteTransaction({
      transaction: rebuiltTransaction,
      client: suiClient,
    });

    logSuccess('withdraw', result);
  } catch (error) {
    logError('withdraw', error);
  }
})();
