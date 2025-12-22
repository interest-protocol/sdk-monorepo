import { getEnv } from '../utils.script';
import { getUnspentUtxosWithApi } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';

(async () => {
  try {
    const { keypair, vortexSdk, testUSDCPoolObjectId, api, testUSDCType } =
      await getEnv();

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

    const [_, utxo0] = unspentUtxos;

    const response = await api.getMerklePath({
      coinType: testUSDCType,
      index: Number(utxo0?.index ?? 0),
      amount: utxo0?.amount.toString() ?? '0',
      publicKey: senderVortexKeypair.publicKey,
      blinding: utxo0?.blinding.toString() ?? '0',
      vortexPool: testUSDCPoolObjectId,
    });

    logSuccess('merklePath', response);
  } catch (error) {
    logError('withdraw', error);
  }
})();
