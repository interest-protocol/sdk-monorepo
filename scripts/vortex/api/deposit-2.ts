import { getEnv } from '../utils.script';

import { logError, logSuccess } from '@interest-protocol/logger';
import { SUI_TYPE_ARG, toHex } from '@mysten/sui/utils';
import { Utxo, deposit } from '@interest-protocol/vortex-sdk';
import invariant from 'tiny-invariant';

(async () => {
  try {
    const {
      api,
      VortexKeypair,
      keypair,
      apiKey,
      suiClient,
      suiVortexPoolObjectId,
      vortexSdk,
    } = await getEnv();

    const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      (message) => keypair.signPersonalMessage(message)
    );

    const commitments = await api.getAllCommitments({
      coinType: SUI_TYPE_ARG,
      index: 0,
      op: 'gte',
      apiKey,
    });

    console.log(commitments.length);

    const utxos = [] as Utxo[];

    commitments.forEach((commitment) => {
      try {
        const utxo = senderVortexKeypair.decryptUtxo(
          toHex(Uint8Array.from(commitment.encryptedOutput))
        );

        utxos.push(
          new Utxo({
            ...utxo,
            keypair: senderVortexKeypair,
          })
        );
      } catch (e) {
        console.log('not my utxo', e);
      }
    });

    const getMerklePathFn = async (utxo: Utxo | null) => {
      invariant(utxo, 'UTXO not found');

      const response = await api.getMerklePath({
        coinType: SUI_TYPE_ARG,
        index: Number(utxo.index),
        amount: utxo.amount.toString(),
        publicKey: senderVortexKeypair.publicKey,
        blinding: utxo?.blinding.toString(),
        vortexPool: utxo.vortexPool,
      });

      return {
        path: response?.data.path ?? [],
        root: BigInt(response?.data.root ?? '0'),
      };
    };

    const { tx: transaction, coin } = await deposit({
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      getMerklePathFn,
      unspentUtxos: utxos,
      amount: 10000n,
    });

    transaction.transferObjects(
      [coin],
      transaction.pure.address(keypair.toSuiAddress())
    );

    transaction.setSender(keypair.toSuiAddress());

    const result = await suiClient.signAndExecuteTransaction({
      transaction,
      signer: keypair,
      options: {
        showEffects: true,
      },
    });

    logSuccess('deposit', result);
  } catch (error) {
    logError('balance', error);
  }
})();
