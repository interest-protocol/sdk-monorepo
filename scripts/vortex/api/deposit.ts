import { getEnv } from '../utils.script';
import { depositWithAccount } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { getUnspentUtxosAndMerkleTree } from '../events';
import { SUI_TYPE_ARG, toHex } from '@mysten/sui/utils';
import { Utxo } from '@interest-protocol/vortex-sdk';

(async () => {
  try {
    const {
      keypair,
      vortexSdk,
      suiClient,
      VortexKeypair,
      suiVortexPoolObjectId,
      account,
      secret,
      api,
      apiKey,
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

    const coins = await suiClient.getCoins({
      owner: account,
      coinType: '0x2::sui::SUI',
    });

    const getMerklePathFn = async (utxo: Utxo | null) => {
      const response = await api.getMerklePath({
        coinType: SUI_TYPE_ARG,
        index: Number(utxo?.index ?? 0),
        amount: utxo?.amount.toString() ?? '0',
        publicKey: senderVortexKeypair.publicKey,
        blinding: utxo?.blinding.toString() ?? '0',
        vortexPool: suiVortexPoolObjectId,
      });

      return {
        path: response?.data.path ?? [],
        root: BigInt(response?.data.root ?? '0'),
      };
    };

    const relayer = await api.getRelayer();

    const { tx: transaction, coin } = await depositWithAccount({
      coinStructs: coins.data,
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      getMerklePathFn,
      unspentUtxos,
      account: account,
      accountSecret: secret,
      relayer: relayer.data.address,
      relayerFee: 1000n,
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
      apiKey,
    });

    await suiClient.waitForTransaction({
      digest: digest.data.digest,
    });

    const result = await suiClient.getTransactionBlock({
      digest: digest.data.digest,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    logSuccess('deposit', result);
  } catch (error) {
    logError('deposit', error);
  }
})();
