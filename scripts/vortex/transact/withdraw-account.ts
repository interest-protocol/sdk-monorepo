import { getEnv } from '../utils.script';
import {
  getMerklePath,
  withdrawWithAccount,
} from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';

import { getUnspentUtxosAndMerkleTree } from '../events';
import { Utxo } from '@interest-protocol/vortex-sdk';

(async () => {
  try {
    const {
      keypair,
      suiClient,
      vortexSdk,
      suiVortexPoolObjectId,
      account,
      secret,
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

    const { tx: transaction, coin } = await withdrawWithAccount({
      amount: 1000000000n,
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      root: BigInt(root),
      getMerklePathFn,
      relayer: '0x0',
      relayerFee: 0n,
      unspentUtxos,
      account: account,
      accountSecret: secret,
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

    logSuccess('withdraw', result);
  } catch (error) {
    logError('withdraw', error);
  }
})();
