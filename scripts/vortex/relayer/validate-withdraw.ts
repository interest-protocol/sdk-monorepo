import { getEnv } from '../utils.script';
import { withdraw } from '@interest-protocol/vortex-sdk';
import { logError, logInfo } from '@interest-protocol/logger';
import {
  VortexKeypair,
  getMerklePath,
  validateWithdrawCommands,
} from '@interest-protocol/vortex-sdk';
import { Utxo } from '@interest-protocol/vortex-sdk';
import { getUnspentUtxosAndMerkleTree } from '../events';
import { Transaction } from '@mysten/sui/transactions';

interface TransactionJson {
  version: number;
  sender: string;
  expiration: { None: boolean };
  gasData: {
    budget: string;
    price: string;
    owner: string;
    payment: object[];
  };
  inputs: object[];
  commands: object[];
  digest: string;
}

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
    const getMerklePathFn = async (utxo: Utxo | null) => ({
      path: getMerklePath(merkleTree, utxo),
      root: BigInt(root),
    });

    const { tx: transaction, coin } = await withdraw({
      amount: 500000000n,
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
      vortexKeypair: senderVortexKeypair,
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

    const transactionJson = JSON.parse(
      await rebuiltTransaction.toJSON()
    ) as TransactionJson;

    validateWithdrawCommands(transactionJson.commands);

    logInfo('validate-withdraw', 'Transaction commands validated successfully');
  } catch (error) {
    logError(
      'validate-withdraw',
      'Error validating transaction commands',
      error
    );
  }
})();
