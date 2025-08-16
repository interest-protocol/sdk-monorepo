import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { pumpSdk, executeTx, testnetPoolId, keypair } = await getEnv();

  const quoteCoin = coinWithBalance({
    balance: 2700 * 1_000_000_000,
    type: '0xfd35b96db6d0eb23b8dc4eae97d330d8de85d36ee6a9ab0b35dcb2b7b86cd22a::fake_sui::FAKE_SUI',
  });

  const { memeCoin, tx: tx2 } = await pumpSdk.pump({
    pool: testnetPoolId,
    quoteCoin,
    tx,
  });

  tx2.transferObjects([memeCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
