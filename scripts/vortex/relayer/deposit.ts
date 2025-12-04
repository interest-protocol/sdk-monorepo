import { getEnv } from '../utils.script';
import { depositWithAccount } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { getUnspentUtxosAndMerkleTree } from '../events';
import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';
import { VORTEX_PACKAGE_ID } from '@interest-protocol/vortex-sdk';

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

interface MoveCall {
  package: string;
  module: string;
  function: string;
  typeArguments: string[];
  arguments: object[];
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

    const { tx: transaction, coin } = await depositWithAccount({
      coinStructs: coins.data,
      vortexSdk,
      vortexPool: suiVortexPoolObjectId,
      vortexKeypair: senderVortexKeypair,
      merkleTree,
      unspentUtxos,
      account: account,
      accountSecret: secret,
      relayer: relayerKeypair.toSuiAddress(),
      relayerFee: 300_000_000n,
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

    invariant(
      transactionJson.commands.length === 5,
      'Transaction commands must be exactly 7'
    );

    const moveCalls = transactionJson.commands
      .filter((command) => 'MoveCall' in command)
      .map((command) => {
        const moveCall = command as unknown as { MoveCall: MoveCall };
        return `${moveCall.MoveCall.package}::${moveCall.MoveCall.module}::${moveCall.MoveCall.function}`;
      });

    invariant(moveCalls.length === 3, 'Transaction commands must be exactly 3');

    invariant(
      moveCalls.find(
        (call) => call === `${VORTEX_PACKAGE_ID}::vortex::transact`
      ) === undefined,
      'Transaction commands must not contain vortex::transact'
    );

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
