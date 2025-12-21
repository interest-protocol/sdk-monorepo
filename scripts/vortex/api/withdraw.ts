import { getEnv } from '../utils.script';
import {
  withdraw,
  getUnspentUtxosWithApi,
} from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { Utxo } from '@interest-protocol/vortex-sdk';
import { toHex } from '@mysten/sui/utils';

(async () => {
  try {
    const {
      keypair,
      suiClient,
      vortexSdk,
      testUSDCPoolObjectId,
      relayerKeypair,
      api,
      testUSDCType,
    } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    const commitments = await api.getCommitments({
      coinType: testUSDCType,
      index: 0,
    });

    // @dev Should come from the indexer
    const unspentUtxos = await getUnspentUtxosWithApi({
      vortexSdk,
      vortexPool: testUSDCPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      commitments: commitments.data.items,
    });

    const getMerklePathFn = async (utxo: Utxo | null) => {
      const response = await api.getMerklePath({
        coinType: testUSDCType,
        index: Number(utxo?.index ?? 0),
        amount: utxo?.amount.toString() ?? '0',
        publicKey: senderVortexKeypair.publicKey,
        blinding: utxo?.blinding.toString() ?? '0',
        vortexPool: testUSDCPoolObjectId,
      });

      return {
        path: response?.data.path ?? [],
        root: BigInt(response?.data.root ?? '0'),
      };
    };

    const relayer = await api.getRelayer();

    const { tx: transaction, coin } = await withdraw({
      amount: 2000000n,
      vortexSdk,
      vortexPool: testUSDCPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      getMerklePathFn,
      relayer: relayer.data.address,
      relayerFee: 1000000n,
      unspentUtxos,
    });

    transaction.transferObjects(
      [coin],
      transaction.pure.address(keypair.toSuiAddress())
    );

    transaction.setSender(relayer.data.address);

    const txBytes = await transaction.build({
      client: suiClient,
    });

    const digest = await api.executeTransaction({
      txBytes: toHex(txBytes),
    });

    const result = await suiClient.getTransactionBlock({
      digest: digest.data.digest,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    logSuccess('withdraw', result);
  } catch (error) {
    logError('withdraw', error);
  }
})();
