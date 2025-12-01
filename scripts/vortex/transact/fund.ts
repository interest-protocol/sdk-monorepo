import { getEnv } from '../utils.script';
import { Transaction } from '@mysten/sui/transactions';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { keypair, relayerKeypair, recipientKeypair, suiClient } =
    await getEnv();

  const tx = new Transaction();

  const gasRelayer = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000_000n)]);
  // const gasRecipient = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000_000n)]);

  tx.transferObjects(
    [gasRelayer],
    tx.pure.address(
      '0x73c9dcc625ec28521d66ad5cf5652204175e9130782053fffd1d9431f0bbc01d'
    )
  );

  // tx.transferObjects(
  //   [gasRecipient],
  //   tx.pure.address(recipientKeypair.toSuiAddress())
  // );

  tx.setSender(keypair.toSuiAddress());

  const result = await keypair.signAndExecuteTransaction({
    transaction: tx,
    client: suiClient,
  });

  logSuccess('fund', result);
})();
