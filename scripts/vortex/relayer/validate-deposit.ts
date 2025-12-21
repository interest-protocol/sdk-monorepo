import { getEnv } from '../utils.script';
import {
  depositWithAccount,
  getMerklePath,
  Utxo,
  validateDepositWithAccountCommands,
} from '@interest-protocol/vortex-sdk';
import { logError, logInfo } from '@interest-protocol/logger';
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

    const root = await merkleTree.root;
    const getMerklePathFn = async (utxo: Utxo | null) => ({
      path: getMerklePath(merkleTree, utxo),
      root: BigInt(root),
    });

    const { tx: transaction, coin } = await depositWithAccount({
      coinStructs: coins.data,
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      getMerklePathFn,
      unspentUtxos,
      account: account,
      accountSecret: secret,
      relayer: relayerKeypair.toSuiAddress(),
      relayerFee: 100000000n,
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

    const transactionJson = JSON.parse(
      await rebuiltTransaction.toJSON()
    ) as TransactionJson;

    validateDepositWithAccountCommands(transactionJson.commands);

    logInfo('Transaction commands validated successfully');
  } catch (error) {
    logError('deposit', error);
  }
})();
