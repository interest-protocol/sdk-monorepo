import { getEnv } from '../utils.script';
import { Transaction } from '@mysten/sui/transactions';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { keypair, relayerKeypair, recipientKeypair, suiClient, account } =
    await getEnv();

  const tx = new Transaction();

  // const gasRelayer = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000_000n)]);
  // const gasRecipient = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000_000n)]);
  const accountSui = tx.splitCoins(tx.gas, [tx.pure.u64(1_000n)]);

  // tx.transferObjects(
  //   [gasRelayer],
  //   tx.pure.address(relayerKeypair.toSuiAddress())
  // );

  // tx.transferObjects(
  //   [gasRecipient],
  //   tx.pure.address(recipientKeypair.toSuiAddress())
  // );

  tx.transferObjects([accountSui], tx.pure.address(account));

  tx.setSender(keypair.toSuiAddress());

  const result = await keypair.signAndExecuteTransaction({
    transaction: tx,
    client: suiClient,
  });

  logSuccess('fund', result);
})();
