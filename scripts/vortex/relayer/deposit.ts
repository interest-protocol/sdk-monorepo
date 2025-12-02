import { getEnv } from '../utils.script';
import { depositWithAccount } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { getUnspentUtxosAndMerkleTree } from '../events';
import { Transaction } from '@mysten/sui/transactions';

(async () => {
  try {
    const {
      keypair,
      vortexSdk,
      suiClient,
      VortexKeypair,
      suiVortexPoolObjectId,
      relayerKeypair,
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

    const coins = await suiClient.getCoins({
      owner: account,
      coinType: '0x2::sui::SUI',
    });

    const { tx: transaction, coin } = await depositWithAccount({
      coinStructs: coins.data,
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      merkleTree,
      unspentUtxos,
      account: account,
      accountSecret: secret,
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

    // Relayer deposits
    const result = await relayerKeypair.signAndExecuteTransaction({
      transaction: rebuiltTransaction,
      client: suiClient,
    });

    logSuccess('deposit', result);
  } catch (error) {
    logError('deposit', error);
  }
})();
