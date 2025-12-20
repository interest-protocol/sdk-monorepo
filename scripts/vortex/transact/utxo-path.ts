import { getEnv } from '../utils.script';
import { deposit } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError, logInfo } from '@interest-protocol/logger';
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
    const getMerklePathFn = async (utxo: Utxo | null) =>
      getMerklePath(merkleTree, utxo);

    const vortexObjectId = suiVortexPoolObjectId;

    // Determine input UTXOs
    const inputUtxo0 =
      unspentUtxos.length > 0 && unspentUtxos[0]!.amount > 0n
        ? unspentUtxos[0]
        : new Utxo({
            amount: 0n,
            keypair: senderVortexKeypair,
            vortexPool: vortexObjectId,
          });

    const inputUtxo1 =
      unspentUtxos.length > 1 && unspentUtxos[1]!.amount > 0n
        ? unspentUtxos[1]
        : new Utxo({
            amount: 0n,
            keypair: senderVortexKeypair,
            vortexPool: vortexObjectId,
          });

    const merklePath0 = await getMerklePathFn(inputUtxo0 ?? null);

    logInfo('commitment0', inputUtxo0?.commitment());
    logInfo('payload0', inputUtxo0?.payload());
    logInfo('publicKey', senderVortexKeypair.publicKey);
    console.log('merklePath0:', merklePath0);
  } catch (error) {
    logError('deposit', error);
  }
})();
