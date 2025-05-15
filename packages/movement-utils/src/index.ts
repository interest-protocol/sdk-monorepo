import {
  Account,
  Aptos,
  Ed25519Account,
  Ed25519PrivateKey,
  InputGenerateTransactionPayloadData,
} from '@aptos-labs/ts-sdk';
import { movementMainnetClient } from '@interest-protocol/movement-core-sdk';
import invariant from 'tiny-invariant';

invariant(process.env.APTOS_PRIVATE_KEY, 'Private key missing');

const privateKey = new Ed25519PrivateKey(process.env.APTOS_PRIVATE_KEY);
export const account = Account.fromPrivateKey({ privateKey });

interface ExecuteTxArgs {
  data: InputGenerateTransactionPayloadData;
  client?: Aptos;
  account?: Ed25519Account;
}

export const executeTx = async ({
  data,
  client = movementMainnetClient,
}: ExecuteTxArgs) => {
  const transaction = await client.transaction.build.simple({
    sender: account.accountAddress,
    data,
  });

  const senderAuthenticator = await client.sign({
    signer: account,
    transaction,
  });

  const submittedTx = await client.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return client.waitForTransaction({
    transactionHash: submittedTx.hash,
  });
};
